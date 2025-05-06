import { Suspense } from "react";
import { type Metadata } from "next";
import { Loader } from "@/ui/atoms/Loader";
import { LoginForm } from "@/ui/components/LoginForm";
import { serverToBase64URL } from "@/lib/utils";

export async function generateMetadata(props: {
	params: Promise<{ slug: string; channel: string }>;
	searchParams: Promise<{ variant?: string }>;
}): Promise<Metadata> {
	const params = await props.params;
	return {
		title: "Shopping Login · Saleor Storefront example",
		other: {
			["og:params"]: serverToBase64URL(`/${params.channel}/login`),
		},
		openGraph: {
			url: process.env.NEXT_PUBLIC_STOREFRONT_URL
				? process.env.NEXT_PUBLIC_STOREFRONT_URL + `/${params.channel}/login`
				: undefined,
		},
	};
}
export default function LoginPage() {
	return (
		<Suspense fallback={<Loader />}>
			<section className="mx-auto max-w-7xl p-8">
				<LoginForm />
			</section>
		</Suspense>
	);
}
