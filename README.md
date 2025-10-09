This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Database Setup

The GoodRun Volunteer App uses a PostgreSQL database hosted on Render. All developers share the same database for testing purposes. Here is a guide for usage:

1. **Create .env.local file at root of repository**
```.env.local
// .env.local
DATABASE_URL=postgresql://goodrun_user:W1yoj70VKtjKjOI9W6BkBrb5lqGYi8Mg@dpg-d3hk7khr0fns73cf1dj0-a.oregon-postgres.render.com/goodrun
NODE_ENV=development
NEXTAUTH_SECRET=[generate your own key]     // Command to generate: openssl rand -base64 32
NEXTAUTH_URL=https://team-17-medical-pantry.onrender.com
```

2. **Database Management**
> Tables and test data had already been created. This step is optional for modifying the schema.
To manage the db system, you can either download the **pgAdmin4** software, or connect through **command line** (brew install postgresql and connect).

For more information see: 
https://group17-medical-pantry-it-project.atlassian.net/wiki/spaces/IP/pages/52297730/Database+Information+on+Render


3. Tables and Structure
## `organisation`
Stores details about volunteer organisations.

| Column         | Type      | Notes                         |
|----------------|-----------|-------------------------------|
| id             | SERIAL    | Primary Key                   |
| name           | VARCHAR   | Organisation name             |
| address        | VARCHAR   | Street address                |
| contact_no     | VARCHAR   | Phone number                  |
| office_hours   | VARCHAR   | Hours of operation            |

## `jobs`
Stores volunteer jobs. Each job belongs to an organisation.

| Column          | Type        | Notes                         |
|-----------------|------------|--------------------------------|
| id              | SERIAL      | Primary Key                   |
| assigned_to     | VARCHAR     | Name of volunteer (optional) |
| progress_stage  | VARCHAR     | 'available', 'reserved', 'in delivery' |
| deadline_date   | DATE        | Job deadline                  |
| weight          | NUMERIC     | Approx. weight of items       |
| value           | NUMERIC     | Approx. value of items        |
| size            | VARCHAR     | 'tiny', 'small'               |
| follow_up       | BOOLEAN     | Follow-up required            |
| intake_priority | VARCHAR     | 'low', 'medium', 'high'       |
| organisation_id | INTEGER     | FK to `organisation(id)`      |
| created_at      | TIMESTAMP   | Auto-generated on insert      |

## `users`
Stores volunteer and admin accounts.

| Column        | Type      | Notes                                |
|---------------|-----------|--------------------------------------|
| id            | SERIAL    | Primary Key                          |
| name          | VARCHAR   | Full name                            |
| email         | VARCHAR   | login email                          |
| role          | VARCHAR   | 'volunteer' or 'admin'               |
| password_hash | VARCHAR   | bcrypt hash of password              |


4. Test data

The test records were seeded through script runnning. To view records for testing see **scripts/seedTestRecords.sql**, or retrieve table records through dbms.

To test login the **passwords are all '000'** (saved as hashes in db).


## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deployment

The GoodRun Volunteer App is deployed on **Render**.

URL: https://team-17-medical-pantry.onrender.com


## Project Architecture
```pgsql
Team-17-Medical-Pantry/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   ├── login/
│   │   └── page.tsx
│   └── api/
│       └── login/
│           └── route.ts
│       └── job/
│           └── route.ts
├── components/...
├── lib/
│   └── db.ts
├── scripts/...
├── .env.local
├── package.json
├── tsconfig.json
└── README.md
```
Folder descriptions:
- *app/* contains Next.js pages
- *components/* contains reusable UI elements
- *lib/* contains database connection code 
- *scripts/* contains utility scripts
- *app/api/* handles the backend login API