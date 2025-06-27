import { useEffect, useRef, useCallback } from "react";
import { useSaleorAuthContext } from "@saleor/auth-sdk/react";
import { useUser } from "@/checkout/hooks/useUser";
import { useCheckoutComplete } from "@/checkout/hooks/useCheckoutComplete";

interface UseOrderPollingProps {
	enabled?: boolean;
	interval?: number; // default 3 seconds
	checkoutId: string;
	transactionId?: string;
}

interface OrderNode {
	__typename: string;
	billingAddress: any;
	channel: {
		name: string;
		id: string;
		__typename: string;
	};
	created: string;
	id: string;
	number: string;
	paymentStatus: string;
	status: string;
	total: {
		__typename: string;
		gross: {
			__typename: string;
			amount: number;
			currency: string;
		};
	};
	userEmail: string;
	chargeStatus: string;
}

interface OrderEdge {
	node: OrderNode;
	__typename: string;
}

interface OrderListResponse {
	data?: {
		orders?: {
			edges?: OrderEdge[];
			pageInfo?: {
				hasPreviousPage: boolean;
				hasNextPage: boolean;
				startCursor: string;
				endCursor: string;
				__typename: string;
			};
			__typename: string;
		};
	};
	errors?: any[];
}

export const useOrderPolling = ({
	enabled = true,
	interval = 3000,
	checkoutId,
	transactionId = "",
}: UseOrderPollingProps) => {
	const { user } = useUser();
	const { onCheckoutComplete } = useCheckoutComplete();
	const saleorAuthClient = useSaleorAuthContext();
	const intervalRef = useRef<NodeJS.Timeout | null>(null);
	const isPollingRef = useRef(false);

	// execute query function
	const executeOrderQuery = useCallback(async () => {
		if (!enabled || !user?.email || !checkoutId || isPollingRef.current) {
			return;
		}

		isPollingRef.current = true;

		try {
			// build query variables
			const queryVariables = {
				first: 1,
				filter: {
					created: null,
					customer: user.email,
					metadata: [
						{
							key: "checkoutId",
							value: checkoutId,
						},
						{
							key: "transactionId",
							value: transactionId,
						},
					],
					chargeStatus: "FULL",
				},
				sort: {
					direction: "DESC" as const,
					field: "NUMBER" as const,
				},
			};

			// use authenticated GraphQL client
			const response = await saleorAuthClient.fetchWithAuth(process.env.NEXT_PUBLIC_SALEOR_API_URL!, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					query: `
						query OrderList($first: Int, $after: String, $last: Int, $before: String, $filter: OrderFilterInput, $sort: OrderSortingInput) {
							orders(
								before: $before
								after: $after
								first: $first
								last: $last
								filter: $filter
								sortBy: $sort
							) {
								edges {
									node {
										__typename
										billingAddress {
											city
											cityArea
											companyName
											country {
												__typename
												code
												country
											}
											countryArea
											firstName
											id
											lastName
											phone
											postalCode
											streetAddress1
											streetAddress2
											__typename
										}
										channel {
											name
											id
											__typename
										}
										created
										id
										number
										paymentStatus
										status
										total {
											__typename
											gross {
												__typename
												amount
												currency
											}
										}
										userEmail
										chargeStatus
									}
									__typename
								}
								pageInfo {
									hasPreviousPage
									hasNextPage
									startCursor
									endCursor
									__typename
								}
								__typename
							}
						}
					`,
					variables: queryVariables,
				}),
			});

			const result = (await response.json()) as OrderListResponse;

			// check query result
			if (result.data?.orders?.edges && result.data.orders.edges.length > 0) {
				// find matching order
				const matchingOrder = result.data.orders.edges.find((edge: OrderEdge) => {
					const order = edge.node;
					return (
						order.userEmail === user.email &&
						order.chargeStatus === "FULL" &&
						order.paymentStatus === "FULLY_CHARGED"
					);
				});

				if (matchingOrder) {
					// find matching order, execute checkout complete
					console.log("find matching order, execute checkout complete:", matchingOrder.node);
					await onCheckoutComplete();

					// stop polling
					if (intervalRef.current) {
						clearInterval(intervalRef.current);
						intervalRef.current = null;
					}
					return;
				}
			}
		} catch (err) {
			console.error("order query failed:", err);
		} finally {
			isPollingRef.current = false;
		}
	}, [enabled, user?.email, checkoutId, transactionId, onCheckoutComplete, saleorAuthClient]);

	// start polling
	const startPolling = useCallback(() => {
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
		}

		// execute query immediately
		void executeOrderQuery();

		// set timer
		intervalRef.current = setInterval(() => {
			void executeOrderQuery();
		}, interval);
	}, [executeOrderQuery, interval]);

	// stop polling
	const stopPolling = useCallback(() => {
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		}
		isPollingRef.current = false;
	}, []);

	// start polling when component mount
	useEffect(() => {
		if (enabled && user?.email && checkoutId) {
			startPolling();
		}

		// stop polling when component unmount
		return () => {
			stopPolling();
		};
	}, [enabled, user?.email, checkoutId, startPolling, stopPolling]);

	// start polling when dependency changes
	useEffect(() => {
		if (enabled && user?.email && checkoutId) {
			stopPolling();
			startPolling();
		}
	}, [enabled, user?.email, checkoutId, transactionId, startPolling, stopPolling]);

	return {
		isPolling: !!intervalRef.current,
		startPolling,
		stopPolling,
		executeOrderQuery,
	};
};
