# Implementation Plan: Sistema Maré

## Overview

Build the Sistema Maré monorepo from scratch: set up the pnpm workspace, implement the core business logic package with property-based tests, configure the Prisma database package, and wire up the Next.js web application with all CRUD pages and server actions.

## Tasks

- [x] 1. Initialize monorepo structure
  - Create root `package.json` with pnpm workspace scripts: `dev`, `build`, `lint`, `test`, `db:generate`, `db:migrate`, `db:studio`
  - Create `pnpm-workspace.yaml` declaring `apps/*` and `packages/*`
  - Create directory skeleton: `apps/web`, `packages/core`, `packages/database`
  - _Requirements: 10.1, 10.6_

- [x] 2. Implement `packages/core` — types and business logic
  - [x] 2.1 Create `packages/core/src/types.ts`
    - Export `ControlType` union type (`"INCREASE" | "DECREASE"`) and `Control` interface matching the domain model
    - _Requirements: 1.1, 2.1_

  - [x] 2.2 Create `packages/core/src/calculate-control-balance.ts`
    - Implement `calculateControlBalance` with `dayOfMonth` > `date.getDate()` > `new Date().getDate()` priority
    - Apply INCREASE formula: `baseValueCents + dailyStepCents * dayOfMonth`
    - Apply DECREASE formula: `baseValueCents - dailyStepCents * dayOfMonth`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [x] 2.3 Create `packages/core/src/money.ts`
    - Implement `formatCentsToBRL` using `Intl.NumberFormat` with `locale: "pt-BR"`, `style: "currency"`, `currency: "BRL"`
    - Implement `parseBRLToCents` handling plain integers, comma-decimal, and dot-thousands formats
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x] 2.4 Create `packages/core/src/index.ts`
    - Re-export all public symbols from `types.ts`, `calculate-control-balance.ts`, and `money.ts`
    - _Requirements: 10.2_

  - [x] 2.5 Configure `packages/core/package.json`
    - Set up TypeScript build, Vitest test runner, and `fast-check` dependency
    - _Requirements: 10.1, 11.1_

- [x] 3. Write tests for `packages/core`
  - [x] 3.1 Create `packages/core/tests/calculate-control-balance.test.ts` with example-based tests
    - DECREASE: `baseValueCents=100000, dailyStepCents=3500, dayOfMonth=5` → `82500`
    - INCREASE: `baseValueCents=0, dailyStepCents=10000, dayOfMonth=10` → `100000`
    - Date object representing day 15 is used correctly
    - Day 1 edge case
    - Non-zero base value with INCREASE
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_

  - [x] 3.2 Write property test for DECREASE balance formula (Property 4)
    - **Property 4: DECREASE balance formula**
    - **Validates: Requirements 2.6, 11.2**
    - Tag: `// Feature: sistema-mare, Property 4: DECREASE balance = baseValueCents - dailyStepCents * dayOfMonth`
    - Use `fc.integer({ min: 0 })`, `fc.integer({ min: 1 })`, `fc.integer({ min: 1, max: 31 })`

  - [x] 3.3 Write property test for INCREASE balance formula (Property 5)
    - **Property 5: INCREASE balance formula**
    - **Validates: Requirements 2.5, 11.3**
    - Tag: `// Feature: sistema-mare, Property 5: INCREASE balance = baseValueCents + dailyStepCents * dayOfMonth`
    - Use `fc.integer({ min: 0 })`, `fc.integer({ min: 1 })`, `fc.integer({ min: 1, max: 31 })`

  - [x] 3.4 Write property test for dayOfMonth priority over date (Property 6)
    - **Property 6: Day-of-month resolution priority**
    - **Validates: Requirements 2.2, 2.3**
    - Tag: `// Feature: sistema-mare, Property 6: dayOfMonth overrides date when both provided`
    - Use `fc.integer`, `fc.date()`, `fc.constantFrom("INCREASE", "DECREASE")`

  - [x] 3.5 Create `packages/core/tests/money.test.ts` with example-based tests
    - `formatCentsToBRL(100000)` → `"R$ 1.000,00"`
    - `parseBRLToCents("1000")` → `100000`
    - `parseBRLToCents("1000,00")` → `100000`
    - `parseBRLToCents("1.000,00")` → `100000`
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x] 3.6 Write property test for money round-trip (Property 1)
    - **Property 1: Money formatting/parsing round-trip**
    - **Validates: Requirements 3.5**
    - Tag: `// Feature: sistema-mare, Property 1: parseBRLToCents(formatCentsToBRL(c)) === c`
    - Use `fc.integer({ min: 0, max: 10_000_000 })`

  - [x] 3.7 Write property test for BRL format output shape (Property 2)
    - **Property 2: BRL format output is well-formed**
    - **Validates: Requirements 3.1**
    - Tag: `// Feature: sistema-mare, Property 2: formatCentsToBRL output starts with "R$" and uses correct separators`
    - Use `fc.integer({ min: 0, max: 10_000_000 })`

  - [x] 3.8 Write property test for plain integer string parsing (Property 3)
    - **Property 3: Plain integer string parsing**
    - **Validates: Requirements 3.3**
    - Tag: `// Feature: sistema-mare, Property 3: parseBRLToCents(String(n)) === n * 100`
    - Use `fc.integer({ min: 1, max: 100_000 })`

- [x] 4. Checkpoint — core package
  - Ensure all core tests pass, ask the user if questions arise.

- [x] 5. Implement `packages/database`
  - [x] 5.1 Create `packages/database/prisma/schema.prisma`
    - Define `Control` model with fields: `id` (CUID), `name`, `baseValueCents`, `type` (ControlType enum), `dailyStepCents`, `createdAt`, `updatedAt`
    - Use SQLite provider with `DATABASE_URL` env variable
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 5.2 Create `packages/database/src/client.ts`
    - Implement singleton Prisma client using `globalThis` pattern to prevent multiple instances during Next.js hot-reload
    - Export the `prisma` instance
    - _Requirements: 1.5, 10.5_

  - [x] 5.3 Configure `packages/database/package.json`
    - Set up TypeScript build and declare `@prisma/client` dependency
    - _Requirements: 10.1_

- [x] 6. Bootstrap `apps/web` — Next.js App Router
  - [x] 6.1 Create `apps/web/package.json` and Next.js configuration
    - Add dependencies: Next.js, React, MUI, React Hook Form, Zod
    - Add workspace references to `@sistema-mare/core` and `@sistema-mare/database`
    - _Requirements: 9.3, 10.1, 10.4, 10.5_

  - [x] 6.2 Create `apps/web/app/layout.tsx`
    - Wrap all pages with MUI `AppBar` displaying "Sistema Maré" title and a navigation link to `/controls`
    - _Requirements: 9.1, 9.2, 9.3_

- [x] 7. Implement Zod schema and shared form component
  - [x] 7.1 Create `apps/web/lib/schemas.ts`
    - Define `controlSchema` with Zod: `name` (required string), `baseValue` (required string), `type` (INCREASE | DECREASE enum), `dailyStep` (string refined via `parseBRLToCents` > 0)
    - _Requirements: 5.2, 5.3, 5.4, 5.5, 5.7_

  - [x] 7.2 Write property test for non-positive daily step rejection (Property 7)
    - **Property 7: Non-positive daily step values are rejected by validation**
    - **Validates: Requirements 5.5**
    - Tag: `// Feature: sistema-mare, Property 7: dailyStep <= 0 is rejected by Zod schema`
    - Use `fc.integer({ max: 0 })` and `controlSchema.safeParse`

  - [x] 7.3 Create `apps/web/components/ControlForm.tsx`
    - Implement shared form with React Hook Form + `controlSchema`
    - Fields: name (TextField), baseValue (TextField), type (Select with INCREASE/DECREASE options), dailyStep (TextField)
    - Display inline validation errors via MUI `FormHelperText`
    - Accept `defaultValues` and `onSubmit` props
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.7, 5.8, 7.1_

- [x] 8. Implement server actions
  - Create `apps/web/app/controls/actions.ts` with three server actions:
    - `createControl(data)`: parse money fields to cents, insert via Prisma, `revalidatePath("/controls")`, redirect to `/controls`
    - `updateControl(id, data)`: parse money fields to cents, update via Prisma, `revalidatePath`, redirect to `/controls/[id]`
    - `deleteControl(id)`: delete via Prisma, `revalidatePath("/controls")`, redirect to `/controls`
  - Wrap each action in try/catch; return error message on failure
  - _Requirements: 5.6, 5.8, 7.2, 8.3, 10.4, 10.5_

- [x] 9. Implement List Controls page (`/controls`)
  - Create `apps/web/app/controls/page.tsx` as a Server Component
  - Fetch all controls with `prisma.control.findMany()`
  - For each control, compute `calculateControlBalance` and format all monetary values with `formatCentsToBRL`
  - Render controls in a MUI table or card list showing: name, type, base value (BRL), daily step (BRL), calculated balance (BRL)
  - Include "New Control" button linking to `/controls/new`
  - Include per-row links to `/controls/[id]` (details) and `/controls/[id]/edit` (edit)
  - Include per-row delete button that triggers `deleteControl` action with a confirmation step
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 8.1, 9.3_

- [x] 10. Implement Create Control page (`/controls/new`)
  - Create `apps/web/app/controls/new/page.tsx`
  - Render `ControlForm` with no default values
  - Wire `onSubmit` to `createControl` server action
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_

- [x] 11. Implement Control Details page (`/controls/[id]`)
  - Create `apps/web/app/controls/[id]/page.tsx` as a Server Component
  - Fetch control by ID; call `notFound()` if not found
  - Display: name, type, base value (BRL), daily step (BRL), current day of month, calculated balance (BRL), `createdAt`, `updatedAt`
  - Display human-readable calculation explanation:
    - DECREASE: `"R$ X - R$ Y × D = R$ Z"`
    - INCREASE: `"R$ X + R$ Y × D = R$ Z"`
  - Include Edit button (`/controls/[id]/edit`), Delete button (with confirmation), and Back button (`/controls`)
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 8.2_

- [x] 12. Implement Edit Control page (`/controls/[id]/edit`)
  - Create `apps/web/app/controls/[id]/edit/page.tsx` as a Server Component
  - Fetch control by ID; call `notFound()` if not found
  - Convert stored cents back to BRL strings for `defaultValues`
  - Render `ControlForm` prefilled with existing data
  - Wire `onSubmit` to `updateControl` server action
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 13. Implement delete confirmation flow
  - Add a client-side confirmation dialog or `window.confirm` call before invoking `deleteControl`
  - Ensure cancellation leaves the control intact and returns the user to the current page
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 14. Checkpoint — full application
  - Ensure all tests pass and the TypeScript compiler reports no errors across all packages, ask the user if questions arise.

- [x] 15. Final wiring and quality check
  - [x] 15.1 Verify monorepo scripts at root level
    - Confirm `pnpm dev`, `pnpm build`, `pnpm test`, `pnpm lint`, `pnpm db:generate`, `pnpm db:migrate`, `pnpm db:studio` all work
    - _Requirements: 10.6_

  - [x] 15.2 Verify package separation constraints
    - Confirm `packages/core` has no UI or database imports
    - Confirm `packages/database` has no business logic
    - Confirm `apps/web` imports `calculateControlBalance` exclusively from `@sistema-mare/core`
    - Confirm `apps/web` imports `prisma` exclusively from `@sistema-mare/database`
    - _Requirements: 10.2, 10.3, 10.4, 10.5, 2.7_

  - [x] 15.3 Verify responsive layout
    - Confirm MUI layout is usable on mobile and desktop screen sizes
    - _Requirements: 9.4_

- [x] 16. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use `fast-check` with a minimum of 100 iterations each
- All monetary values are stored and computed in integer cents; BRL formatting happens only at the display layer
- The singleton Prisma client pattern is required to avoid connection issues during Next.js hot-reload
