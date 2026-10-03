# Clean Space

Marketing site and online booking for **Clean Space**, a home & office cleaning
company. Built with React, TypeScript and Vite. Served from
`https://lijuvp.com/CleanSpace/` as a fully standalone app.

## Pages

| Route                   | What it does                                              |
| ----------------------- | --------------------------------------------------------- |
| `/CleanSpace/`          | Home: hero quick-book, services, how it works, live price calculator, FAQ |
| `/CleanSpace/services`  | Every service with its checklist, starting price and add-ons |
| `/CleanSpace/book`      | 5-step booking wizard (service, details, schedule, contact, review) |

Deep links pre-fill the booking flow, e.g.
`/CleanSpace/book?service=deep&sqft=1500` or `/CleanSpace/book?service=sofa&seats=5`
(`frequency=weekly|biweekly|monthly` also works for regular and office cleaning).

## Develop

```bash
npm install
npm run dev        # http://localhost:5173/CleanSpace/
```

## Customise

- **Business details** (name, phone, email, hours, city, areas served, PIN prefix, currency,
  closed days, booking window): `src/data/config.ts`. The SEO title, description and
  location data live in `index.html`.
- **Services, prices, add-ons, discounts, time slots**: `src/data/services.ts`
- **Care Plans (monthly subscriptions)**: `src/data/plans.ts`, which sets what each plan includes,
  how many visits a year and the plan discount. Monthly prices are calculated from the service
  rates for the customer's home size, so they follow any rate changes automatically.
- **Price formula**: `src/lib/pricing.ts`
- **FAQ**: `src/components/Faq.tsx`
- **Colours & styling**: CSS variables at the top of `src/styles.css`

## Receiving bookings

Out of the box, bookings are only stored in the visitor's browser (demo mode).
To receive them by email, create a free form endpoint (e.g. [Formspree](https://formspree.io)),
then:

```bash
cp .env.example .env
# set VITE_BOOKING_ENDPOINT=https://formspree.io/f/xxxxxxx
npm run build
```

Each booking is POSTed as JSON (service, size, extras, date/time, contact,
price breakdown and a `CS-XXXXXX` reference).

## Google Calendar availability

When connected, the Schedule step only offers arrival times where the whole visit
fits around existing events on your bookings calendar, and every confirmed booking
is added to that calendar (customer, phone, address, price and reference). To block
time off, add any event to the calendar. Until it's connected, all times are offered.

This runs as two Vercel functions in `api/` (`/CleanSpace/api/availability` and
`/CleanSpace/api/book`). One-time setup:

1. In [Google Cloud Console](https://console.cloud.google.com/), create a project and
   enable the **Google Calendar API** (APIs & Services → Library).
2. Go to **IAM & Admin → Service accounts** and create a service account (skip the optional
   role and access steps). Back in the list, click the account's email to open it, then go to
   the **Keys** tab → **Add key → Create new key → JSON → Create**. A `.json` file downloads;
   keep it private. If key creation is blocked by an organization policy, use a personal
   @gmail.com Google account for the project, or turn off the
   `iam.disableServiceAccountKeyCreation` policy for this project.
3. In [Google Calendar](https://calendar.google.com), create a calendar (e.g. "Clean Space
   bookings"). In its **Settings → Share with specific people**, add the service
   account's email (`…@….iam.gserviceaccount.com`) with **Make changes to events**.
   Copy the **Calendar ID** from **Integrate calendar**.
4. In Vercel → project `clean-space` → **Settings → Environment Variables**, add:
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`: `client_email` from the JSON file
   - `GOOGLE_PRIVATE_KEY`: `private_key` from the JSON file (the whole
     `-----BEGIN PRIVATE KEY-----…` value)
   - `GOOGLE_CALENDAR_ID`: the Calendar ID
5. Redeploy (`npx vercel --prod`). Check
   `https://www.lijuvp.com/CleanSpace/api/availability?date=YYYY-MM-DD` returns
   `{"busy":[…]}` rather than `Calendar not connected`.

The functions only run on Vercel; with `npm run dev` every time is offered.

## Deploy to lijuvp.com/CleanSpace

### Vercel (current setup for lijuvp.com)

1. Deploy this folder as its own Vercel project (import the Git repo, or run
   `npx vercel --prod`). `vercel.json` already sets the build command and output, so
   the app is served at `https://<project>.vercel.app/CleanSpace/`.
2. If you use a booking endpoint, add `VITE_BOOKING_ENDPOINT` under
   Project → Settings → Environment Variables, then redeploy.
3. In the lijuvp.com project (`liju-portfolio`), proxy the path in `next.config.ts`:

   ```ts
   const CLEANSPACE = 'https://<project>.vercel.app'

   const nextConfig: NextConfig = {
     async rewrites() {
       return [
         { source: '/CleanSpace', destination: `${CLEANSPACE}/CleanSpace/` },
         { source: '/CleanSpace/:path*', destination: `${CLEANSPACE}/CleanSpace/:path*` },
       ]
     },
   }
   ```

   Commit and push; once that deploy finishes, `https://www.lijuvp.com/CleanSpace` serves
   this app. Future Clean Space changes only need a Clean Space deploy.

### Apache / Nginx / other static hosting

```bash
npm run build
```

Upload **the contents of `dist/`** (including the hidden `.htaccess`) into a
folder named `CleanSpace` at your web root, so `dist/index.html` ends up at
`https://lijuvp.com/CleanSpace/index.html`.

Because this is a single-page app, the server must fall back to
`/CleanSpace/index.html` for unknown paths (so `/CleanSpace/book` works on refresh):

- **Apache / cPanel / Hostinger shared hosting**: handled by the bundled `.htaccess`.
- **Nginx**:
  ```nginx
  location /CleanSpace/ {
    try_files $uri $uri/ /CleanSpace/index.html;
  }
  ```
- **GitHub Pages / other static hosts**: the build also emits `404.html` as a fallback.

The path is case-sensitive. To host under a different path, build with
`BASE_PATH=/other-path/ npm run build` and update `RewriteBase` in `public/.htaccess`.
