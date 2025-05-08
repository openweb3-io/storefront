"use client";

import { isTMA } from "@telegram-apps/sdk-react";
import React, { type PropsWithChildren, useEffect, useState } from "react";
import { BrowserLayout } from "./Browser/BrowserLayout";
import { TmaLayout } from "./TMA/TmaLayout";

// eslint-disable-next-line import/no-default-export
export default function RuntimePlatform({ children }: PropsWithChildren) {
	const [tma, setTMA] = useState<boolean | undefined>(undefined);
	useEffect(() => {
		// XXX 这里要严格检查，不能 isTMA('simple')
		// 因为浏览器 mock 会将 launchParams 设置到 sessionStorage，导致后续 isTMA('simple') 认为在 tg 中
		// eslint-disable-next-line
		isTMA().then((val) => {
			console.log(val, "Telegram runtime");
			setTMA(val);
		});
	}, []);

	if (tma === undefined) {
		return <></>;
	} else if (tma) {
		return <TmaLayout>{children}</TmaLayout>;
	} else {
		return <BrowserLayout>{children}</BrowserLayout>;
	}
}
