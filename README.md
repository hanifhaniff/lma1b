# LMA Office Project

Modern operations portal for the LMA 1B office that combines a marketing site, authenticated dashboards, asset registries, network usage analytics, and a secure file vault built with Next.js 15, React 19, Tailwind CSS 4, Clerk, Supabase, Cloudflare R2, and Ruijie Cloud APIs.

## Feature Highlights

- **Branded public landing page** (`src/app/page.tsx`) with sticky navigation, hero CTA, project gallery, testimonials, and contact form components built from shadcn/ui primitives.
- **Authenticated dashboard shell** (`src/app/dashboard`) that renders quick stats, asset summaries, bar/area/pie charts (Recharts), and a responsive navigation system with Clerk user controls.
- **Laptop inventory management** (`src/app/laptops`) powered by React Hook Form + Zod validation, drag-and-drop image uploads to Cloudflare R2 (`/api/laptops/upload`), rich data-table filtering/sorting, and Supabase CRUD APIs (`/api/laptops`).
- **Radio fleet tracking** (`src/app/radio`) featuring search, pagination, modal forms, and Supabase server actions guarded by Clerk.
- **Secure file vault & sharing** (`src/app/file`, `/link`, `/share/[shareId]`) that lets users upload password-protected files to R2, organize folders, generate expiring share links, manage those links, and deliver password-checked downloads to external recipients.
- **Voucher automation** for Ruijie Wi-Fi (`src/app/voucher`, `/ruijie`) with profile presets, pagination, search, chart drill-down (`VoucherChartModal`), and creation flows that hit the Ruijie Cloud API via `/api/vouchers`.
- **Starlink bandwidth intelligence** (`src/app/starlink` & `/starlink/crud`) that aggregates Supabase `starlink_usage` records by day/month/unit, renders comparison charts, and offers a CRUD console with duplicate detection and SweetAlert prompts.

## Application Modules

### Landing & Branding (`/`)
Marketing-focused homepage for LMA's contractor services. Content blocks (services, stats, certifications, core values, contact) live in `src/app/page.tsx` so marketing copy or imagery (in `public/`) can be updated without touching business logic.

### Dashboard (`/dashboard`)
`DashboardNavbar` centralizes routing to all back-office modules and exposes Clerk's `UserButton` plus a theme toggle. The dashboard itself uses mocked data today (see `assetData`, `monthlyData`, etc.) but is structured around composable cards and Recharts components so real Supabase data can replace the placeholders with minimal work.

### Laptop Inventory (`/laptops`)
- `laptop-form.tsx` contains a full-screen dialog form driven by React Hook Form + Zod and supports drag/drop or manual image uploads via `drag-drop-image-upload.tsx`.
- Records persist through `src/app/api/laptops/route.ts`, which relies on `createSupabaseServerClient` and Clerk auth (all HTTP verbs implemented).
- `LaptopViewModal`, `data-table.tsx`, and `columns.tsx` define the advanced table experience (sorting, filtering, column visibility, row actions).
- Uploaded images sit in Cloudflare R2 under `laptops/{id}/...`; the returned public URL currently assumes `https://file.abdul-hanif.com`-change the host if you expose R2 differently.

### Radio Inventory (`/radio`)
`RadioClient` handles table rendering, search via `/api/radios?search=...`, pagination controls, and CRUD dialogs (`RadioForm`). Server actions in `src/app/radio/actions.ts` talk directly to the Supabase `radio` table. The entire module is Clerk-protected.

### File Vault & Sharing (`/file`, `/link`, `/share/[shareId]`)
- `FilePageClient` covers uploads (with password option), folder creation (`/api/file/folder/create`), grid/list view toggles, search, deletion, and progress indicators. Uploads hit `/api/file/upload`, which streams binaries to Cloudflare R2 and stores metadata in Supabase's `files` table (see `src/lib/FILE_MANAGEMENT_SETUP.md` for schema).
- `ShareModal` lets users choose expirations (1h -> unlimited) and generates share URLs via `/api/file/share/[filekey]`. Those links resolve to `/share/:shareId`, where `DownloadFilePage` verifies passwords (if required) before proxying downloads through `/api/file/download-shared/[shareId]`.
- `src/app/link` provides an authenticated list of all issued share links, with copy-to-clipboard, expiration visibility, and deletion powered by `/api/link/delete/[shareId]`.
- Every API handler defends against missing tables by calling helpers in `src/lib/setup-files.ts` / `setup-file-shares.ts` and surfaces actionable error messages pointing back to the setup documentation.

### Voucher Management (`/voucher`, `/ruijie`)
`src/app/voucher/page.tsx` is the Clerk-guarded experience for day-to-day voucher work: search by name/code, pagination, quick stats, chart modal, and a create dialog tied to `/api/vouchers`. `src/app/ruijie/page.tsx` offers a simplified, password-gated interface (temporary fallback) that hits the same API-replace the hard-coded password before production.

### Starlink Analytics (`/starlink`, `/starlink/crud`)
- `src/components/starlink-usage-chart.tsx` renders grouped line/bar charts per unit.
- `src/app/starlink/page.tsx` consumes `/api/starlink?groupBy=...` endpoints to display month pickers, chart-type toggles, and summary cards sourced from Supabase aggregations found in `src/lib/starlink-usage.ts`.
- `/starlink/crud` adds a Clerk-protected management console for inserting, editing, or deleting `starlink_usage` rows with duplicate detection (per date + unit) and contextual modals.

## API Surface (located under `src/app/api`)

| Route | Methods | Purpose / Data source |
| --- | --- | --- |
| `/api/laptops` | GET, POST, PUT, DELETE | Supabase `laptops` table CRUD guarded by Clerk. |
| `/api/laptops/upload` | POST | Upload laptop images to Cloudflare R2 and return a public URL. |
| `/api/file/upload`, `/api/file/list`, `/api/file/delete/[filekey]`, `/api/file/folder/create` | POST/GET/DELETE | File metadata stored in Supabase `files`, binaries stored in Cloudflare R2. |
| `/api/file/download/[filekey]` | GET, POST | Authenticated file downloads; POST handles password-protected files. |
| `/api/file/share/[filekey]` | GET, POST | Generate or refresh share links recorded in Supabase `file_shares`. |
| `/api/file/download-shared/[shareid]` | GET, POST | Validate share links (and optional passwords) before issuing signed R2 URLs. |
| `/api/link/list`, `/api/link/delete/[shareid]` | GET, DELETE | Manage rows inside Supabase `file_shares` for the Link Management UI. |
| `/api/radios` | GET | Query Supabase `radio` entries (server actions cover create/update/delete). |
| `/api/vouchers` | GET, POST | Proxy to Ruijie Cloud voucher APIs, requires `ACCESS_TOKEN_RUIJIE`. |
| `/api/starlink` | GET, POST | Aggregate or insert Supabase `starlink_usage` data (supports `groupBy` query params). |
| `/api/starlink/[id]` | PUT, DELETE | Update or remove specific `starlink_usage` records. |

## Tech Stack

- **Framework**: Next.js 15 App Router, React 19, TypeScript.
- **Styling/UI**: Tailwind CSS 4, shadcn/ui, Radix primitives, Lucide icons, Embla Carousel, Recharts.
- **Auth**: Clerk (`@clerk/nextjs`) guards all back-office pages.
- **Data layer**: Supabase (`src/lib/supabase.ts`, `supabase-client.ts`) for laptops, radios, starlink usage, and file metadata.
- **Storage**: Cloudflare R2 accessed through the AWS SDK (`@aws-sdk/client-s3`) for large binaries.
- **External APIs**: Ruijie Cloud Voucher API (see `/api/vouchers`), Cloudflare R2, optional AI providers via `ai` / `@ai-sdk/*`.
- **Utilities**: SweetAlert2, Sonner toasts, React Hook Form + Zod, uuid, TanStack Table, Clerk UI widgets.

## Key Directories

- `src/app/page.tsx` - marketing landing page.
- `src/app/dashboard` - dashboard layout, navbar, and stat widgets.
- `src/app/laptops` - laptop table, forms, services, modals, and data-table helpers.
- `src/app/radio` - radio CRUD UI + server actions.
- `src/app/file` - file manager client, share modal, server layout.
- `src/app/link` - shared-link management UI.
- `src/app/share/[shareId]` - public download experience for share recipients.
- `src/app/voucher` & `src/app/ruijie` - Ruijie voucher tooling.
- `src/app/starlink` & `src/app/starlink/crud` - analytics dashboard and CRUD surface.
- `src/app/api/**` - Next.js route handlers for Supabase, R2, and Ruijie integrations.
- `src/lib/` - shared clients, environment checks, Starlink data helpers, and SQL/setup docs.
- `src/components/` - shared navbar, theme toggle, shadcn exports, and Starlink chart.

## Environment Variables

Set the following in `.env.local` (the sample file in the repo contains placeholders only):

### Authentication (Clerk)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

### Supabase
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_URL` *(optional server alias, used if NEXT_PUBLIC is missing)*
- `SUPABASE_SERVICE_ROLE_KEY` *(required for server-side writes / aggregation)*
- `SUPABASE_ANON_KEY` *(fallback if you do not expose NEXT_PUBLIC)*

### Cloudflare R2
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_ACCESS_KEY_ID`
- `CLOUDFLARE_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- Update `src/app/api/laptops/upload/route.ts` if you expose a different public domain than `file.abdul-hanif.com`.

### External APIs
- `ACCESS_TOKEN_RUIJIE` - Ruijie Cloud API token for voucher list/create operations.

### Optional AI keys
- `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` - not used yet, but `src/lib/env-check.ts` reports their availability for future AI features.

> Run `checkEnvironmentVariables()` (see `src/lib/env-check.ts`) inside a script to confirm everything is wired before starting the app.

## Database & Storage Setup

1. **Supabase project**
   - Provision a Supabase instance and plug the URL/keys into `.env.local`.
   - Create the following tables (feel free to adjust types, but keep column names aligned with the TypeScript interfaces):
     - `laptops`: `id uuid primary key default gen_random_uuid()`, `created_at timestamptz`, `name text`, `assigned_user text`, `serial_number text`, `asset_number text`, `model_type text`, `no_bast text`, `date_received date`, `condition text`, `notes text`, `image_url text`.
     - `radio`: `id bigint primary key`, `created_at timestamptz default now()`, `nama_radio text`, `tipe_radio text`, `serial_number text`, `user_radio text`, `nomor_bast text`.
     - `starlink_usage`: matches `StarlinkUsage` in `src/lib/starlink-usage.ts` (`tanggal date`, `unit_starlink text`, `total_pemakaian numeric`, timestamp columns).
     - `files` and `file_shares`: run the ready-made SQL scripts in `src/lib/setup-files-table.sql` and `src/lib/setup-file-shares-table.sql` (or follow the prose guide in `src/lib/FILE_MANAGEMENT_SETUP.md`).
2. **Cloudflare R2**
   - Create a bucket that will host uploaded files (`R2_BUCKET_NAME`).
   - Generate API tokens (Account ID, Access Key ID, Secret Access Key) with write access.
   - Optionally map a custom domain and update the URL returned by `/api/laptops/upload`.
3. **Ruijie Cloud**
   - Request an `ACCESS_TOKEN_RUIJIE` via the Ruijie Cloud console, then plug it into `.env.local`.
   - Update the `profileOptions` arrays inside `src/app/voucher/page.tsx` and `src/app/ruijie/page.tsx` if your tenant uses different group/profile IDs.

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Configure environment**
   - Duplicate `.env.local` and fill in the variables listed above.
   - Follow the "Database & Storage Setup" section to ensure Supabase tables and Cloudflare R2 buckets exist.
3. **Run the development server**
   ```bash
   npm run dev
   ```
   Visit `http://localhost:3000`, sign in with a Clerk account, and browse to `/dashboard`, `/laptops`, etc.
4. **Build for production**
   ```bash
   npm run build
   npm run start
   ```
   Deploy on Vercel or any Node 18+ host-ensure the same environment variables are available at runtime.

## Operational Notes

- Pages requiring Clerk authentication: `/dashboard`, `/file`, `/link`, `/laptops`, `/radio`, `/voucher`, `/starlink/crud`. Public/anonymous pages include `/`, `/share/[shareId]`, `/starlink`, and the temporary `/ruijie` (which still gates via a password).
- File management surfaces will warn if the `files` or `file_shares` tables are missing; consult `src/lib/FILE_MANAGEMENT_SETUP.md` whenever you see the "setupRequired" flag in API responses.
- Starlink endpoints reject duplicate `(tanggal, unit_starlink)` combinations to keep analytics clean.
- The Ruijie voucher module logs unexpected API payloads to aid debugging-monitor your server logs when integrating with a new list ID or tenant.
- No automated tests ship with this project yet; rely on manual verification across each route after schema or env changes.

## Helpful References

- `src/lib/FILE_MANAGEMENT_SETUP.md` - step-by-step guide for provisioning Supabase tables used by the file vault.
- `src/lib/setup-files-table.sql` / `src/lib/setup-file-shares-table.sql` - copy/paste SQL for the required file tables.
- `src/lib/starlink-usage.ts` - reusable Supabase queries and aggregations for bandwidth analytics.
- `LICENSE` - MIT License covering this repository.

## License

This project is released under the [MIT License](LICENSE).
