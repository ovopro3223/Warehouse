# Warehouse Pro

Warehouse Pro is a responsive inventory and POS management SPA built with **Next.js**, **TypeScript**, and **Tailwind CSS**. This package is ready to upload, build, and deploy as a modern web application.

## Key Features

- RTL Arabic-first interface with seamless locale switching
- Responsive desktop sidebar and mobile bottom navigation
- Inventory management with product cards, search, edit, and delete
- Dual POS buffers for simultaneous checkout sessions
- Live currency converter and calculator tools
- Settings panel for theme, compact layout, and exchange rate updates
- Local browser persistence for instant demo usage

## Setup

Install dependencies:

```bash
npm install
```

Run development mode:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Start the production server:

```bash
npm run start
```

## Deployment

The app is ready to deploy to platforms like Vercel, Netlify, or any Node-compatible host. The repository already includes a `.gitignore` that excludes `node_modules`, `.next`, and local environment files.

Open [http://localhost:3000](http://localhost:3000) after running the dev server to preview the Warehouse Pro interface.

## Notes

Edit `src/app/page.tsx` to extend the SPA, add real backend integration, or connect real-time sync services.

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
