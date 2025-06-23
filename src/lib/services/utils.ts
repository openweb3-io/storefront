import { cookies } from "next/headers";

// Openweb3 Gateway ID constant
export const openweb3GatewayId = "app.saleor.openweb3";

// Helper function: clear authentication-related cookies
export async function clearAuthCookies() {
	const cookieStore = await cookies();
	const saleorApiUrl = process.env.NEXT_PUBLIC_SALEOR_API_URL;
	if (saleorApiUrl) {
		cookieStore.delete(`${saleorApiUrl}+saleor_auth_access_token`);
		cookieStore.delete(`${saleorApiUrl}+saleor_auth_module_refresh_token`);
		cookieStore.delete(`${saleorApiUrl}+saleor_auth_module_auth_state`);
		cookieStore.delete(`${saleorApiUrl}+saleor_auth_module_csrf_token`);
	}
}
