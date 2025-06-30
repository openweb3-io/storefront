"use client";

import { type FormEventHandler, useState, useMemo, useEffect, useRef } from "react";
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
	const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

	const { initializeTransaction, transactionInitializeResult } = useTransactionInitialize();
	const { processTransaction } = useTransactionProcess();

	console.log("transactionInitializeResult", transactionInitializeResult);

	// 轮询处理交易状态
	useEffect(() => {
		if (!transactionId) {
			return;
		}

		const pollTransactionStatus = async () => {
			try {
				const result = await processTransaction(transactionId);
				const type = result?.transactionEvent?.type;

				if (type === "CHARGE_SUCCESS") {
					// 停止轮询
					if (pollingIntervalRef.current) {
						clearInterval(pollingIntervalRef.current);
						pollingIntervalRef.current = null;
					}

					// 完成结账
					void onCheckoutComplete();
					showSuccess("Order completed");
					setText("Paid");
				}
				// 其他状态忽略，继续轮询
			} catch (error) {
				console.error("轮询交易状态时出错:", error);
				// 出错时也继续轮询，不显示错误提示
			}
		};

		// 立即执行一次
		void pollTransactionStatus();

		// 设置3秒轮询间隔
		pollingIntervalRef.current = setInterval(pollTransactionStatus, 3000);

		// 清理函数
		return () => {
			if (pollingIntervalRef.current) {
				clearInterval(pollingIntervalRef.current);
				pollingIntervalRef.current = null;
			}
		};
	}, [transactionId]);

	// 处理表单提交
	const onSubmit: FormEventHandler<HTMLFormElement> = useEvent(async (e) => {
		e.preventDefault();

		validateAllForms(authenticated);

		// 等待表单验证完成
		if (anyFormsValidating(validationState)) {
			return;
		}

		// 检查表单是否全部验证通过
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
		</form>
	);
}

export function Openweb3Component() {
	return <Openweb3Element />;
}
