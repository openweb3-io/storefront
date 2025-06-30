import { useEffect, useRef, useCallback, useState } from "react";
import { gql } from "graphql-tag";
import { useQuery } from "urql";

// 定义类型
interface TransactionOrder {
	id: string;
	paymentStatus: string;
	isPaid: boolean;
}

interface TransactionCheckout {
	id: string;
}

interface TransactionData {
	transaction?: {
		order?: TransactionOrder;
		checkout?: TransactionCheckout;
	};
}

// 定义查询
const GetCheckoutOrderDocument = gql`
	query GetCheckoutOrder($id: ID!) {
		transaction(id: $id) {
			order {
				id
				paymentStatus
				isPaid
			}
			checkout {
				id
			}
		}
	}
`;

interface UseTransactionPollingProps {
	transactionId: string | null;
	onOrderComplete?: (orderId: string) => void;
	enabled?: boolean;
}

export const useTransactionPolling = ({
	transactionId,
	onOrderComplete,
	enabled = true,
}: UseTransactionPollingProps) => {
	const intervalRef = useRef<NodeJS.Timeout | null>(null);
	const [isPolling, setIsPolling] = useState(false);

	const [result, executeQuery] = useQuery<TransactionData>({
		query: GetCheckoutOrderDocument,
		pause: !transactionId || !enabled,
		variables: { id: transactionId as string },
		requestPolicy: "network-only", // 确保每次都从网络获取最新数据
	});

	const { data, fetching, error } = result;

	const startPolling = useCallback(() => {
		if (!transactionId || !enabled) return;

		// 清除之前的定时器
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
		}

		setIsPolling(true);
		// 设置3秒轮询
		intervalRef.current = setInterval(() => {
			// 手动触发查询
			if (transactionId) {
				executeQuery({ requestPolicy: "network-only" });
			}
		}, 3000);
	}, [transactionId, enabled, executeQuery]);

	const stopPolling = useCallback(() => {
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		}
		setIsPolling(false);
	}, []);

	// 监听订单完成状态
	useEffect(() => {
		const order = data?.transaction?.order;
		// 确保 orderId 存在且 isPaid 为 true 时才触发完成回调
		if (order?.id && order.isPaid === true) {
			stopPolling();
			onOrderComplete?.(order.id);
		}
	}, [data, onOrderComplete, stopPolling]);

	// 启动轮询
	useEffect(() => {
		if (enabled && transactionId) {
			startPolling();
		} else {
			stopPolling();
		}

		// 组件卸载时清理定时器
		return () => {
			stopPolling();
		};
	}, [enabled, transactionId, startPolling, stopPolling]);

	return {
		data,
		fetching,
		error,
		order: data?.transaction?.order,
		isPolling,
	};
};
