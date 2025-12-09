---
description: How to set up PostgreSQL database connection and run migrations
---

# Setup PostgreSQL Database

Follow these steps to configure your local PostgreSQL database for Recho.

## 1. Install PostgreSQL
If you haven't already, install PostgreSQL:
- **Windows**: Download the installer from [postgresql.org](https://www.postgresql.org/download/windows/).
- **Mac**: Use Postgres.app or `brew install postgresql`.
- **Linux**: Use your package manager (e.g., `sudo apt install postgresql`).

## 2. Create a Database
Open your terminal or a tool like pgAdmin / TablePlus and create a new database called `recho`.

```bash
# Example using terminal (psql)
createdb recho
```

## 3. Configure Environment Variables
Create a file named `.env.local` in the root directory (`d:\New folder\recho\.env.local`).
Add your connection string in the following format:

```env
DATABASE_URL=postgresql://USERNAME:PASSWORD@localhost:5432/recho
```
*Replace `USERNAME` (usually `postgres`) and `PASSWORD` with your actual credentials.*

## 4. Run Schema Migration
We have a script to create the necessary tables. Run this command in your project root:

```bash
// turbo
node scripts/migrate.js
```

## 5. Verify Setup
Check if the tables were created:

```bash
# Example using psql
psql -d recho -c "\dt"
```
You should see tables: `users`, `songs`, `playlists`, `history`, `friendships`, `messages`.
