"use client";
import { useState } from "react";
import { retrieveLaunchParams } from "@telegram-apps/sdk-react";
import { openweb3GatewayId } from "@/checkout/sections/PaymentSection/Openweb3Component/types";
import { useAlerts } from "@/checkout/hooks/useAlerts/useAlerts";

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
	const { showCustomErrors } = useAlerts();
	const postAuth = async (): Promise<AuthResponse | void> => {
		setLoading(true);
		try {
			const { initDataRaw } = retrieveLaunchParams();
			const url = `${process.env.NEXT_PUBLIC_AUTH_URL}/api/auth`;
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

			if (res.code === -1 && res.message) {
				showCustomErrors([{ message: res.message }]);
			}

			if (res.code === 0 && res?.data?.localStorage) {
				res?.data?.localStorage.forEach((item) => {
					const [key, value] = item;
					window.localStorage.setItem(key, value);
				});
			}

			return res;
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
	const { showCustomErrors } = useAlerts();
	const postBindEmail = async (email: string, code: string): Promise<AuthResponse | void> => {
		setLoading(true);
		try {
			const { initDataRaw } = retrieveLaunchParams();
			const url = `${process.env.NEXT_PUBLIC_AUTH_URL}/api/email/bind`;
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
					code,
				}),
			});

			if (!response.ok) {
				console.log("Register email request failed");
			}

			const res = (await response.json()) as AuthResponse;

			if (res.code === -1 && res.message) {
				showCustomErrors([{ message: res.message }]);
			}

			return res;
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

export const useSendEmailCodeRequest = () => {
	const [loading, setLoading] = useState(false);
	const { showCustomErrors } = useAlerts();
	const postSendEmailCode = async (email: string): Promise<AuthResponse | void> => {
		setLoading(true);
		try {
			const { initDataRaw } = retrieveLaunchParams();
			const url = `${process.env.NEXT_PUBLIC_AUTH_URL}/api/email/sendcode`;
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

			if (res.code === -1 && res.message) {
				showCustomErrors([{ message: res.message }]);
			}

			return res;
		} catch (error) {
			console.log("Register email request error");
		} finally {
			setTimeout(() => {
				setLoading(false);
			}, 10e3);
		}
	};

	return {
		postSendEmailCode,
		loading,
	};
};
