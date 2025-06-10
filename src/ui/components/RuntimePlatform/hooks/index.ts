"use client";
import { useState } from "react";
import { retrieveLaunchParams } from "@telegram-apps/sdk-react";
import { usePathname } from "next/navigation";
import { openweb3GatewayId } from "@/checkout/sections/PaymentSection/Openweb3Component/types";

interface AuthResponse {
	code: number;
	message: string;
	data: {
		detail: {
			[key: string]: any;
		};
		localStorage: string[][];
		isRedirect: boolean;
	};
	[key: string]: any;
}

export const useAuthRequest = () => {
	const [loading, setLoading] = useState(false);
	const pathname = usePathname();
	const postAuth = async (): Promise<void> => {
		setLoading(true);
		try {
			const { initDataRaw } = retrieveLaunchParams();
			console.log("initDataRaw", initDataRaw);
			const url = `${process.env.NEXT_PUBLIC_AUTH_URL}/api/auth`;
			console.log("url:", url);
			console.log("NEXT_PUBLIC_AUTH_URL.env:", process.env.NEXT_PUBLIC_AUTH_URL);
			const response = await fetch(url, {
				method: "POST",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
					platform: openweb3GatewayId,
				},
				body: JSON.stringify({
					initDataRaw: initDataRaw,
				}),
			});

			if (!response.ok) {
				console.log("Auth request failed");
			}

			const res = (await response.json()) as AuthResponse;

			if (res?.data?.isRedirect && pathname !== "/register" && res.code === 301) {
				console.log("register from", pathname);
				window.location.replace("/register");
				return;
			}

			try {
				if (res.code === 0 && res?.data?.localStorage) {
					res?.data?.localStorage.forEach((item) => {
						const [key, value] = item;
						window.localStorage.setItem(key, value);
					});
				}
			} catch (error) {
				console.error("LocalStorage error:", error);
			}
		} catch (error) {
			console.log("Auth request error");
		} finally {
			setLoading(false);
		}
	};

	return {
		postAuth,
		loading,
	};
};

export const useBindEmailRequest = () => {
	const [loading, setLoading] = useState(false);
	const postBindEmail = async (email: string): Promise<AuthResponse | void> => {
		setLoading(true);
		try {
			const { initDataRaw } = retrieveLaunchParams();
			console.log("initDataRaw", initDataRaw);
			const url = `${process.env.NEXT_PUBLIC_AUTH_URL}/api/bindemail`;
			console.log("url:", url);
			console.log("NEXT_PUBLIC_AUTH_URL.env:", process.env.NEXT_PUBLIC_AUTH_URL);
			const response = await fetch(url, {
				method: "POST",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
					platform: openweb3GatewayId,
				},
				body: JSON.stringify({
					initDataRaw: initDataRaw,
					email,
				}),
			});

			if (!response.ok) {
				console.log("Register email request failed");
			}

			const res = (await response.json()) as AuthResponse;

			if (res.code !== 0) {
				console.log(res.message);
				setLoading(false);
				return res;
			}

			if (res.code === 0) return res;
		} catch (error) {
			console.log("Register email request error");
		} finally {
			setTimeout(() => {
				setLoading(false);
			}, 10e3);
		}
	};

	return {
		postBindEmail,
		loading,
	};
};
