import { type NextRequest, NextResponse } from "next/server";
import { clearAuthCookies, openweb3GatewayId } from "@/lib/services/utils";

interface EmailChangeRequest {
	initDataRaw: string;
	oldEmail: string;
	newEmail: string;
}

const EMAIL_CHANGE_MUTATION = `
	mutation TelegramEmailChangeRequest($initDataRaw: String!, $oldEmail: String!, $newEmail: String!) {
		telegramEmailChangeRequest(initDataRaw: $initDataRaw, oldEmail: $oldEmail, newEmail: $newEmail) {
			user {
				email
				firstName
				lastName
			}
			success
			targetEmail
			expiresAt
			errors {
				field
				message
				code
			}
		}
	}
`;

interface EmailChangeResponse {
	user?: {
		email?: string;
		firstName?: string;
		lastName?: string;
	};
	success?: boolean;
	targetEmail?: string;
	expiresAt?: string;
	errors?: Array<{
		field?: string;
		message?: string;
		code?: string;
	}>;
}

interface GraphQLResponse {
	data?: {
		telegramEmailChangeRequest?: EmailChangeResponse;
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
		targetEmail?: string;
		expiresAt?: string;
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

		const body = (await request.json()) as EmailChangeRequest;
		const { initDataRaw, oldEmail, newEmail } = body;

		if (!initDataRaw) {
			// Only clear cookies when initDataRaw validation fails
			await clearAuthCookies();
			return NextResponse.json({
				code: -1,
				message: "initDataRaw is required",
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

		// 调用Saleor API执行telegramEmailChangeRequest mutation
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
				query: EMAIL_CHANGE_MUTATION,
				variables: { initDataRaw, oldEmail, newEmail },
			}),
		});

		if (!response.ok) {
			return NextResponse.json({
				code: -1,
				message: "Failed to request email change with Saleor",
			} as ApiResponse);
		}

		const result = (await response.json()) as GraphQLResponse;
		const emailChangeResult = result.data?.telegramEmailChangeRequest;

		if (!emailChangeResult) {
			return NextResponse.json({
				code: -1,
				message: "Invalid response from Saleor",
			} as ApiResponse);
		}

		const { user, success, targetEmail, expiresAt, errors } = emailChangeResult;

		// 检查是否有错误
		if (errors && errors.length > 0) {
			return NextResponse.json({
				code: -1,
				message: "Email change request failed",
				data: { errors },
			} as ApiResponse);
		}

		if (!success) {
			return NextResponse.json({
				code: -1,
				message: "Email change request was not successful",
			} as ApiResponse);
		}

		return NextResponse.json({
			code: 0,
			message: "Email change request successful",
			data: {
				user,
				success,
				targetEmail,
				expiresAt,
			},
		} as ApiResponse);
	} catch (error) {
		console.error("Email change request error:", error);
		return NextResponse.json({
			code: -1,
			message: "Internal server error",
		} as ApiResponse);
	}
}
