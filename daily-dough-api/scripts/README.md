# Database Management Scripts

Daily Dough includes comprehensive database management tools to streamline development and maintain database performance.

## Quick Commands

```bash
# Development database operations
npm run db:reset        # ⚠️  Hard reset: delete database, migrate, seed demo data
npm run db:cleanup      # 🧹 Soft cleanup: clear data, vacuum, optional reseed
npm run db:seed         # 🌱 Add demo data to existing database
npm run db:vacuum       # 🗜️  Optimize SQLite performance (defrag, analyze)

# Standard Prisma operations
npm run db:migrate      # 📝 Run pending migrations
npm run db:studio       # 🎛️  Open Prisma Studio (database browser)
npm run db:status       # 📊 Check database connection and schema
```

## Script Details

### `npm run db:reset` (⚠️ DESTRUCTIVE)

- **Purpose**: Complete development reset
- **Actions**:
  - Deletes existing `dev.db` file
  - Runs `prisma migrate dev` to recreate schema
  - Seeds with demo transactions, accounts, and realistic test data
- **When to use**: Starting fresh, major schema changes, corrupted database
- **Safety**: Requires confirmation prompt, development-only

### `npm run db:cleanup` (🧹 SAFE)

- **Purpose**: Clear data while preserving schema
- **Actions**:
  - Truncates all user data tables
  - Runs `VACUUM` to reclaim space
  - Optionally reseeds demo data
- **When to use**: Clear old test data, reduce database size, performance issues
- **Safety**: Preserves schema, confirmation prompts

### `npm run db:seed` (🌱 ADDITIVE)

- **Purpose**: Add realistic demo data for immediate app functionality
- **Actions**:
  - Creates demo user, Plaid item, accounts
  - Adds transactions: payroll, climbing, grocery, coffee, Uber
  - Sets up category examples: Income, Recreation, Food, Transportation
- **When to use**: Empty database, need test data, showcasing features
- **Safety**: Upserts data (won't duplicate), development-only

### `npm run db:vacuum` (🗜️ OPTIMIZATION)

- **Purpose**: Optimize SQLite database performance
- **Actions**:
  - Runs `VACUUM` to defragment and compact database file
  - Runs `ANALYZE` to update query planner statistics
  - Reports file size before/after optimization
- **When to use**: After bulk imports, weekly maintenance, slow queries
- **Safety**: Read-only operations, always safe

## Demo Data

The seeded demo data includes:

### Accounts

- **Demo Checking** (•••1234): $2,450.32
- **Demo Savings** (•••5678): $15,750.00

### Sample Transactions

```
Date        Amount    Category        Description
Sep 15    -$5,850.00  Income         ACH Electronic CreditGUSTO PAY (payroll)
Sep 14      $78.50    Recreation     Touchstone Climbing
Sep 13     $127.43    Food & Drink   Whole Foods Market
Sep 13       $4.75    Food & Drink   Blue Bottle Coffee
Sep 12      $23.15    Transportation Uber Trip
```

### Category Testing

The demo data exercises our enhanced category system:

- **Income**: Payroll detection (`GUSTO PAY`)
- **Recreation**: Climbing gym
- **Grocery**: Whole Foods patterns
- **Food & Drink**: Coffee shops
- **Transportation**: Ride sharing

## Development Workflow

### Daily Development

```bash
# Start fresh each morning
npm run db:cleanup

# Add test data if needed
npm run db:seed

# Optimize after large imports
npm run db:vacuum
```

### Troubleshooting Database Issues

```bash
# Complete reset for schema problems
npm run db:reset

# Clear data but keep schema
npm run db:cleanup

# Check connection and schema status
npm run db:status
```

### Performance Maintenance

```bash
# Weekly optimization
npm run db:vacuum

# After bulk transaction imports
npm run db:cleanup --reseed
```

## Safety Features

- **Environment Protection**: All scripts validate `NODE_ENV=development`
- **Confirmation Prompts**: Destructive operations require user confirmation
- **Backup Suggestions**: Scripts suggest creating backups before major operations
- **File Size Monitoring**: Database size tracked and reported
- **Error Handling**: Comprehensive error messages and rollback procedures

## File Paths

- **Database**: `prisma/dev.db` (SQLite development)
- **Scripts**: `scripts/*.ts` (TypeScript for type safety)
- **Logs**: Console output with progress indicators and file size reports

## Integration Notes

- **Plaid Integration**: Demo data uses placeholder tokens (not real Plaid access)
- **Category System**: Exercises all 16 category types for comprehensive testing
- **Transaction Engine**: Compatible with Daily Dial allowance calculations
- **Encryption**: Demo tokens are properly encrypted using production crypto methods

---

💡 **Pro Tip**: Use `npm run db:seed` after `npm run db:cleanup` for a fast refresh with realistic data that immediately makes the app functional for testing.
