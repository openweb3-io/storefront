import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { clearAuthCookies, openweb3GatewayId } from "@/lib/services/utils";

interface AuthRequest {
	initDataRaw: string;
}

const AUTH_MUTATION = `
	mutation telegramTokenCreate($initDataRaw: String!) {
		telegramTokenCreate(initDataRaw: $initDataRaw) {
			token
			refreshToken
			csrfToken
			user {
				email
				firstName
				lastName
			}
			errors {
				field
				message
				code
			}
		}
	}
`;

interface AuthResponse {
	token?: string;
	refreshToken?: string;
	csrfToken?: string;
	user?: {
		email?: string;
		firstName?: string;
		lastName?: string;
	};
	errors?: Array<{
		field?: string;
		message?: string;
		code?: string;
	}>;
}

interface GraphQLResponse {
	data?: {
		telegramTokenCreate?: AuthResponse;
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

		const body = (await request.json()) as AuthRequest;
		const { initDataRaw } = body;

		if (!initDataRaw) {
			// Only clear cookies when initDataRaw validation fails
			await clearAuthCookies();
			return NextResponse.json({
				code: -1,
				message: "initDataRaw is required",
			} as ApiResponse);
		}

		// Call Saleor API to execute telegramTokenCreate mutation
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
				query: AUTH_MUTATION,
				variables: { initDataRaw },
			}),
		});

		if (!response.ok) {
			return NextResponse.json({
				code: -1,
				message: "Failed to authenticate with Saleor",
			} as ApiResponse);
		}

		const result = (await response.json()) as GraphQLResponse;
		const authResult = result.data?.telegramTokenCreate;

		if (!authResult) {
			return NextResponse.json({
				code: -1,
				message: "Invalid response from Saleor",
			} as ApiResponse);
		}

		const { token, refreshToken, csrfToken, user, errors } = authResult;

		// Check for errors
		if (errors && errors.length > 0) {
			return NextResponse.json({
				code: -1,
				message: "Authentication failed",
				data: { errors },
			} as ApiResponse);
		}

		if (!token || !refreshToken) {
			return NextResponse.json({
				code: -1,
				message: "No token received",
			} as ApiResponse);
		}

		// Get current domain
		const host = request.headers.get("host") || "";
		const domain = host;

		// Set cookie options
		const cookieOptions = {
			path: "/",
			httpOnly: true,
			domain,
			secure: true,
			expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // Valid for 1 day
		};

		// Set cookies
		const cookieStore = await cookies();

		cookieStore.set(`${saleorApiUrl}+saleor_auth_access_token`, token, cookieOptions);
		cookieStore.set(`${saleorApiUrl}+saleor_auth_module_refresh_token`, refreshToken, cookieOptions);
		cookieStore.set(`${saleorApiUrl}+saleor_auth_module_auth_state`, "signedIn", cookieOptions);

		// If there is a CSRF token, set it as well
		if (csrfToken) {
			cookieStore.set(`${saleorApiUrl}+saleor_auth_module_csrf_token`, csrfToken, cookieOptions);
		}

		return NextResponse.json({
			code: 0,
			message: "Authentication successful",
			data: {
				user,
				token,
				refreshToken,
				csrfToken,
			},
		} as ApiResponse);
	} catch (error) {
		console.error("auth error:", error);
		await clearAuthCookies();
		return NextResponse.json({
			code: -1,
			message: "Internal server error",
		} as ApiResponse);
	}
}
