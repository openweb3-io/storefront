import { notFound } from "next/navigation";
import { type Metadata } from "next";
import { ProductListPaginatedDocument } from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";
import { Pagination } from "@/ui/components/Pagination";
import { ProductList } from "@/ui/components/ProductList";
import { ProductsPerPage } from "@/app/config";
import { serverToBase64URL } from "@/lib/utils";

export async function generateMetadata(props: {
	params: Promise<{ slug: string; channel: string }>;
	searchParams: Promise<{ variant?: string }>;
}): Promise<Metadata> {
	const params = await props.params;

	return {
		title: "Products · Saleor Storefront example",
		description: "All products in Saleor Storefront example",
		openGraph: {
			url: process.env.NEXT_PUBLIC_STOREFRONT_URL
				? process.env.NEXT_PUBLIC_STOREFRONT_URL + `/${params.channel}/products`
				: undefined,
		},
		other: {
			["og:params"]: serverToBase64URL(`/${params.channel}/products`),
		},
	};
}

export default async function Page(props: {
	params: Promise<{ channel: string }>;
	searchParams: Promise<{
		cursor: string | string[] | undefined;
	}>;
}) {
	const searchParams = await props.searchParams;
	const params = await props.params;
	const cursor = typeof searchParams.cursor === "string" ? searchParams.cursor : null;

	const { products } = await executeGraphQL(ProductListPaginatedDocument, {
		variables: {
			first: ProductsPerPage,
			after: cursor,
			channel: params.channel,
		},
		revalidate: 60,
	});

	if (!products) {
		notFound();
	}

	const newSearchParams = new URLSearchParams({
		...(products.pageInfo.endCursor && { cursor: products.pageInfo.endCursor }),
	});

	return (
		<section className="mx-auto max-w-7xl p-8 pb-16">
			<h2 className="sr-only">Product list</h2>
			<ProductList products={products.edges.map((e) => e.node)} />
			<Pagination
				pageInfo={{
					...products.pageInfo,
					basePathname: `/products`,
					urlSearchParams: newSearchParams,
				}}
			/>
		</section>
	);
}
