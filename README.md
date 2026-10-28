# Mobile Gallary

A mobile phone retail and repair storefront built with Next.js, Supabase PostgreSQL, and Supabase Storage. Vercel is used only to host and deploy the web app. There is no cart, checkout, stock count, or payment flow.

## What is included

- Responsive public storefront with glassmorphism and claymorphism styling
- Separate public pages for Repairs (`/repairs`), Devices (`/devices`), Team (`/team`), Contact (`/contact`), Privacy, and Terms
- `/admin` protected by a server-verified 4-digit PIN session
- Admin CRUD for products, repair services, team members, homepage copy, contact details, privacy policy, and terms
- Product, service, and team image uploads to a public Supabase Storage bucket with admin-only writes
- PostgreSQL row-level security for public read access and allowlisted administrator writes
- Vercel deployment instructions

## Supabase setup

1. Create a Supabase project.
2. In **SQL Editor**, run the complete `supabase/schema.sql` script. It also adds safe, idempotent demo content (without stock quantities) when the tables are empty; replace or delete that content from `/admin` for the real store.
3. Add the shop address in **Admin → Contact details**. The contact page automatically renders a lazy-loaded Google Map from that address; add a Google Maps URL as well if you want the “Open map” directions link.
4. Add many landscape shop photos from **Admin → Shop gallery**. Choose `home` or `visit`, upload one 16:9 photo, set its order and repeat to build each gallery. The site applies a subtle premium motion effect and uses the saved alt text for accessibility.
3. Copy the project URL, publishable/anon key, and service-role key from **Project Settings → API**.
4. Copy `.env.example` to `.env.local` and configure the Supabase keys, desired 4-digit PIN, and a random signing secret:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-publishable-or-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key-server-only
   ADMIN_ACCESS_PIN=your-4-digit-password
   ADMIN_PIN_SESSION_SECRET=generate-a-random-secret-at-least-32-characters
   ```

   The database schema creates `shop-assets`, configures 5 MB image limits, enables RLS, and adds a database-backed PIN attempt limiter. The service-role key is used only by server-side admin APIs; never expose it in browser code or add a `NEXT_PUBLIC_` prefix.

Set `ADMIN_ACCESS_PIN` to the client's chosen four digits, such as `1234`, and `ADMIN_PIN_SESSION_SECRET` to a random secret generated with `node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"`. Change the example PIN before deployment. Four-digit PINs have limited strength; failed attempts are rate-limited per IP to five attempts per 15-minute window using Supabase PostgreSQL. The PIN is never embedded in browser JavaScript; successful verification creates a signed HTTP-only cookie, and admin CRUD/image operations are only available through server routes after PIN verification.

## Run locally

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. Visit `/admin/login` and enter the configured 4-digit PIN. Supabase URL, anon key, service-role key, PIN, and signing secret must be set for admin functionality.

## Deploy to Vercel

1. Push the project to a Git provider and import it into Vercel.
2. Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_ACCESS_PIN`, and `ADMIN_PIN_SESSION_SECRET` as Vercel environment variables for the desired deployment environments. Set `NEXT_PUBLIC_SITE_URL` to the public site URL so `/sitemap.xml` contains production URLs.
3. Change the example PIN to the client’s chosen four digits before deploying.
4. Deploy. Vercel hosts the Next.js app; all application data and uploaded images remain in Supabase.

## Content notes

- Add only real products/services and details from the admin. There is intentionally no stock/inventory quantity field and no sample stock data.
- Products can list a price and condition but have no purchase action. Contact the shop to ask about availability.
- Homepage and contact settings are administrator-editable and are loaded from PostgreSQL.
- Homepage settings include the price currency (INR, USD, EUR, or GBP).
- Privacy and terms pages render the corresponding text saved from `/admin`.
