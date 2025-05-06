import { parseInitData, isTMA, mockTelegramEnv } from "@telegram-apps/sdk-react";
import { useClientOnce } from "@/hooks/use-client-once";

/**
 * Mocks Telegram environment in development mode.
 */
export function useTelegramMock(): void {
	useClientOnce(() => {
		const provider = process.env.NEXT_PUBLIC_TELEGRAM_MOCK_PROVIDER ?? "telegram";

		let shouldMock = false;
		const MOCK_KEY = `____mocked_${provider}`;

		if (process.env.NODE_ENV === "development") {
			// We don't mock if we are already in a mini app.
			if (isTMA("simple")) {
				// We could previously mock the environment.
				// In case we did, we should do it again.
				// The reason is the page could be reloaded, and we should apply mock again, because
				// mocking also enables modifying the window object.
				shouldMock = !!sessionStorage.getItem(MOCK_KEY);
			} else {
				shouldMock = process.env.NEXT_PUBLIC_TELEGRAM_MOCK === "true";
			}
		}

		if (!shouldMock) {
			return;
		}

		const initDataRaw =
			provider === "telegram"
				? process.env.NEXT_PUBLIC_TELEGRAM_MOCK_INIT_DATA
				: process.env.NEXT_PUBLIC_OPENWEB3_MOCK_INIT_DATA;

		mockTelegramEnv({
			themeParams: {
				accentTextColor: "#6ab2f2",
				bgColor: "#17212b",
				buttonColor: "#5288c1",
				buttonTextColor: "#ffffff",
				destructiveTextColor: "#ec3942",
				headerBgColor: "#17212b",
				hintColor: "#708499",
				linkColor: "#6ab3f3",
				secondaryBgColor: "#232e3c",
				sectionBgColor: "#17212b",
				sectionHeaderTextColor: "#6ab3f3",
				subtitleTextColor: "#708499",
				textColor: "#f5f5f5",
			},
			initData: parseInitData(initDataRaw),
			initDataRaw,
			version: "8.0",
			platform: "tdesktop",
		});
		sessionStorage.setItem(MOCK_KEY, "1");

		console.info(
			"⚠️ As long as the current environment was not considered as the Telegram-based one, it was mocked. Take a note, that you should not do it in production and current behavior is only specific to the development process. Environment mocking is also applied only in development mode. So, after building the application, you will not see this behavior and related warning, leading to crashing the application outside Telegram.",
		);
	});
}
