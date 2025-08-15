import { type Metadata } from "next";
import { ProductListByCollectionDocument } from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";
import { ProductList } from "@/ui/components/ProductList";
import { serverToBase64URL } from "@/lib/utils";

export async function generateMetadata(props: {
	params: Promise<{ slug: string; channel: string }>;
	searchParams: Promise<{ variant?: string }>;
}): Promise<Metadata> {
	const params = await props.params;

	return {
		title: "Ovis's Store Storefront, powered by Saleor",
		description:
			"Storefront Next.js Example for building performant e-commerce experiences with Saleor - the composable, headless commerce platform for global brands.",
		other: {
			["og:params"]: serverToBase64URL(`/${params.channel}`),
		},
		openGraph: {
			url: process.env.NEXT_PUBLIC_STOREFRONT_URL
				? process.env.NEXT_PUBLIC_STOREFRONT_URL + `/${params.channel}`
				: undefined,
		},
	};
}

export default async function Page(props: { params: Promise<{ channel: string }> }) {
	const params = await props.params;
	const data = await executeGraphQL(ProductListByCollectionDocument, {
		variables: {
			slug: "featured-products",
			channel: params.channel,
		},
		revalidate: 60,
	});

	if (!data.collection?.products) {
		return null;
	}

	const products = data.collection?.products.edges.map(({ node: product }) => product);

	return (
		<section className="mx-auto max-w-7xl p-8 pb-16">
			<h2 className="sr-only">Product list</h2>
			<ProductList products={products} />
		</section>
	);
}
