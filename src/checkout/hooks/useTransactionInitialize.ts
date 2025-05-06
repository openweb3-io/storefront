import { useCallback } from "react";
// import { isTMA } from "@telegram-apps/sdk";
import { isTMA, retrieveLaunchParams } from "@telegram-apps/sdk-react";
import { useTransactionInitializeMutation } from "@/checkout/graphql";
import { useCheckout } from "@/checkout/hooks/useCheckout";
import { useAlerts } from "@/checkout/hooks/useAlerts";
import { useErrorMessages } from "@/checkout/hooks/useErrorMessages";
import { apiErrorMessages } from "@/checkout/sections/PaymentSection/errorMessages";

// declare global {
// 	interface Window {
// 		Telegram: {
// 			WebApp: {
// 				initDataUnsafe: {
// 					user?: {
// 						id: number;
// 					};
// 				};
// 			};
// 		};
// 	}
// }

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
					id: "app.saleor.openweb3",
					data: {
						metadata: {
							userId,
							platform: isTelegram ? "TELEGRAM" : "DEJAY",
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
