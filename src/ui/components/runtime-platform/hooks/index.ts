import { useState } from "react";
import { retrieveLaunchParams } from "@telegram-apps/sdk";

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
			const response = await fetch("https://openweb3.a.pinggy.link/api/auth", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					platform: "app.saleor.openweb3",
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
