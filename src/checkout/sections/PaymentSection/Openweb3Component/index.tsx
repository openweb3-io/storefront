"use client";

import { type FormEventHandler, useState, useMemo, useEffect } from "react";
import { openLink, openTelegramLink } from "@telegram-apps/sdk-react";
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
import { useTransactionProcess } from "@/checkout/hooks/useTransactionProcess";
import { useOrderPolling } from "@/checkout/hooks/useOrderPolling";

export function Openweb3Element() {
	const [text, setText] = useState("Generate order");
	const [submitLoading, setSubmitLoading] = useState(false);
	const { authenticated } = useUser();
	const { showCustomErrors } = useAlerts();
	const checkoutUpdateState = useCheckoutUpdateState();
	const anyRequestsInProgress = areAnyRequestsInProgress(checkoutUpdateState);
	const { validateAllForms } = useCheckoutValidationActions();
	const { validationState } = useCheckoutValidationState();
	const { checkout } = useCheckout();
	const { showSuccess } = useAlerts();
	const paymentStatus = usePaymentStatus(checkout);
	const { onCheckoutComplete, completingCheckout } = useCheckoutComplete();
	const [transactionId, setTransactionId] = useState<string | null>(null);

	const { initializeTransaction, transactionInitializeResult } = useTransactionInitialize();
	const { processTransaction } = useTransactionProcess();

	// 使用订单轮询hook
	const { isPolling, stopPolling } = useOrderPolling({
		enabled: !!transactionId, // transactionId enabled polling
		checkoutId: checkout.id,
		transactionId: transactionId || "",
	});

	console.log("transactionInitializeResult", transactionInitializeResult);

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

		try {
			setSubmitLoading(true);
			let res;
			if (!transactionId) {
				res = await initializeTransaction();
				setTransactionId(res?.transaction?.id ?? null);
			} else {
				res = await processTransaction(transactionId);
			}

			setSubmitLoading(false);
			setText("Pay Now");
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			const redirectUrl = res?.data?.redirectUrl as URL | string;
			const type = res?.transactionEvent?.type;

			console.log("res: ", res);

			if (redirectUrl && type === "CHARGE_ACTION_REQUIRED") {
				setText("Checkout Paid");

				// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
				if (openTelegramLink.isAvailable()) {
					console.log("openTelegramLink", redirectUrl);
					openTelegramLink(redirectUrl);
					return;
				}

				if (openLink.isAvailable()) {
					console.log("openLink", redirectUrl);
					openLink(redirectUrl);
					return;
				}

				console.log("not supported openTelegramLink or openLink");
			}

			if (type === "CHARGE_FAILURE") {
				showCustomErrors([{ message: "Order failed" }]);
				setText("Order failed");
				return;
			}

			if (type === "CHARGE_SUCCESS") {
				showSuccess("Order completed");
				void onCheckoutComplete();
				setText("Paid");
			}
		} catch (error) {
			console.error(error);
			showCustomErrors([{ message: JSON.stringify(error) }]);
		} finally {
			setSubmitLoading(false);
		}
	});

	// stop polling when component unmount
	useEffect(() => {
		return () => {
			stopPolling();
		};
	}, [stopPolling]);

	const checkDeliveryDisabled = useMemo(() => {
		return (
			(!authenticated && !checkout.shippingAddress) ||
			(!!authenticated &&
				!checkout.shippingAddress &&
				!!checkoutUpdateState?.updateState.checkoutShippingUpdate)
		);
	}, [authenticated, checkout.shippingAddress, checkoutUpdateState?.updateState.checkoutShippingUpdate]);

	console.log("checkout.deliveryMethod", checkout.deliveryMethod);

	return (
		<form className="my-8 flex flex-col gap-y-6" onSubmit={onSubmit}>
			<label>Social Wallet</label>
			<button
				className="h-12 items-center rounded-md bg-neutral-900 px-6 py-3 text-base font-medium leading-6 text-white shadow hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-70 hover:disabled:bg-neutral-700 aria-disabled:cursor-not-allowed aria-disabled:opacity-70 hover:aria-disabled:bg-neutral-700"
				disabled={anyRequestsInProgress || submitLoading || checkDeliveryDisabled}
				type="submit"
			>
				<span className="button-text">{text}</span>
			</button>
			{isPolling && <div className="text-sm text-gray-600">正在检查订单状态...</div>}
		</form>
	);
}

export function Openweb3Component() {
	return <Openweb3Element />;
}
