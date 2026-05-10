# JourneyFix Setup Scripts

## Database Setup

### Prerequisites
- PostgreSQL installed and running
- Database `journeyfix` created (or use `createdb journeyfix`)

### 1. Edit .env
Set your Postgres password in DATABASE_URL:
```
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/journeyfix"
```

### 2. Start PostgreSQL (if not running)
```bash
# macOS (Homebrew)
brew services start postgresql

# Or (Postgres.app)
# Just open Postgres.app
```

### 3. Create database (if needed)
```bash
createdb journeyfix
```

### 4. Run setup
```bash
npm run db:setup
```

This runs `prisma generate` and `prisma db push` to create all tables.
