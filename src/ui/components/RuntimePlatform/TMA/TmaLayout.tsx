"use client";

import { useEffect, type PropsWithChildren } from "react";
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
		const ogParams = sessionStorage.getItem(ogParamsKeys);

		const defaultPathname = "/default-channel/products";

		if (ogParams) {
			sessionStorage.removeItem(ogParamsKeys);
			setTimeout(() => {
				redirect(defaultPathname);
			}, 0);
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

		sessionStorage.setItem("temp-startParam", JSON.stringify(startParam));

		if (!startParam) return;

		const pathname = browserFromBase64URL(startParam);

		const ogParams = sessionStorage.getItem(ogParamsKeys);

		if (!ogParams) {
			sessionStorage.setItem(ogParamsKeys, pathname);
			redirect(pathname);
		}

		if (ogParams !== pathname) {
			sessionStorage.setItem(ogParamsKeys, pathname);
			redirect(pathname);
		}
	});

	useEffect(() => {
		return () => {
			sessionStorage.removeItem(ogParamsKeys);
		};
	}, []);

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
