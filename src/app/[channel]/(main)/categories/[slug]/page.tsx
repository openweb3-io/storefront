import { notFound } from "next/navigation";
import { type ResolvingMetadata, type Metadata } from "next";
import { ProductListByCategoryDocument } from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";
import { ProductList } from "@/ui/components/ProductList";
import { serverToBase64URL } from "@/lib/utils";

export const generateMetadata = async (
	props: { params: Promise<{ slug: string; channel: string }> },
	parent: ResolvingMetadata,
): Promise<Metadata> => {
	const params = await props.params;
	const { category } = await executeGraphQL(ProductListByCategoryDocument, {
		variables: { slug: params.slug, channel: params.channel },
		revalidate: 60,
	});

	return {
		title: `${category?.name || "Categroy"} | ${category?.seoTitle || (await parent).title?.absolute}`,
		description: category?.seoDescription || category?.description || category?.seoTitle || category?.name,
		openGraph: {
			url: process.env.NEXT_PUBLIC_STOREFRONT_URL
				? process.env.NEXT_PUBLIC_STOREFRONT_URL + `/${params.channel}/categories/${params.slug}`
				: undefined,
		},
		other: {
			["og:params"]: serverToBase64URL(`/${params.channel}/categories/${params.slug}`),
		},
	};
};

export default async function Page(props: { params: Promise<{ slug: string; channel: string }> }) {
	const params = await props.params;
	const { category } = await executeGraphQL(ProductListByCategoryDocument, {
		variables: { slug: params.slug, channel: params.channel },
		revalidate: 60,
	});

	if (!category || !category.products) {
		notFound();
	}

	const { name, products } = category;

	return (
		<div className="mx-auto max-w-7xl p-8 pb-16">
			<h1 className="pb-8 text-xl font-semibold">{name}</h1>
			<ProductList products={products.edges.map((e) => e.node)} />
		</div>
	);
}
