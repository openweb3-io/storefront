"use client";

import { type FormEventHandler, useEffect, useMemo } from "react";
// import { usePaymentProcessingScreen } from "../PaymentProcessingScreen";
import { get } from "lodash-es";
import {
	useCheckoutValidationActions,
	useCheckoutValidationState,
	anyFormsValidating,
	areAllFormsValid,
} from "@/checkout/state/checkoutValidationStateStore";
import {
	useCheckoutUpdateState,
	areAnyRequestsInProgress,
	// useCheckoutUpdateStateActions,
	// hasFinishedApiChangesWithNoError,
} from "@/checkout/state/updateStateStore";
import { useEvent } from "@/checkout/hooks/useEvent";
import { useUser } from "@/checkout/hooks/useUser";
// import { useAlerts } from "@/checkout/hooks/useAlerts";
import { useCheckoutComplete } from "@/checkout/hooks/useCheckoutComplete";
import { getQueryParams } from "@/checkout/lib/utils/url";
import { useTransactionInitialize } from "@/checkout/hooks/useTransactionInitialize";

export function Openweb3Component() {
	const { authenticated } = useUser();
	// const { showCustomErrors } = useAlerts();

	const checkoutUpdateState = useCheckoutUpdateState();
	const anyRequestsInProgress = areAnyRequestsInProgress(checkoutUpdateState);
	// const finishedApiChangesWithNoError = hasFinishedApiChangesWithNoError(checkoutUpdateState);
	// const { setSubmitInProgress, setShouldRegisterUser } = useCheckoutUpdateStateActions();
	const { validateAllForms } = useCheckoutValidationActions();
	const { validationState } = useCheckoutValidationState();

	// const { setIsProcessingPayment } = usePaymentProcessingScreen();
	const { onCheckoutComplete, completingCheckout } = useCheckoutComplete();
	const { initializeTransaction, transactionInitializeResult } = useTransactionInitialize();

	console.log("transactionInitializeResult", transactionInitializeResult);

	const initializeTransactionState = useMemo(() => {
		const transactionInitialize = get(transactionInitializeResult, "data.transactionInitialize", {});
		return {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			redirectUrl: get(transactionInitialize, "data.redirectUrl", "") || "",
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			type: get(transactionInitialize, "transactionEvent.type", "") || "",
		};
	}, [transactionInitializeResult]);

	// const processPayment = async () => {
	// 	try {
	// 		// 这里添加Openweb3的支付处理逻辑
	// 		await onCheckoutComplete();
	// 	} catch (error) {
	// 		console.error(error);
	// 		setIsProcessingPayment(false);
	// 		showCustomErrors([{ message: "支付处理过程中发生错误" }]);
	// 	}
	// };

	// 处理表单提交
	const onSubmitInitialize: FormEventHandler<HTMLFormElement> = useEvent(async (e) => {
		e.preventDefault();

		validateAllForms(authenticated);
		// setShouldRegisterUser(true);
		// // await processPayment();
		if (!initializeTransactionState.redirectUrl) {
			await initializeTransaction();
			return;
		}

		if (initializeTransactionState.redirectUrl) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
			window.open(initializeTransactionState.redirectUrl);
		}
		// setIsLoading(true);
		// setSubmitInProgress(true);
	});

	// 处理支付重定向
	useEffect(() => {
		const { processingPayment } = getQueryParams();
		if (!processingPayment) {
			return;
		}

		if (!completingCheckout) {
			void onCheckoutComplete();
		}
	}, [completingCheckout, onCheckoutComplete]);

	// 处理表单验证和支付提交
	useEffect(() => {
		anyFormsValidating(validationState);
		areAllFormsValid(validationState);
	}, [validationState]);

	return (
		<form className="my-8 flex flex-col gap-y-6" onSubmit={onSubmitInitialize}>
			{initializeTransactionState.type === "CHARGE_SUCCESS" && (
				<div className="grid grid-cols-1">
					<div className="flex items-center justify-center rounded-md border border-gray-300 p-4">
						<span className="text-sm font-medium">支付成功</span>
					</div>
				</div>
			)}
			<button
				className="h-12 items-center rounded-md bg-neutral-900 px-6 py-3 text-base font-medium leading-6 text-white shadow hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-70 hover:disabled:bg-neutral-700 aria-disabled:cursor-not-allowed aria-disabled:opacity-70 hover:aria-disabled:bg-neutral-700"
				disabled={anyRequestsInProgress}
				type="submit"
			>
				<span className="button-text">
					{initializeTransactionState.redirectUrl ? "生成订单" : "支付订单"}
				</span>
			</button>
		</form>
	);
}

export function Openweb3Elements() {
	return <Openweb3Component />;
}

// function Loader() {
// 	return (
// 		<div className="text-center" aria-busy="true" role="status">
// 			<div>
// 				<svg
// 					aria-hidden="true"
// 					className="mr-2 inline h-6 w-6 animate-spin fill-neutral-600 text-neutral-100 dark:text-neutral-600"
// 					viewBox="0 0 100 101"
// 					fill="none"
// 					xmlns="http://www.w3.org/2000/svg"
// 				>
// 					<path
// 						d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
// 						fill="currentColor"
// 					/>
// 					<path
// 						d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
// 						fill="currentFill"
// 					/>
// 				</svg>
// 				<span className="sr-only">加载中...</span>
// 			</div>
// 		</div>
// 	);
// }
