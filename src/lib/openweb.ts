import { backButton } from "@telegram-apps/sdk-react";

export const nativeBackButton = {
	show: () => backButton.show(),
	hide: () => backButton.hide(),
	on: (_event: "click", listener: () => void) => {
		backButton.onClick(listener);
	},
	off: (_event: "click", listener: () => void) => {
		backButton.offClick(listener);
	},
};
