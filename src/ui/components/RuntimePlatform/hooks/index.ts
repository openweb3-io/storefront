import { useState } from "react";
import { retrieveLaunchParams } from "@telegram-apps/sdk";
import { openweb3GatewayId } from "@/checkout/sections/PaymentSection/Openweb3Component/types";

interface AuthResponse {
	// 根据实际响应数据结构定义
	[key: string]: any;
}

export const useAuthRequest = () => {
	const [loading, setLoading] = useState(true);

	const postAuth = async (): Promise<AuthResponse> => {
		setLoading(true);
		try {
			const { initDataRaw } = retrieveLaunchParams();
			console.log("initDataRaw", initDataRaw);
			const authUrl = process?.env?.NEXT_PUBLIC_TELEGRAM_AUTH_URL;
			const response = await fetch(authUrl!, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					platform: openweb3GatewayId,
				},
				body: JSON.stringify({
					initDataRaw: initDataRaw,
				}),
			});

			if (!response.ok) {
				throw new Error("Auth request failed");
			}

			const data = await response.json();

			return data as AuthResponse;
		} catch (error) {
			console.error("Auth request error:", error);
			throw error;
		} finally {
			setLoading(false);
		}
	};

	return {
		postAuth,
		loading,
	};
};
