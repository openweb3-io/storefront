import { useCallback } from "react";
// import { isTMA } from "@telegram-apps/sdk";
import { isTMA, retrieveLaunchParams } from "@telegram-apps/sdk-react";
import { openweb3GatewayId } from "../sections/PaymentSection/Openweb3Component/types";
import { useTransactionInitializeMutation } from "@/checkout/graphql";
import { useCheckout } from "@/checkout/hooks/useCheckout";
import { useAlerts } from "@/checkout/hooks/useAlerts";
import { useErrorMessages } from "@/checkout/hooks/useErrorMessages";
import { apiErrorMessages } from "@/checkout/sections/PaymentSection/errorMessages";

export const useTransactionInitialize = () => {
	const { checkout } = useCheckout();
	const [transactionInitializeResult, transactionInitialize] = useTransactionInitializeMutation();
	const { showCustomErrors } = useAlerts();
	const { errorMessages: commonErrorMessages } = useErrorMessages(apiErrorMessages);

	const initializeTransaction = useCallback(async () => {
		let userId = "";

		try {
			const isTelegram = await isTMA();
			const launchParams = retrieveLaunchParams();
			userId = isTelegram ? `${launchParams?.tgWebAppData?.user?.id}` : "";
		} catch (err) {
			console.error(err);
		}

		// 生成产品描述字符串
		const generateProductsDescription = () => {
			try {
				if (!checkout?.lines || checkout.lines.length === 0) {
					return "";
				}

				const productDescriptions = checkout.lines.map((line) => {
					const variantName = line.variant.product?.name;
					return `${variantName} X ${line.quantity}`;
				});

				return productDescriptions.join(" and ");
			} catch (error) {
				return "";
			}
		};

		const productsDescription = generateProductsDescription();

		try {
			const result = await transactionInitialize({
				checkoutId: checkout.id,
				paymentGateway: {
					id: openweb3GatewayId,
					data: {
						metadata: {
							userId,
							platform: window.navigator.userAgent.includes("MiniAppX") ? "DEJOY" : "TELEGRAM",
							domain: process.env.NEXT_PUBLIC_SALEOR_API_URL,
							products: productsDescription,
							spaceId: localStorage.getItem("spaceId") || "",
							appId: localStorage.getItem("appId") || "",
						},
					},
				},
			});

			if (result.error) {
				showCustomErrors([{ message: commonErrorMessages.somethingWentWrong }]);
				return null;
			}

			return result.data?.transactionInitialize;
		} catch (err) {
			console.error(err);
			showCustomErrors([{ message: commonErrorMessages.somethingWentWrong }]);
			return null;
		}
	}, [
		checkout.id,
		checkout?.lines,
		commonErrorMessages.somethingWentWrong,
		showCustomErrors,
		transactionInitialize,
	]);

	return {
		initializeTransaction,
		transactionInitializeResult,
	};
};
