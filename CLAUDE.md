@AGENTS.md

# Component Placement Rules

## Reusable components → `src/components/`

Generic, route-agnostic UI primitives that can be used across multiple routes go here.

- `src/components/ui/` — shadcn/base UI primitives (Button, Input, Badge, etc.)
- `src/components/` — higher-level shared components (e.g. AppShell, ThemeToggle)

## Route-specific components → `src/<route>/_components/`

Components tightly coupled to a single route live alongside that route.

- Example: `src/app/(dashboard)/_components/` for dashboard-only components
- Example: `src/app/home/_components/` for home-page-only components
- Never import route-specific components from other routes.

## Rule of thumb

Start in `_components/` next to the route. Only promote to `src/components/` when a second route needs it.
