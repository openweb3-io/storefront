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

export function Openweb3Element() {
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

export function Openweb3Component() {
	return <Openweb3Element />;
}
