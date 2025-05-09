"use client";

import { useEffect, type PropsWithChildren } from "react";
import { $debug, init, initData, miniApp, themeParams } from "@telegram-apps/sdk-react";
import { useAuthRequest } from "../hooks";
import { useClientOnce } from "@/hooks/use-client-once";
import { useTelegramMock } from "@/checkout/hooks/useTelegramMock";

export function TmaLayout({ children }: PropsWithChildren) {
	useTelegramMock();

	useClientOnce(() => {
		initSDK(false);
	});

	return <Loader>{children}</Loader>;
}

const initSDK = (debug: boolean) => {
	$debug.set(debug);

	init();
	miniApp.mount();
	themeParams.mount();
	initData.restore();
};

function Loader({ children }: PropsWithChildren) {
	const { loading, postAuth } = useAuthRequest();

	useEffect(() => {
		void postAuth();
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
	}, []);

	if (loading) {
		return <></>;
	}

	return <>{children}</>;
}
