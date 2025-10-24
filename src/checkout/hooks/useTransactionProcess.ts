import { useCallback } from "react";
import { retrieveLaunchParams } from "@telegram-apps/sdk-react";
import { useTransactionProcessMutation } from "@/checkout/graphql";
import { useAlerts } from "@/checkout/hooks/useAlerts";
import { useErrorMessages } from "@/checkout/hooks/useErrorMessages";
import { apiErrorMessages } from "@/checkout/sections/PaymentSection/errorMessages";

export const useTransactionProcess = () => {
	const [transactionProcessResult, transactionProcess] = useTransactionProcessMutation();
	const { showCustomErrors } = useAlerts();
	const { errorMessages: commonErrorMessages } = useErrorMessages(apiErrorMessages);

	const processTransaction = useCallback(
		async (transactionId: string) => {
			try {
				const launchParams = retrieveLaunchParams();
				const userId = `${launchParams?.tgWebAppData?.user?.id}` || "";

				const result = await transactionProcess({
					id: transactionId,
					data: {
						uid: `${userId}-${transactionId}`,
					},
				});

				if (result.error) {
					showCustomErrors([{ message: commonErrorMessages.somethingWentWrong }]);
					return null;
				}

				return result.data?.transactionProcess;
			} catch (err) {
				console.error(err);
				showCustomErrors([{ message: commonErrorMessages.somethingWentWrong }]);
				return null;
			}
		},
		[commonErrorMessages.somethingWentWrong, showCustomErrors, transactionProcess],
	);

	return {
		processTransaction,
		transactionProcessResult,
	};
};
