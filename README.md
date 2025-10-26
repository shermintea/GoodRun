<!-- ABOUT THE PROJECT -->
## About The Project

[![GoodRun LOGO][goodrun-logo]][goodrun-url]

IT Project Semester 2, 2025  
Our team is working with **Medical Pantry** on the development of GoodRun - a delivery web application designed to provide a simpler, more streamlined and reliable platform for volunteers to carry out deliveries. The platform enables staff to publish and manage delivery items; volunteers to easily view and accept pick up requests, access route navigation and item status tracking. GoodRun aims to enhance efficiency and transparency, while also supporting Medical Pantry’s mission and strengthening its community impact.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

This section should list any major frameworks/libraries used to bootstrap your project. Leave any add-ons/plugins for the acknowledgements section. Here are a few examples.

* [![Next][Next.js]][Next-url]
* [![React][React.js]][React-url]
* [![PostgreSQL][PostgreSQL]][PostgreSQL-url]]
* [![Render][Render]][Render-url]
* [![Tailwindcss][Tailwindcss]][Tailwindcss-url]
* [![Leaflet][Leaflet]][Leaflet-url]
* [![GraphHopper][GraphHopper]][GraphHopper-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#database-setup">Database Setup</a></li>
        <li><a href="#running-locally">Running Locally</a></li>
      </ul>
    </li>
    <li><a href="#deployment">Deployment</a></li>
    <li><a href="#project-architecture">Project Architecture</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->
## Getting Started
Here is a guide on setting up the project **locally**.

### Database Setup

The GoodRun Volunteer App uses a PostgreSQL database hosted on Render. All developers share the same database for testing purposes. Here is a guide for usage:

1. **Create `.env.local` file at root of repository**
```.env.local
// .env.local
DATABASE_URL=[see below link]
NODE_ENV=development
NEXTAUTH_SECRET=[generate your own key]     // Command to generate: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000
GEOCODING_KEY=[see below link]        
NEXT_PUBLIC_GRAPHHOPPER_KEY=[see below link]
```
> visit [this link][goodrun-onrender-url] and scroll to the **Environment Variables** section to fill in information in [see below link].

2. **Database Management**

To manage the database system, you can either download the **pgAdmin4** software, or connect through **command line** (brew install postgresql and connect).

Visit [this link][goodrun-db-url] to view connection credentials and detailed documentations.

3. **Test data**

The test records were seeded through script runnning. 

Database schema and tables have been documented in the above link. Alternatively, you can find the seeded records for testing in `scripts/seedTestRecords.sql`, or retrieve table records directly through the dbms.

> To test login the **passwords are all '000'** (saved as hashes in db).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Running Locally

1. Install npm packages
```bash
npm install
```
2. Run the app on localhost
```bash
npm run dev
```
3. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
Website updates automatically with code changes.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- Deployment -->
## Deployment

The GoodRun Volunteer App is deployed on **Render**.
Deployment is automatic upon git push to **development** branch.

**Give [GoodRun][goodrun-url] a visit!**

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!--Project Architecture -->
## Project Architecture
> 10-10-2025 pages have been moved to a nested structure for easier routing. (sorry for causing pain when merging ;-;)
```pgsql
Team-17-Medical-Pantry/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx            # Volunteer login page with NextAuth session handling
│   │   └── layout.tsx                # Public layout that redirects authenticated users to /dashboard
│   │
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/route.ts # NextAuth.js configuration endpoint (handles sign-in sessions)
│   │   ├── db-check/route.ts          # REST API endpoint for job operations (CRUD requests)
│   │   ├── login/route.ts             # Displays the user's completed job history
│   │   └── profile/route..ts          # Displays the user's completed job history
│   │
│   ├── dashboard/
│   │   ├── adminJobDetails/page.tsx   # Page for admin users to view/edit specific job details
│   │   ├── availableJobs/page.tsx     # Lists all available volunteer jobs
│   │   ├── jobHistory/page.tsx        # Displays the user's completed job history
│   │   ├── ongoingJobs/page.tsx       # Shows current/active job assignments
│   │   ├── profile/
│   │   │   ├── EditProfileForm.tsx    # Client-side profile editing form
│   │   │   └── page.tsx               # Profile page using EditProfileForm
│   │   ├── layout.tsx                 # Protected layout wrapper for authenticated routes (GoodRun header)
│   │   └── mapview.tsx                # Embedded map component for job visualization
│   │
│   ├── globals.css                    # Global stylesheet for the entire application
│   ├── layout.tsx                     # Root layout that wraps all routes and sets up base providers
│   └── page.tsx                       # Public landing page (Medical Pantry home)
│
├── components/                        # Reusable UI elements such as headers, buttons, and layout wrappers
│   └── ui/...
│   └── wrappers/...  
|  
├── hooks/...
│
├── public/...                         # Static assets (e.g., images, icons, fonts)
│
├── lib/
│   ├── db.ts  
│   ├── services/...                   # Domain services for individual features
│   └── utils/...                      # Generic helpers
│
├── scripts/
│   └── ...                            # Developer scripts and helper utilities
│
├── types/
│   └── next-auth.d.ts                 # TypeScript type overrides for NextAuth session/user objects
│
├── .env.local                         # Environment variables for local development (never committed)
├── package.json                       # Project dependencies and build scripts
├── tsconfig.json                      # TypeScript configuration file
└── README.md                          # Project documentation
```
<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- ACKNOWLEDGMENTS -->
## Acknowledgments

List of resources we have used in our project!

* [Medical Pantry](https://medicalpantry.org)
* [README Template](https://github.com/othneildrew/Best-README-Template)


<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[goodrun-logo]: https://github.com/esthertea/Team-17-Medical-Pantry/blob/development/public/grLogo-transparent.png
[goodrun-url]: ttps://team-17-medical-pantry.onrender.com

[Next.js]: https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[Next-url]: https://nextjs.org/
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[PostgreSQL]: https://img.shields.io/badge/postgresql-336791?style=for-the-badge&logo=postgresql&logoColor=white
[PostgreSQL-url]: https://www.postgresql.org
[Render]: https://img.shields.io/badge/Render-white?style=for-the-badge&logo=render&logoColor=black
[Render-url]: https://render.com
[Leaflet]: https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white
[Leaflet-url]: https://leafletjs.com
[Tailwindcss]: https://img.shields.io/badge/Tailwind%20css-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white
[Tailwindcss-url]: https://tailwindcss.com
[GraphHopper]: https://img.shields.io/badge/GraphHopper-24ca51?style=for-the-badge&logo=https%3A%2F%2Favatars.githubusercontent.com%2Fu%2F2264498%3Fs%3D200%26v%3D4&logoColor=black
[GraphHopper-url]: https://www.graphhopper.com

[goodrun-onrender-url]: https://group17-medical-pantry-it-project.atlassian.net/wiki/spaces/IP/pages/77004838/GoodRun+on+Render
[goodrun-db-url]: https://group17-medical-pantry-it-project.atlassian.net/wiki/spaces/IP/pages/52297730/Database+Information+on+Render
