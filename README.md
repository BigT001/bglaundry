# BG Laundry & Dry Cleaning Services

BG Laundry is a premium, enterprise-grade laundry and dry cleaning management platform. Built as a high-performance monorepo, it connects administrators and clients seamlessly through real-time pricing updates, unified data synchronization, and premium user experiences.

---

## 🏗️ Project Architecture

This project is structured as a **Turborepo** monorepo workspace:

- **`apps/web`**: A **Next.js** web application serving as the Administrator Dashboard. Admins can manage laundry service catalogues, dynamically update rates (Wash, Iron, Combo), and track order statuses.
- **`apps/customer-app`**: An **Expo (React Native)** mobile application for customers to search services, check dynamic pricing, manage their laundry basket, and place orders.
- **`packages/database`**: A shared database layer using **Prisma ORM** connecting to a **PostgreSQL** relational database.

---

## ✨ Features

### 💻 Administrator Panel (`apps/web`)
- **Dynamic Rates Manager**: Adjust pricing for Wash Only, Iron Only, or Wash & Iron combo packages on-the-fly.
- **Service Catalog Builder**: Create, modify, and delete laundry categories and items.
- **Premium Dark Aesthetics**: Styled with a solid black sidebar, active branding highlights, and inline confirmation dialogues.

### 📱 Customer Mobile App (`apps/customer-app`)
- **2x2 Premium Grid Menu**: Quick home screen buttons linking to primary services:
  - *Wash & Iron*
  - *Wash Only*
  - *Iron Only*
  - *Specialist Additions* ( Wedding Gowns, Shoes, Bags, Stain Removals)
- **Active Search Autocomplete**: Instantly search across all 30+ service items with live categories, matching icons, and Naira rates.
- **Unified Catalog Selectors**: Simplified dropdown menu dropdown selections with interactive quantity increments.
- **Dynamic Prices Sync**: Loads live pricing tables from the backend Postgres API, ensuring invoices remain identical during booking.

---

## 🛠️ Local Development Setup

### 1. Prerequisites
- **Node.js** (v18+)
- **pnpm** (Package Manager)
- **Docker** (or a local PostgreSQL instance running)

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/bglaundry"
NEXT_PUBLIC_API_URL="http://localhost:4000/api/v1"
EXPO_PUBLIC_API_URL="http://localhost:4000/api/v1"
```

### 3. Install Dependencies
```bash
pnpm install
```

### 4. Database Setup & Seed
Initialize the PostgreSQL schema and seed the initial service flyer catalog:
```bash
pnpm --filter database db:push
pnpm --filter database db:seed
```

### 5. Running the Apps
Start the Turborepo dev servers (Next.js Dashboard, Expo Bundler, and Express API Server):
```bash
pnpm dev
```
- Admin Dashboard: `http://localhost:3000`
- API Backend: `http://localhost:4000`
- Metro Expo Bundler: `http://localhost:8081`

---

## 🚀 Technologies Used
- **Monorepo Engine**: Turborepo, pnpm workspaces
- **Frontend Web**: Next.js, React, TailwindCSS
- **Mobile App**: Expo, React Native, Expo Router
- **Database / API**: PostgreSQL, Prisma ORM, Express, Axios
