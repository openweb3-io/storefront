"use client";

import { type PropsWithChildren } from "react";
import {
	$debug,
	backButton,
	init,
	initData,
	miniApp,
	themeParams,
	retrieveLaunchParams,
} from "@telegram-apps/sdk-react";
import { redirect, usePathname, useRouter } from "next/navigation";
import { useAuthRequest } from "../hooks";
import { useClientOnce } from "@/hooks/use-client-once";
import { useTelegramMock } from "@/checkout/hooks/useTelegramMock";
import { useNativeBackButton } from "@/hooks/useNativeBackButton";
import { browserFromBase64URL } from "@/lib/utils";
const initSDK = (debug: boolean) => {
	$debug.set(debug);

	init();
	miniApp.mount();
	backButton.mount();
	themeParams.mount();
	initData.restore();
};

function Loader({ children }: PropsWithChildren) {
	const { loading, postAuth } = useAuthRequest();

	const router = useRouter();

	const pathname = usePathname();

	const ogParamsKeys = "og:params";

	useNativeBackButton(() => {
		if (pathname === "/checkout") {
			router.push("/default-channel/cart");
			return;
		}

		if (history.length > 1) {
			router.back();
		} else {
			miniApp.close();
		}
	}, !["/default-channel", "/", "/default-channel/products"].includes(pathname));

	useClientOnce(() => {
		void postAuth();

		const startParam = retrieveLaunchParams()?.startParam;
		console.log("startParam", startParam);

		if (!startParam) return;

		const storageStartParam = sessionStorage.getItem(ogParamsKeys);

		const finalPathname = browserFromBase64URL(startParam).split?.("#")?.[0];

		console.log("finalPathname", finalPathname);

		if (!storageStartParam) {
			sessionStorage.setItem(ogParamsKeys, startParam);
			redirect(finalPathname);
		}

		if (storageStartParam !== startParam) {
			sessionStorage.setItem(ogParamsKeys, startParam);
			redirect(finalPathname);
		}
	});

	if (loading) {
		return <></>;
	}

	return <>{children}</>;
}

export function TmaLayout({ children }: PropsWithChildren) {
	useClientOnce(() => {
		const launchParams = retrieveLaunchParams();
		console.log("launchParams", launchParams);
		initSDK(false);
	});

	useTelegramMock();

	return <Loader>{children}</Loader>;
}
