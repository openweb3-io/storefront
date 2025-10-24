"use client";

import { type PropsWithChildren } from "react";
import {
	backButton,
	init,
	initData,
	miniApp,
	themeParams,
	retrieveLaunchParams,
	viewport
} from "@telegram-apps/sdk-react";
import { redirect, usePathname, useRouter } from "next/navigation";
import { useAuthRequest } from "../hooks";
import { useClientOnce } from "@/hooks/use-client-once";
import { useTelegramMock } from "@/checkout/hooks/useTelegramMock";
import { useNativeBackButton } from "@/hooks/useNativeBackButton";
import { browserFromBase64URL } from "@/lib/utils";
const initSDK = async () => {
	init();
	miniApp.mount();
	backButton.mount();
	themeParams.mount();
	initData.restore();
	viewport.mount();
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

		viewport.mount();
		// load Viewport
		if (viewport.mount.isAvailable()) {
			console.log('✅ Viewport mounted');
			
			// bind viewport CSS
			if (viewport.bindCssVars.isAvailable()) {
			  viewport.bindCssVars();
			  console.log('📐 Viewport CSS variables bound');
			}
		}

		if (!startParam) return;

		const storageStartParam = sessionStorage.getItem(ogParamsKeys);

		const finalPathname = browserFromBase64URL(startParam as string).split?.("#")?.[0];

		console.log("finalPathname", finalPathname);

		if (!storageStartParam) {
			sessionStorage.setItem(ogParamsKeys, startParam as string);
			redirect(finalPathname);
		}

		if (storageStartParam !== startParam) {
			sessionStorage.setItem(ogParamsKeys, startParam as string);
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
		if (window !== undefined) {
			const hashContent = window.location?.hash?.split?.("#")?.[1];
			const searchParams = new URLSearchParams(hashContent);
			const spaceId = searchParams.get("spaceId");
			const appId = searchParams.get("appId");

			if (spaceId) {
				localStorage.setItem("spaceId", spaceId);
			}

			if (appId) {
				localStorage.setItem("appId", appId);
			}
		}
		const launchParams = retrieveLaunchParams();
		console.log("launchParams", launchParams);
		initSDK();
	});

	useTelegramMock();

	return <Loader>{children}</Loader>;
}
