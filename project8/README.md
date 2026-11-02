# Commonplace

**Good things grow here.** Commonplace is a responsive community-events frontend for discovering local volunteer opportunities and bringing neighbors together.

**Live site URL:** [Local preview](http://localhost:3000)  
**Status:** Frontend prototype; connect an API and authentication provider before production deployment.

## What you can do

- Browse upcoming neighborhood events by date, category, or search term.
- View event details and join events from a personal account.
- Create, edit, and remove events you organized.
- Save demo account, event, and joined-event state in the browser with `localStorage`.
- Switch between light and dark themes; the preference is remembered.
- Explore responsive layouts for mobile, tablet, and desktop.
- Discover the platform through a community-focused homepage, photo gallery, and newsletter signup mockup.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Notes

This repository contains the frontend only. Account state is a browser-based demo, not secure authentication; event data is not shared across browsers. A production release needs a backend, persistent database, and server-verified authorization/JWT handling.
