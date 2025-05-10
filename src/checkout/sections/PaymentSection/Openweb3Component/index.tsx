"use client";

import { type FormEventHandler, useMemo, useState } from "react";
import { get } from "lodash-es";
import { usePaymentStatus } from "../utils";
import { useAlerts } from "@/checkout/hooks/useAlerts";
import {
	useCheckoutValidationActions,
	useCheckoutValidationState,
	anyFormsValidating,
	areAllFormsValid,
} from "@/checkout/state/checkoutValidationStateStore";
import { useCheckoutUpdateState, areAnyRequestsInProgress } from "@/checkout/state/updateStateStore";
import { useEvent } from "@/checkout/hooks/useEvent";
import { useUser } from "@/checkout/hooks/useUser";
import { useTransactionInitialize } from "@/checkout/hooks/useTransactionInitialize";
import { useCheckoutComplete } from "@/checkout/hooks/useCheckoutComplete";
import { useCheckout } from "@/checkout/hooks/useCheckout";

export function Openweb3Element() {
	const [text, setText] = useState("Generate order");
	const [submitLoading, setSubmitLoading] = useState(false);
	const { authenticated } = useUser();
	const checkoutUpdateState = useCheckoutUpdateState();
	const anyRequestsInProgress = areAnyRequestsInProgress(checkoutUpdateState);
	const { validateAllForms } = useCheckoutValidationActions();
	const { validationState } = useCheckoutValidationState();
	const { checkout } = useCheckout();
	const { showSuccess } = useAlerts();
	const paymentStatus = usePaymentStatus(checkout);
	const { completingCheckout } = useCheckoutComplete();

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

	// 处理表单提交
	const onSubmit: FormEventHandler<HTMLFormElement> = useEvent(async (e) => {
		e.preventDefault();

		validateAllForms(authenticated);

		// // 等待表单验证完成
		if (anyFormsValidating(validationState)) {
			return;
		}

		// // 检查表单是否全部验证通过
		if (!areAllFormsValid(validationState)) {
			return;
		}

		// 检查支付状态
		if (!completingCheckout && paymentStatus === "paidInFull") {
			showSuccess("Order completed");
			setText("Order completed");
			return;
		}

		if (!initializeTransactionState.redirectUrl) {
			try {
				setSubmitLoading(true);
				await initializeTransaction();
				setText("Pay Now");
			} finally {
				setSubmitLoading(false);
			}
			return;
		}

		if (initializeTransactionState.redirectUrl) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
			window.open(initializeTransactionState.redirectUrl);
		}
	});

	return (
		<form className="my-8 flex flex-col gap-y-6" onSubmit={onSubmit}>
			<label>Openweb3</label>
			<button
				className="h-12 items-center rounded-md bg-neutral-900 px-6 py-3 text-base font-medium leading-6 text-white shadow hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-70 hover:disabled:bg-neutral-700 aria-disabled:cursor-not-allowed aria-disabled:opacity-70 hover:aria-disabled:bg-neutral-700"
				disabled={anyRequestsInProgress || submitLoading}
				type="submit"
			>
				<span className="button-text">{text}</span>
			</button>
		</form>
	);
}

export function Openweb3Component() {
	return <Openweb3Element />;
}
