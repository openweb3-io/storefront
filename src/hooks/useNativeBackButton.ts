import { useEffect } from "react";
import { nativeBackButton } from "@/lib/openweb";
export const useNativeBackButton = (onClick: () => void, disabled?: boolean) => {
	useEffect(() => {
		if (!disabled) return;

		nativeBackButton.show();

		nativeBackButton.on("click", onClick);

		return () => {
			nativeBackButton.off("click", onClick);
			nativeBackButton.hide();
		};
	}, [onClick, disabled]);
};
