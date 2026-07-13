# PlacementOS Monorepo

PlacementOS is an evidence-based placement preparation portal built using a monorepo structure.

## Technical Stack
* **Frontend:** React 19, Vite, TypeScript, Tailwind CSS v4, Zustand, TanStack Query, React Router.
* **Backend:** Express, Node.js, TypeScript, Prisma, PostgreSQL.
* **Orchestration:** pnpm workspaces.

## Repository Setup
To start the application locally:

1. **Clone Repository:**
   Clone the repository to your local system.

2. **Install Dependencies:**
   ```bash
   pnpm install
   ```

3. **Start PostgreSQL Container:**
   ```bash
   pnpm run docker:up
   ```

4. **Initialize Database:**
   ```bash
   pnpm run db:reset
   ```

5. **Start Development Servers:**
   ```bash
   pnpm run dev
   ```

## Available Workspace Scripts
* `pnpm run dev`: Launches the client application and API server in parallel development mode.
* `pnpm run build`: Compiles all packages and apps into target `/dist` outputs.
* `pnpm run lint`: Checks for linting errors across the codebase.
* `pnpm run format`: Formats all files to match styles defined in Prettier config files.
* `pnpm run typecheck`: Runs TypeScript compiler diagnostics across all workspaces.
* `pnpm run db:migrate`: Applies migrations to the local PostgreSQL database.
* `pnpm run db:seed`: Seeds the local database with reference data.
* `pnpm run db:reset`: Resets the local database, applies migrations, and seeds references.
* `pnpm run docker:up`: Starts development database and pgAdmin containers.
* `pnpm run docker:down`: Stops local Docker database containers.
* `pnpm run clean`: Deletes `node_modules` and compiled build folders.
