export const formatDate = (date: Date | number) => {
	return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(date);
};

export const formatMoney = (amount: number, currency: string) =>
	new Intl.NumberFormat("en-US", {
		style: "currency",
		currency,
	}).format(amount);

export const formatMoneyRange = (
	range: {
		start?: { amount: number; currency: string } | null;
		stop?: { amount: number; currency: string } | null;
	} | null,
) => {
	const { start, stop } = range || {};
	const startMoney = start && formatMoney(start.amount, start.currency);
	const stopMoney = stop && formatMoney(stop.amount, stop.currency);

	if (startMoney === stopMoney) {
		return startMoney;
	}

	return `${startMoney} - ${stopMoney}`;
};

export function getHrefForVariant({
	productSlug,
	variantId,
}: {
	productSlug: string;
	variantId?: string;
}): string {
	const pathname = `/products/${encodeURIComponent(productSlug)}`;

	if (!variantId) {
		return pathname;
	}

	const query = new URLSearchParams({ variant: variantId });
	return `${pathname}?${query.toString()}`;
}

/**
 * Converts a string to Base64URL encoding (URL-safe Base64) in browser environment
 * @param {string} str - The string to encode (supports Chinese characters, special symbols, etc.)
 * @returns {string} Base64URL encoded string (no padding, using `-` and `_` instead of `+` and `/`)
 * @note This function can only be used in browser environment due to the usage of btoa API
 */
export function browserToBase64URL(str: string) {
	if (!str) return "";
	return btoa(encodeURIComponent(str))?.replace(/\+/g, "-")?.replace(/\//g, "_")?.replace(/=+$/, ""); // 移除填充符
}

/**
 * Decodes a Base64URL encoded string back to its original string in browser environment
 * @param {string} base64UrlStr - Base64URL encoded string (no padding, using `-` and `_` instead of `+` and `/`)
 * @returns {string} The decoded original string
 * @note This function can only be used in browser environment due to the usage of atob API
 */
export function browserFromBase64URL(base64UrlStr: string) {
	if (!base64UrlStr) return "";
	const base64Str = base64UrlStr
		?.replace(/-/g, "+")
		?.replace(/_/g, "/")
		?.padEnd(Math.ceil(base64UrlStr.length / 4) * 4, "="); // 补全填充符
	return decodeURIComponent(atob(base64Str));
}

/**
 * Converts a string to Base64URL encoding (URL-safe Base64)
 * @param {string} str - The string to encode (supports Chinese characters, special symbols, etc.)
 * @returns {string} Base64URL encoded string (no padding, using `-` and `_` instead of `+` and `/`)
 * @note This function can only be used in Node.js environment due to the usage of Buffer API
 */
export function serverToBase64URL(str: string) {
	if (!str) return "";
	// 1. First encode the string with URI encoding to avoid invalid characters in Base64 (like spaces, Chinese characters)
	const uriEncodedStr = encodeURIComponent(str);
	// 2. Use Node.js Buffer to convert the URI-encoded string to standard Base64
	const base64 = Buffer.from(uriEncodedStr, "utf8").toString("base64");
	// 3. Replace special characters and remove padding
	return base64?.replace(/\+/g, "-")?.replace(/\//g, "_")?.replace(/=+$/, "");
}

/**
 * Decodes a Base64URL encoded string back to its original string
 * @param {string} base64UrlStr - Base64URL encoded string (no padding, using `-` and `_` instead of `+` and `/`)
 * @returns {string} The decoded original string
 * @note This function can only be used in Node.js environment due to the usage of Buffer API
 */
export function serverFromBase64URL(base64UrlStr: string) {
	if (!base64UrlStr) return "";
	// 1. Restore padding and special characters (`-`->`+`, `_`->`/`)
	const base64Str = base64UrlStr
		?.replace(/-/g, "+")
		?.replace(/_/g, "/")
		?.padEnd(Math.ceil(base64UrlStr.length / 4) * 4, "="); // Calculate and add padding
	// 2. Use Node.js Buffer to decode from Base64 to URI-encoded string
	const uriEncodedStr = Buffer.from(base64Str, "base64").toString("utf8");
	// 3. Decode the URI-encoded string to restore original characters
	return decodeURIComponent(uriEncodedStr);
}
