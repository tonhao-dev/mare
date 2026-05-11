You are a senior full-stack engineer. Build a simple personal finance control system called `sistema-mare`.

The goal is to create a small, maintainable monorepo application to control monthly balances and spending limits for me and my mother.

Use a simple architecture. Do not overengineer. Avoid unnecessary backend services, Docker, auth, microservices, or complex abstractions.

# System Overview

The system manages "controls". A control represents a monthly financial tracker.

Examples:

1. Vale Alimentação
   - Starts each month with R$ 1.000,00
   - Decreases R$ 35,00 per day
   - On day 5 of the month, the displayed balance should be:
     R$ 1.000,00 - R$ 35,00 * 5 = R$ 825,00

2. Credit Card
   - Starts at R$ 0,00
   - Increases R$ 100,00 per day
   - On day 10 of the month, the displayed target/max statement value should be:
     R$ 0,00 + R$ 100,00 * 10 = R$ 1.000,00

The system does not need to register individual transactions at this stage. It only calculates the expected balance/value based on:
- Base value
- Control type
- Daily step
- Current day of the month

# Required Stack

Use the following technologies:

- Monorepo: pnpm workspaces
- Web app: Next.js with App Router
- Language: TypeScript
- UI: MUI / Material UI
- Database: SQLite
- ORM: Prisma
- Validation: Zod
- Forms: React Hook Form
- Business logic package: separate shared package
- Testing: Vitest for core calculation logic

# Monorepo Structure

Create this structure:

sistema-mare/
  apps/
    web/
      app/
      components/
      lib/
      package.json
  packages/
    database/
      prisma/
        schema.prisma
      src/
        client.ts
      package.json
    core/
      src/
        calculate-control-balance.ts
        money.ts
        types.ts
        index.ts
      tests/
        calculate-control-balance.test.ts
      package.json
  package.json
  pnpm-workspace.yaml
  README.md

# Domain Model

Create a Control entity with these fields:

- id: string
- name: string
- baseValueCents: number
- type: enum with values:
  - INCREASE
  - DECREASE
- dailyStepCents: number
- createdAt: Date
- updatedAt: Date

Important:
- Store all money values in cents.
- Do not store decimal money values.
- Example: R$ 1.000,00 should be stored as 100000.
- `dailyStepCents` should always be stored as a positive number.
- The `type` determines whether the daily step increases or decreases the calculated value.

# Prisma Schema

Create a Prisma schema using SQLite.

Model:

Control {
  id              String      @id @default(cuid())
  name            String
  baseValueCents  Int
  type            ControlType
  dailyStepCents  Int
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}

enum ControlType {
  INCREASE
  DECREASE
}

# Business Logic

Create a pure function in `packages/core`:

calculateControlBalance(params: {
  baseValueCents: number;
  dailyStepCents: number;
  type: "INCREASE" | "DECREASE";
  dayOfMonth?: number;
  date?: Date;
}): number

Rules:
- If `dayOfMonth` is provided, use it.
- Otherwise, if `date` is provided, use date.getDate().
- Otherwise, use the current date.
- For INCREASE:
  balance = baseValueCents + dailyStepCents * dayOfMonth
- For DECREASE:
  balance = baseValueCents - dailyStepCents * dayOfMonth

Examples:
- baseValueCents = 100000, type = DECREASE, dailyStepCents = 3500, dayOfMonth = 5
  result = 82500
- baseValueCents = 0, type = INCREASE, dailyStepCents = 10000, dayOfMonth = 10
  result = 100000

Also create money utilities:
- formatCentsToBRL(cents: number): string
- parseBRLToCents(value: string): number

The UI should display values in Brazilian Real format.

# Web App Features

Implement the following pages using Next.js App Router:

## 1. List Controls

Route:

/controls

Display all controls in a simple table or card list.

For each control show:
- Name
- Type
- Base value formatted as BRL
- Daily step formatted as BRL
- Current calculated balance formatted as BRL
- Link/button to view details
- Link/button to edit
- Button to delete

Also include a button to create a new control.

## 2. Create Control

Route:

/controls/new

Form fields:
- Name
- Base value
- Type: INCREASE or DECREASE
- Daily step

Validation:
- name is required
- base value is required and must be a valid money value
- type is required
- daily step is required and must be greater than zero

Use React Hook Form + Zod.

Use server actions or route handlers to persist the control.

After successful creation, redirect to `/controls`.

## 3. Control Details

Route:

/controls/[id]

Show:
- Name
- Type
- Base value
- Daily step
- Current day of month
- Current calculated balance
- Created at
- Updated at

Also show a simple explanation of the calculation, for example:

For DECREASE:
"R$ 1.000,00 - R$ 35,00 × 5 = R$ 825,00"

For INCREASE:
"R$ 0,00 + R$ 100,00 × 10 = R$ 1.000,00"

Include buttons:
- Edit
- Delete
- Back to list

## 4. Edit Control

Route:

/controls/[id]/edit

Same form as create, prefilled with existing control data.

After save, redirect to `/controls/[id]`.

## 5. Delete Control

Allow deleting a control from:
- list page
- details page

After deletion, redirect to `/controls`.

A simple confirmation is enough.

# UI Requirements

Use MUI components.

Keep the interface simple:
- App title: Sistema Maré
- Main navigation with link to Controls
- Clean spacing
- Responsive enough for desktop and mobile
- No dark mode requirement
- No authentication

Use MUI components such as:
- Container
- Typography
- Button
- TextField
- Select
- MenuItem
- Card
- Table
- Stack
- Alert

# Implementation Requirements

Use TypeScript strictly.

Avoid `any` unless absolutely necessary.

Separate responsibilities:
- `packages/core`: pure business logic and money helpers
- `packages/database`: Prisma schema and client
- `apps/web`: UI, pages, forms, server actions

Do not duplicate balance calculation logic in the web app. Always import it from `packages/core`.

Do not duplicate Prisma client setup. Use `packages/database`.

Use simple server-side data loading where possible.

# Validation Details

Use Zod schemas for form validation.

Money input may be typed like:
- 1000
- 1000,00
- 1.000,00
- 35
- 35,00

Convert to cents before saving.

Make sure negative daily step values are not accepted.

# Tests

Add Vitest tests for `calculateControlBalance`.

Test at least:

1. Decrease control:
   baseValueCents = 100000
   dailyStepCents = 3500
   dayOfMonth = 5
   expected = 82500

2. Increase control:
   baseValueCents = 0
   dailyStepCents = 10000
   dayOfMonth = 10
   expected = 100000

3. Uses date when provided:
   date = a Date object representing day 15
   verify calculation uses day 15

4. Handles day 1 correctly

5. Handles base values other than zero for INCREASE

# Package Scripts

At the root, include scripts like:

- dev
- build
- lint
- test
- db:generate
- db:migrate
- db:studio

Use pnpm.

# README

Create a README with:

- Project description
- Stack
- How to install dependencies
- How to run migrations
- How to start development server
- How to run tests
- Explanation of the financial calculation rule
- Example controls:
  - Vale Alimentação
  - Credit Card

# Quality Bar

Before finishing:
- Make sure the project builds.
- Make sure TypeScript has no errors.
- Make sure tests pass.
- Make sure Prisma client is generated.
- Make sure the app can create, list, view, edit, and delete controls.

# Important Behavior

Do not add transaction tracking yet.
Do not add authentication yet.
Do not add monthly history yet.
Do not add charts yet.
Do not add categories yet.
Do not use PostgreSQL yet.
Do not use Docker yet.

Keep this version intentionally small and maintainable.