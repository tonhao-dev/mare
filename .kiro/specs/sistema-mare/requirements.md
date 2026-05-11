# Requirements Document

## Introduction

Sistema Maré is a personal finance control system for tracking monthly balances and spending limits. The system manages "controls" — monthly financial trackers that calculate an expected balance based on a starting value, a daily step amount, and the current day of the month. It is designed for personal use by two people (the owner and their mother), with no authentication, no transaction history, and no complex infrastructure. The application is a monorepo with a shared business logic package, a shared database package, and a Next.js web application.

## Glossary

- **System**: The Sistema Maré application as a whole.
- **Web_App**: The Next.js web application in `apps/web`.
- **Core_Package**: The shared TypeScript package in `packages/core` containing pure business logic.
- **Database_Package**: The shared package in `packages/database` containing the Prisma schema and client.
- **Control**: A monthly financial tracker entity with a name, base value, type, and daily step.
- **Base_Value**: The starting monetary amount of a Control at the beginning of the month, stored in cents.
- **Daily_Step**: The fixed monetary amount added to or subtracted from the Base_Value for each day of the month, stored in cents as a positive integer.
- **Control_Type**: An enumeration with two values: `INCREASE` (balance grows daily) and `DECREASE` (balance shrinks daily).
- **Calculated_Balance**: The monetary value derived from the formula applied to a Control for a given day of the month.
- **Day_Of_Month**: An integer from 1 to 31 representing the current or specified day within a calendar month.
- **Cents**: The integer representation of a monetary value in the smallest Brazilian Real unit (1 BRL = 100 cents).
- **BRL_Format**: The Brazilian Real currency format, e.g., `R$ 1.000,00`.
- **Balance_Calculator**: The `calculateControlBalance` pure function in the Core_Package.
- **Money_Formatter**: The `formatCentsToBRL` utility function in the Core_Package.
- **Money_Parser**: The `parseBRLToCents` utility function in the Core_Package.
- **Control_Form**: The React Hook Form + Zod form used to create or edit a Control.
- **Prisma_Client**: The database client instance exported from the Database_Package.

---

## Requirements

### Requirement 1: Control Data Model

**User Story:** As a user, I want the system to persist controls with all necessary fields, so that my financial trackers are stored reliably between sessions.

#### Acceptance Criteria

1. THE Database_Package SHALL define a `Control` model with the fields: `id` (string, CUID), `name` (string), `baseValueCents` (integer), `type` (ControlType enum: `INCREASE` or `DECREASE`), `dailyStepCents` (integer), `createdAt` (datetime), and `updatedAt` (datetime).
2. THE Database_Package SHALL use SQLite as the database provider via Prisma.
3. THE Database_Package SHALL store all monetary values (`baseValueCents`, `dailyStepCents`) as integers representing cents.
4. THE Database_Package SHALL store `dailyStepCents` as a positive integer.
5. THE Database_Package SHALL export a single Prisma_Client instance for use by the Web_App.

---

### Requirement 2: Balance Calculation Logic

**User Story:** As a user, I want the system to automatically calculate the expected balance for each control based on the current day, so that I can see how much I have spent or accumulated without entering individual transactions.

#### Acceptance Criteria

1. THE Core_Package SHALL export a `calculateControlBalance` function that accepts `baseValueCents` (number), `dailyStepCents` (number), `type` (`"INCREASE"` or `"DECREASE"`), and optional `dayOfMonth` (number) and `date` (Date) parameters, and returns a number.
2. WHEN `dayOfMonth` is provided, THE Balance_Calculator SHALL use that value as the Day_Of_Month for the calculation.
3. WHEN `dayOfMonth` is not provided and `date` is provided, THE Balance_Calculator SHALL use `date.getDate()` as the Day_Of_Month.
4. WHEN neither `dayOfMonth` nor `date` is provided, THE Balance_Calculator SHALL use the current date's day of month.
5. WHEN the Control_Type is `INCREASE`, THE Balance_Calculator SHALL return `baseValueCents + dailyStepCents * dayOfMonth`.
6. WHEN the Control_Type is `DECREASE`, THE Balance_Calculator SHALL return `baseValueCents - dailyStepCents * dayOfMonth`.
7. THE Core_Package SHALL NOT duplicate the balance calculation logic; the Web_App SHALL import it exclusively from the Core_Package.

---

### Requirement 3: Money Formatting and Parsing

**User Story:** As a user, I want monetary values displayed in Brazilian Real format and accepted in common Brazilian input formats, so that the interface feels natural for my locale.

#### Acceptance Criteria

1. THE Core_Package SHALL export a `formatCentsToBRL` function that accepts an integer number of cents and returns a string in BRL_Format (e.g., `100000` → `"R$ 1.000,00"`).
2. THE Core_Package SHALL export a `parseBRLToCents` function that accepts a string and returns an integer number of cents.
3. WHEN the input to `parseBRLToCents` is a plain integer string (e.g., `"1000"`), THE Money_Parser SHALL return the value multiplied by 100.
4. WHEN the input to `parseBRLToCents` uses a comma as a decimal separator (e.g., `"1000,00"` or `"1.000,00"`), THE Money_Parser SHALL correctly parse it to cents.
5. FOR ALL valid cent values `c`, `parseBRLToCents(formatCentsToBRL(c))` SHALL return `c` (round-trip property).

---

### Requirement 4: List Controls Page

**User Story:** As a user, I want to see all my controls and their current calculated balances on a single page, so that I can quickly check my financial status.

#### Acceptance Criteria

1. THE Web_App SHALL provide a page at the route `/controls` that displays all persisted Controls.
2. WHEN the `/controls` page is loaded, THE Web_App SHALL display each Control's name, type, base value in BRL_Format, daily step in BRL_Format, and Calculated_Balance in BRL_Format using the current Day_Of_Month.
3. WHEN the `/controls` page is loaded, THE Web_App SHALL display a button or link to navigate to `/controls/new`.
4. WHEN the `/controls` page is loaded, THE Web_App SHALL display a link or button to view the details of each Control at `/controls/[id]`.
5. WHEN the `/controls` page is loaded, THE Web_App SHALL display a link or button to edit each Control at `/controls/[id]/edit`.
6. WHEN the `/controls` page is loaded, THE Web_App SHALL display a delete button for each Control.

---

### Requirement 5: Create Control Page

**User Story:** As a user, I want to create a new control by filling in a form, so that I can start tracking a new monthly financial item.

#### Acceptance Criteria

1. THE Web_App SHALL provide a page at the route `/controls/new` containing a Control_Form with fields for name, base value, type, and daily step.
2. WHEN the Control_Form is submitted with a missing name, THE Web_App SHALL display a validation error and SHALL NOT persist the Control.
3. WHEN the Control_Form is submitted with a missing or invalid base value, THE Web_App SHALL display a validation error and SHALL NOT persist the Control.
4. WHEN the Control_Form is submitted with a missing type, THE Web_App SHALL display a validation error and SHALL NOT persist the Control.
5. WHEN the Control_Form is submitted with a daily step value of zero or less, THE Web_App SHALL display a validation error and SHALL NOT persist the Control.
6. WHEN the Control_Form is submitted with all valid fields, THE Web_App SHALL persist the Control and redirect the user to `/controls`.
7. THE Web_App SHALL use React Hook Form and Zod for Control_Form validation.
8. THE Web_App SHALL convert money input values to cents using the Money_Parser before persisting.

---

### Requirement 6: Control Details Page

**User Story:** As a user, I want to view the full details of a control including the calculation breakdown, so that I can understand exactly how the current balance was derived.

#### Acceptance Criteria

1. THE Web_App SHALL provide a page at the route `/controls/[id]` that displays the full details of the specified Control.
2. WHEN the details page is loaded, THE Web_App SHALL display the Control's name, type, base value in BRL_Format, daily step in BRL_Format, current Day_Of_Month, Calculated_Balance in BRL_Format, `createdAt`, and `updatedAt`.
3. WHEN the Control_Type is `DECREASE`, THE Web_App SHALL display a human-readable calculation explanation in the format `"R$ X - R$ Y × D = R$ Z"`.
4. WHEN the Control_Type is `INCREASE`, THE Web_App SHALL display a human-readable calculation explanation in the format `"R$ X + R$ Y × D = R$ Z"`.
5. WHEN the details page is loaded, THE Web_App SHALL display a button to navigate to `/controls/[id]/edit`.
6. WHEN the details page is loaded, THE Web_App SHALL display a delete button for the Control.
7. WHEN the details page is loaded, THE Web_App SHALL display a button to navigate back to `/controls`.
8. IF the specified Control does not exist, THEN THE Web_App SHALL return a not-found response.

---

### Requirement 7: Edit Control Page

**User Story:** As a user, I want to edit an existing control, so that I can update its values when my financial situation changes.

#### Acceptance Criteria

1. THE Web_App SHALL provide a page at the route `/controls/[id]/edit` containing a Control_Form prefilled with the existing Control's data.
2. WHEN the Control_Form is submitted with valid data, THE Web_App SHALL persist the updated Control and redirect the user to `/controls/[id]`.
3. WHEN the Control_Form is submitted with invalid data, THE Web_App SHALL display validation errors and SHALL NOT persist the changes.
4. IF the specified Control does not exist, THEN THE Web_App SHALL return a not-found response.

---

### Requirement 8: Delete Control

**User Story:** As a user, I want to delete a control I no longer need, so that my list stays clean and relevant.

#### Acceptance Criteria

1. WHEN the user activates the delete action from the `/controls` page, THE Web_App SHALL request confirmation before deleting the Control.
2. WHEN the user activates the delete action from the `/controls/[id]` page, THE Web_App SHALL request confirmation before deleting the Control.
3. WHEN the user confirms deletion, THE Web_App SHALL permanently remove the Control from the database and redirect the user to `/controls`.
4. WHEN the user cancels deletion, THE Web_App SHALL NOT remove the Control and SHALL return the user to the previous page.

---

### Requirement 9: User Interface and Navigation

**User Story:** As a user, I want a clean, simple interface with consistent navigation, so that I can use the system comfortably on both desktop and mobile.

#### Acceptance Criteria

1. THE Web_App SHALL display the application title "Sistema Maré" in the main navigation or header.
2. THE Web_App SHALL provide a navigation link to `/controls` accessible from all pages.
3. THE Web_App SHALL use MUI components for all UI elements.
4. THE Web_App SHALL be responsive and usable on both desktop and mobile screen sizes.
5. THE Web_App SHALL NOT require authentication to access any page.

---

### Requirement 10: Monorepo Structure and Package Separation

**User Story:** As a developer, I want the codebase organized into clear packages with separated responsibilities, so that the project remains maintainable as it grows.

#### Acceptance Criteria

1. THE System SHALL be organized as a pnpm workspaces monorepo with the structure: `apps/web`, `packages/core`, and `packages/database`.
2. THE Core_Package SHALL contain only pure business logic and money utilities with no UI or database dependencies.
3. THE Database_Package SHALL contain only the Prisma schema and the Prisma_Client export.
4. THE Web_App SHALL import balance calculation logic exclusively from the Core_Package and SHALL NOT reimplement it.
5. THE Web_App SHALL import the Prisma_Client exclusively from the Database_Package and SHALL NOT create additional client instances.
6. THE System SHALL provide root-level pnpm scripts for `dev`, `build`, `lint`, `test`, `db:generate`, `db:migrate`, and `db:studio`.

---

### Requirement 11: Core Logic Tests

**User Story:** As a developer, I want automated tests for the balance calculation logic, so that I can confidently refactor or extend the core package without introducing regressions.

#### Acceptance Criteria

1. THE Core_Package SHALL include Vitest tests for `calculateControlBalance`.
2. WHEN `baseValueCents` is `100000`, `dailyStepCents` is `3500`, `type` is `DECREASE`, and `dayOfMonth` is `5`, THE Balance_Calculator SHALL return `82500`.
3. WHEN `baseValueCents` is `0`, `dailyStepCents` is `10000`, `type` is `INCREASE`, and `dayOfMonth` is `10`, THE Balance_Calculator SHALL return `100000`.
4. WHEN a `date` object representing day 15 is provided, THE Balance_Calculator SHALL use day 15 in the calculation.
5. WHEN `dayOfMonth` is `1`, THE Balance_Calculator SHALL return the correct value for a single day's step.
6. WHEN `baseValueCents` is a non-zero value and `type` is `INCREASE`, THE Balance_Calculator SHALL correctly add the accumulated daily steps to the base value.
