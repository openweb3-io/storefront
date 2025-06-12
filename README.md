[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fsaleor%2Fstorefront&env=NEXT_PUBLIC_SALEOR_API_URL&envDescription=Full%20Saleor%20GraphQL%20endpoint%20URL%2C%20eg%3A%20https%3A%2F%2Fstorefront1.saleor.cloud%2Fgraphql%2F&project-name=my-saleor-storefront&repository-name=my-saleor-storefront&demo-title=Saleor%20Next.js%20Storefront&demo-description=Starter%20pack%20for%20building%20performant%20e-commerce%20experiences%20with%20Saleor.&demo-url=https%3A%2F%2Fstorefront.saleor.io%2F&demo-image=https%3A%2F%2Fstorefront-d5h86wzey-saleorcommerce.vercel.app%2Fopengraph-image.png%3F4db0ee8cf66e90af)
[![Storefront Demo](https://img.shields.io/badge/VIEW%20DEMO-DFDFDF?style=for-the-badge)](https://storefront.saleor.io)

![Nextjs Storefront](./public/screenshot.png)

<div align="center">
  <h1>Saleor Next.js Storefront</h1>
  Starter pack for building performant e-commerce experiences with <a href="https://github.com/saleor/saleor">Saleor</a>.
</div>

<div align="center">
  <a href="https://saleor.io/">Website</a>
  <span> • </span>
  <a href="https://docs.saleor.io/docs/3.x">Docs</a>
  <span> • </span>
  <a href="https://saleor.io/roadmap">Roadmap</a>
  <span> • </span>
  <a href="https://twitter.com/getsaleor">Twitter</a>
  <span> • </span>
  <a href="https://saleor.io/discord">Discord</a>
</div>

<br/>

<div align="center">

[![Storefront Roadmap](https://img.shields.io/badge/ROADMAP-EFEFEF?style=for-the-badge)](https://saleor.io/roadmap)
[![Discord Badge](https://dcbadge.vercel.app/api/server/unUfh24R6d)](https://discord.gg/unUfh24R6d)

</div>

> [!TIP]
> Questions or issues? Check our [Discord](https://saleor.io/discord) channel for help.

## Features

- **Next.js 15**: File-based routing, React 19, Fast Refresh, Image Optimization and more.
- **App Router**: Uses React Server Components, Data Cache, and async components.
- **TypeScript**: Strongly typed codebase and GraphQL payloads with strict mode.
- **GraphQL best practices**: Uses GraphQL Codegen and `TypedDocumentString` to reduce boilerplate and bundle size.
- **Customizable CSS**: TailwindCSS can be extended or replaced with an alternative CSS solution.
- **Tooling included**: Comes with ESLint, Prettier, Husky, Lint Staged, and Codegen preconfigured.

**Global:**

- Dynamic menu
- Hamburger menu
- SEO data

**Checkout:**

- Single page checkout (including login)
- Portable to other frameworks (doesn't use Next.js components)
- Adyen integration
- Stripe integration
- Customer address book
- Vouchers and Gift Cards

**Product catalog:**

- Categories
- Variant selection
- Product attributes
- Image optimization

**My account:**

- Order completion
- Order details

## Quickstart

### 1. Create Saleor backend instance

To quickly get started with the backend, use a free developer account at [Saleor Cloud](https://cloud.saleor.io/?utm_source=storefront&utm_medium=github).

Alternatively you can [run Saleor locally using docker](https://docs.saleor.io/docs/3.x/setup/docker-compose?utm_source=storefront&utm_medium=github).

### 2. Clone storefront

#### [Option 1] Using Comand line tools

Install or update to the latest version of the [Saleor CLI](https://docs.saleor.io/docs/3.x/cli) by running the following command:

```bash
npm i -g @saleor/cli@latest
```

Clone storefront, install dependencies, and connect with the provided Saleor instance hostname

```bash
saleor storefront create --url https://{SALEOR_HOSTNAME}/graphql/
```

#### [Option 2] Manual install

Clone repository:

```bash
git clone https://github.com/saleor/storefront.git
```

Copy environment variables from `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and set `NEXT_PUBLIC_SALEOR_API_URL` to your Saleor GraphQL endpoint URL, e.g., `https://example.saleor.cloud/graphql/`.

Then, [install `pnpm`](https://pnpm.io/installation) and run the following command to install all dependencies in the repo:

```bash
pnpm i
```

## Payments

Currently, Saleor Storefront supports payments via the [Saleor Adyen App](https://docs.saleor.io/docs/3.x/developer/app-store/apps/adyen). To install and configure the payment app go to the "Apps" section in the Saleor Dashboard (App Store is only available in Saleor Cloud).

> WARNING:
> To configure the Adyen App, you must have an account with [Adyen](https://www.adyen.com/).

## Development

To start the development server, run the following:

```bash
pnpm dev
```

<a id="env" style="text-decoration: underline;text-decoration: none;color: inherit;">Environment variables required at runtime<a/>

```shell
# Replace URL with your Saleor backend. Make sure to keep the slash at the end.
PORT=80
BASE_URL=localhost

# Your sales api
NEXT_PUBLIC_SALEOR_API_URL=https://store-openweb3.saleor.cloud/graphql/

# Storefront url
NEXT_PUBLIC_STOREFRONT_URL=https://4b86554eee8059fe9598086f48e3feb6.serveo.net

# Token used for fetching channels（option）
SALEOR_APP_TOKEN=

# Tg/Dejay auth url
NEXT_PUBLIC_AUTH_URL=https://a865-103-152-220-14.ngrok-free.app

# Default field provider
NEXT_PUBLIC_TELEGRAM_MOCK_PROVIDER=telegram

# Default field init data
NEXT_PUBLIC_TELEGRAM_MOCK_INIT_DATA="user%3D%257B%2522id%2522%253A5861990984%252C%2522first_name%2522%253A%2522King%2522%252C%2522last_name%2522%253A%2522%2522%252C%2522username%2522%253A%2522Svenlai666%2522%252C%2522language_code%2522%253A%2522zh-hans%2522%252C%2522allows_write_to_pm%2522%253Atrue%252C%2522photo_url%2522%253A%2522https%253A%255C%252F%255C%252Ft.me%255C%252Fi%255C%252Fuserpic%255C%252F320%255C%252FfOso4OMYHXqI0CdCO2hxaqi5A23cXtUBjFLnUoRJa_aPy1E8DABF_Hm179IT0QOn.svg%2522%257D%26chat_instance%3D3930809717662463213%26chat_type%3Dprivate%26auth_date%3D1745999001%26signature%3DCVuFy8jWC8PNwkWdbA7tPueIbNqkUNxtillFjZQGL2yY47BhtAhh6QGqc3UwLwq9QYG6eMBSf-pcNibA49YUCA%26hash%3D5fb2ea078b8265c57271590e5a41f7a050f9892c25defd98fb7b380e3305d228&tgWebAppVersion=8.0&tgWebAppPlatform=macos&tgWebAppThemeParams=%7B%22secondary_bg_color%22%3A%22%23131415%22%2C%22subtitle_text_color%22%3A%22%23b1c3d5%22%2C%22text_color%22%3A%22%23ffffff%22%2C%22section_header_text_color%22%3A%22%23b1c3d5%22%2C%22destructive_text_color%22%3A%22%23ef5b5b%22%2C%22bottom_bar_bg_color%22%3A%22%23213040%22%2C%22section_bg_color%22%3A%22%2318222d%22%2C%22button_text_color%22%3A%22%23ffffff%22%2C%22accent_text_color%22%3A%22%232ea6ff%22%2C%22button_color%22%3A%22%232ea6ff%22%2C%22link_color%22%3A%22%2362bcf9%22%2C%22bg_color%22%3A%22%2318222d%22%2C%22hint_color%22%3A%22%23b1c3d5%22%2C%22header_bg_color%22%3A%22%23131415%22%2C%22section_separator_color%22%3A%22%23213040%22%7D"

```

The app is now running at `http://localhost:3000`.

> NOTE:
> Saleor Storefront is a Next.js app. In case you are not familiar with Next.js, we recommend you to read the [Next.js documentation](https://nextjs.org/docs) (make sure you've selected "Using App Router" in the sidebar).

#### GraphQL queries and mutations:

After altering or creating new GraphQL queries in `gql` folder, you need to run the following command to generate types and javascript queries:

```bash
pnpm run generate
```

### Preview content changes instantly (Draft Mode)

Visit `http://{your-host}/api/draft` to enable cookies that disable caching to preview catalog and content changes instantly. [Learn more about the Draft Mode in Next.js docs.](https://nextjs.org/docs/app/building-your-application/configuring/draft-mode)
