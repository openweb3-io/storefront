"use client";
import { useState } from "react";
import { retrieveLaunchParams } from "@telegram-apps/sdk-react";
import { openweb3GatewayId } from "@/checkout/sections/PaymentSection/Openweb3Component/types";
import { useAlerts } from "@/checkout/hooks/useAlerts/useAlerts";

interface AuthResponse {
	code: number;
	message: string;
	data?: {
		user?: {
			email?: string;
			firstName?: string;
			lastName?: string;
		};
		token?: string;
		refreshToken?: string;
		csrfToken?: string;
		errors?: Array<{
			field?: string;
			message?: string;
			code?: string;
		}>;
		[key: string]: any;
	};
	[key: string]: any;
}

// 解析错误消息，处理可能是字符串数组的字符串表示（如 "['message']"）
const parseErrorMessage = (message: string | undefined): string => {
	if (!message) return "";

	// 尝试解析类似 "['message']" 的格式
	if (message.startsWith("['") && message.endsWith("']")) {
		try {
			const parsed = JSON.parse(message.replace(/'/g, '"'));
			if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === "string") {
				return parsed[0];
			}
		} catch {
			// 如果解析失败，使用原始 message
		}
	}
	return message;
};

// 处理 API 错误响应，优先显示 data.errors 中的详细错误信息
const handleApiError = (
	res: AuthResponse,
	showCustomErrors: (errors: Array<{ message: string }>) => void,
	defaultMessage: string,
) => {
	if (res.code === -1) {
		// 优先显示 data.errors 中的详细错误信息
		if (res.data?.errors && res.data.errors.length > 0) {
			const errorMessages = res.data.errors.map((error) => {
				const parsedMessage = parseErrorMessage(error.message);
				return { message: parsedMessage || res.message || defaultMessage };
			});
			showCustomErrors(errorMessages);
		} else if (res.message) {
			showCustomErrors([{ message: res.message }]);
		} else {
			showCustomErrors([{ message: defaultMessage }]);
		}
	}
};

export const useAuthRequest = () => {
	const [loading, setLoading] = useState(false);
	const { showCustomErrors } = useAlerts();

	const postAuth = async (): Promise<AuthResponse | void> => {
		setLoading(true);
		try {
			const { initDataRaw } = retrieveLaunchParams();

			if (!initDataRaw) {
				showCustomErrors([{ message: "No init data available" }]);
				return;
			}

			const response = await fetch("/api/auth", {
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
				showCustomErrors([{ message: "Authentication request failed" }]);
				return;
			}

			const res = (await response.json()) as AuthResponse;

			if (res.code === -1 && !!res.message) {
				showCustomErrors([{ message: res.message }]);
				const saleorApiUrl = process.env.NEXT_PUBLIC_SALEOR_API_URL;
				if (saleorApiUrl) {
					window.localStorage.removeItem(`${saleorApiUrl}+saleor_auth_access_token`);
					window.localStorage.removeItem(`${saleorApiUrl}+saleor_auth_module_refresh_token`);
					window.localStorage.removeItem(`${saleorApiUrl}+saleor_auth_module_auth_state`);
					window.localStorage.removeItem(`${saleorApiUrl}+saleor_auth_module_csrf_token`);
				}
			}

			if (res.code === 0 && res?.data) {
				const { token, refreshToken, csrfToken } = res.data;
				const saleorApiUrl = process.env.NEXT_PUBLIC_SALEOR_API_URL;

				if (token && refreshToken && saleorApiUrl) {
					window.localStorage.setItem(`${saleorApiUrl}+saleor_auth_access_token`, token);
					window.localStorage.setItem(`${saleorApiUrl}+saleor_auth_module_refresh_token`, refreshToken);
					window.localStorage.setItem(`${saleorApiUrl}+saleor_auth_module_auth_state`, "signedIn");

					if (csrfToken) {
						window.localStorage.setItem(`${saleorApiUrl}+saleor_auth_module_csrf_token`, csrfToken);
					}
				}
			}

			return res;
		} catch (error) {
			console.log("Auth request error:", error);
			showCustomErrors([{ message: "Authentication request failed" }]);

			// 网络错误时也移除localStorage
			const saleorApiUrl = process.env.NEXT_PUBLIC_SALEOR_API_URL;
			if (saleorApiUrl) {
				window.localStorage.removeItem(`${saleorApiUrl}+saleor_auth_access_token`);
				window.localStorage.removeItem(`${saleorApiUrl}+saleor_auth_module_refresh_token`);
				window.localStorage.removeItem(`${saleorApiUrl}+saleor_auth_module_auth_state`);
				window.localStorage.removeItem(`${saleorApiUrl}+saleor_auth_module_csrf_token`);
			}
		} finally {
			setLoading(false);
		}
	};

	return {
		postAuth,
		loading,
	};
};

export const useEmailChangeRequest = () => {
	const [loading, setLoading] = useState(false);
	const { showCustomErrors, showSuccess } = useAlerts();

	const postEmailChange = async (oldEmail: string, newEmail: string): Promise<AuthResponse | void> => {
		setLoading(true);
		try {
			const { initDataRaw } = retrieveLaunchParams();

			if (!initDataRaw) {
				showCustomErrors([{ message: "No init data available" }]);
				return;
			}

			if (!oldEmail) {
				showCustomErrors([{ message: "Old email is required" }]);
				return;
			}

			if (!newEmail) {
				showCustomErrors([{ message: "New email is required" }]);
				return;
			}

			const response = await fetch("/api/email-change", {
				method: "POST",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
					platform: openweb3GatewayId,
				},
				body: JSON.stringify({
					initDataRaw: initDataRaw,
					oldEmail,
					newEmail,
				}),
			});

			if (!response.ok) {
				console.log("Email change request failed");
				showCustomErrors([{ message: "Email change request failed" }]);
				return;
			}

			const res = (await response.json()) as AuthResponse;

			handleApiError(res, showCustomErrors, "Email change request failed");

			if (res.code === 0) {
				showSuccess("Email change request sent successfully");
			}

			return res;
		} catch (error) {
			console.log("Email change request error:", error);
			showCustomErrors([{ message: "Email change request failed" }]);
		} finally {
			setTimeout(() => {
				setLoading(false);
			}, 10e3);
		}
	};

	return {
		postEmailChange,
		loading,
	};
};

export const useEmailChangeConfirmRequest = () => {
	const [loading, setLoading] = useState(false);
	const { showCustomErrors, showSuccess } = useAlerts();

	const postEmailChangeConfirm = async (
		verificationCode: string,
		oldEmail: string,
		newEmail: string,
	): Promise<AuthResponse | void> => {
		setLoading(true);
		try {
			const { initDataRaw } = retrieveLaunchParams();

			if (!initDataRaw) {
				showCustomErrors([{ message: "No init data available" }]);
				return;
			}

			if (!verificationCode) {
				showCustomErrors([{ message: "Verification code is required" }]);
				return;
			}

			if (!oldEmail) {
				showCustomErrors([{ message: "Old email is required" }]);
				return;
			}

			if (!newEmail) {
				showCustomErrors([{ message: "New email is required" }]);
				return;
			}

			const response = await fetch("/api/email-change-confirm", {
				method: "POST",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
					platform: openweb3GatewayId,
				},
				body: JSON.stringify({
					initDataRaw: initDataRaw,
					verificationCode,
					oldEmail,
					newEmail,
				}),
			});

			if (!response.ok) {
				console.log("Email change confirm failed");
				showCustomErrors([{ message: "Email change confirmation failed" }]);
				return;
			}

			const res = (await response.json()) as AuthResponse;

			handleApiError(res, showCustomErrors, "Email change confirmation failed");

			if (res.code === 0) {
				showSuccess("Email change confirmed successfully");
			}

			return res;
		} catch (error) {
			console.log("Email change confirm error:", error);
			showCustomErrors([{ message: "Email change confirmation failed" }]);
		} finally {
			setTimeout(() => {
				setLoading(false);
			}, 10e3);
		}
	};

	return {
		postEmailChangeConfirm,
		loading,
	};
};
