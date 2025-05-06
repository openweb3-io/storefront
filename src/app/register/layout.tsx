import { type ReactNode } from "react";

export const metadata = {
	title: "Saleor Storefront Register",
	description: "Starter pack for building performant e-commerce experiences with Saleor.",
};

export default function RootLayout(props: { children: ReactNode }) {
	return <main>{props.children}</main>;
}
