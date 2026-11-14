# StudySync AI — Client

React + Vite + Tailwind CSS v4 frontend for StudySync AI. Owned by the frontend developer (Agent 2); see the root `CLAUDE.md`.

## Getting started

```bash
cd client
npm install
npm run dev      # http://localhost:5173
npm run build    # production build into client/dist
npm run preview  # serve the production build locally
```

## Structure

```
src/
  components/
    common/     shared UI: Button, EmptyState, LoadingState, ErrorState, PageHeader, Logo
    dashboard/  UploadCard, QuickActions, QuickActionCard, RecentMaterials
    layout/     AppLayout, Sidebar, MobileHeader
  config/       navigation items and route ids
  hooks/        useHashRoute (tiny hash-based router, e.g. #/flashcards)
  pages/        one component per sidebar view
  App.jsx       picks the page for the current route
  index.css     Tailwind import and theme tokens (cream, lavender, ink)
```

## Backend integration (not connected yet)

- The UI does not call any API yet. Materials are an empty list, so every view shows its empty state.
- `vite.config.js` proxies `/api/*` to `http://localhost:3001`. **Proposed ports, still to be agreed with the backend:** Express on `3001`, Vite on `5173`.
- Endpoint paths and JSON shapes will come from the shared API contract once both developers agree on it.
