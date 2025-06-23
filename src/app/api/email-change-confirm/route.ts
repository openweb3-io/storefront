import { type NextRequest, NextResponse } from "next/server";
import { clearAuthCookies, openweb3GatewayId } from "@/lib/services/utils";

interface EmailChangeConfirmRequest {
	initDataRaw: string;
	verificationCode: string;
	oldEmail: string;
	newEmail: string;
}

const EMAIL_CHANGE_CONFIRM_MUTATION = `
	mutation TelegramEmailChangeConfirm(
		$initDataRaw: String!
		$verificationCode: String!
		$oldEmail: String!
		$newEmail: String!
	) {
		telegramEmailChangeConfirm(
			initDataRaw: $initDataRaw
			verificationCode: $verificationCode
			oldEmail: $oldEmail
			newEmail: $newEmail
		) {
			user {
				email
				firstName
				lastName
			}
			success
			errors {
				field
				message
				code
			}
		}
	}
`;

interface EmailChangeConfirmResponse {
	user?: {
		email?: string;
		firstName?: string;
		lastName?: string;
	};
	success?: boolean;
	errors?: Array<{
		field?: string;
		message?: string;
		code?: string;
	}>;
}

interface GraphQLResponse {
	data?: {
		telegramEmailChangeConfirm?: EmailChangeConfirmResponse;
	};
	errors?: Array<{
		message: string;
	}>;
}

interface ApiResponse {
	code: number;
	message: string;
	data?: {
		user?: {
			email?: string;
			firstName?: string;
			lastName?: string;
		};
		success?: boolean;
		[key: string]: any;
	};
}

export async function POST(request: NextRequest) {
	try {
		// Validate platform header
		const platform = request.headers.get("platform");
		if (platform !== openweb3GatewayId) {
			return NextResponse.json({
				code: -1,
				message: "Invalid platform",
			} as ApiResponse);
		}

		const body = (await request.json()) as EmailChangeConfirmRequest;
		const { initDataRaw, verificationCode, oldEmail, newEmail } = body;

		if (!initDataRaw) {
			// Only clear cookies when initDataRaw validation fails
			await clearAuthCookies();
			return NextResponse.json({
				code: -1,
				message: "initDataRaw is required",
			} as ApiResponse);
		}

		if (!verificationCode) {
			return NextResponse.json({
				code: -1,
				message: "verificationCode is required",
			} as ApiResponse);
		}

		if (!oldEmail) {
			return NextResponse.json({
				code: -1,
				message: "oldEmail is required",
			} as ApiResponse);
		}

		if (!newEmail) {
			return NextResponse.json({
				code: -1,
				message: "newEmail is required",
			} as ApiResponse);
		}

		// Call Saleor API to execute telegramEmailChangeConfirm mutation
		const saleorApiUrl = process.env.NEXT_PUBLIC_SALEOR_API_URL;
		if (!saleorApiUrl) {
			return NextResponse.json({
				code: -1,
				message: "Saleor API URL not configured",
			} as ApiResponse);
		}

		const response = await fetch(saleorApiUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				query: EMAIL_CHANGE_CONFIRM_MUTATION,
				variables: { initDataRaw, verificationCode, oldEmail, newEmail },
			}),
		});

		if (!response.ok) {
			return NextResponse.json({
				code: -1,
				message: "Failed to confirm email change with Saleor",
			} as ApiResponse);
		}

		const result = (await response.json()) as GraphQLResponse;
		const emailChangeConfirmResult = result.data?.telegramEmailChangeConfirm;

		if (!emailChangeConfirmResult) {
			return NextResponse.json({
				code: -1,
				message: "Invalid response from Saleor",
			} as ApiResponse);
		}

		const { user, success, errors } = emailChangeConfirmResult;

		// Check for errors
		if (errors && errors.length > 0) {
			return NextResponse.json({
				code: -1,
				message: "Email change confirmation failed",
				data: { errors },
			} as ApiResponse);
		}

		if (!success) {
			return NextResponse.json({
				code: -1,
				message: "Email change confirmation was not successful",
			} as ApiResponse);
		}

		return NextResponse.json({
			code: 0,
			message: "Email change confirmed successfully",
			data: {
				user,
				success,
			},
		} as ApiResponse);
	} catch (error) {
		console.error("Email change confirm error:", error);
		return NextResponse.json({
			code: -1,
			message: "Internal server error",
		} as ApiResponse);
	}
}
