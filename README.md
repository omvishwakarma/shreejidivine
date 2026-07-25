# Shreeji Divine — E‑commerce

Next.js App Router store for **Shreeji Divine Aroma Stone**.

**Domain:** https://shreejidivinearoma.com

## Features

- Shop & product pages
- Cart (localStorage)
- Checkout (COD) with saved addresses
- Login / Sign up
- Profile — past orders, order detail, addresses

## Setup

```bash
npm install
npx prisma migrate dev
npm run dev
```

Open http://localhost:3000

## Notes

- SQLite DB at `prisma/dev.db`
- Set a strong `AUTH_SECRET` in `.env` for production
- Payment is Cash on Delivery (no gateway yet)
