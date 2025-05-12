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
		try {
			const isTelegram = await isTMA();
			const launchParams = retrieveLaunchParams();
			const userId = isTelegram ? `${launchParams.initData?.user?.id}` : "";
			const result = await transactionInitialize({
				checkoutId: checkout.id,
				paymentGateway: {
					id: openweb3GatewayId,
					data: {
						metadata: {
							userId,
							platform: window.navigator.userAgent.includes("OpenWeb3") ? "DEJAY" : "TELEGRAM",
							domain: process.env.NEXT_PUBLIC_SALEOR_API_URL,
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
	}, [checkout.id, commonErrorMessages.somethingWentWrong, showCustomErrors, transactionInitialize]);

	return {
		initializeTransaction,
		transactionInitializeResult,
	};
};
