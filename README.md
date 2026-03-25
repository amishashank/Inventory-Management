# Inventory SaaS Platform 🚀

[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-black?logo=github)](https://github.com/amishashank/Inventory-Management)

A comprehensive, multi-tenant Full-Stack Inventory Management Software as a Service (SaaS). This unified platform allows shop owners and businesses to seamlessly manage their products, customers, billing, forecasting, and more natively within a secure web interface.

---

## 📸 Screenshots

*(I have updated this section to match the 5 screenshots you uploaded! Save them to your `screenshots` folder as shown below:)*

### 1. Secure Login (`login.png`)
![Login Screen](screenshots/login.png)
*Clean and secure authentication interface checking user credentials.*

### 2. Dashboard Overview (`dashboard.png`)
![Dashboard View](screenshots/dashboard.png)
*Centralized view of business metrics (Total Revenue, Active Schemes), low stock alerts, and recent bills.*

### 3. Products List (`products.png`)
![Products Table](screenshots/products.png)
*A detailed table to view, edit, and manage all your inventory items, categories, and SKUs.*

### 4. Tax Invoice Generation (`invoice.png`)
![Tax Invoice](screenshots/invoice.png)
*Professional, automated GST-compliant invoice generation right after checking out.*

### 5. Bills History (`bills.png`)
![Bills History](screenshots/bills.png)
*Complete ledger tracking customer references, payment methods, discounts, and total transaction amounts.*

---

## 🌟 Key Features & Workflows

### 🏪 Core Operations
- **Product & Category Management:** Create unlimited categories and products, set stock thresholds, and view real-time availability.
- **Discount & Scheme Simulation:** Setup promotional discounts or calculate "Forecasted Quantities" to plan ahead for seasonal sales.
- **Customers & Recipients:** Track loyal customers, mapping their purchase history to generate insights and filtered reports.

### 💳 Billing & Invoicing Engine
- **Dynamic GST Handling:** Automatically splits and calculates CGST/SGST based on the configured environment.
- **Cart & Line Items:** Easily add items to an active bill, adjust quantities dynamically, and finalize the invoice.
- **Historical Bills:** Navigate to the `Bills` page to review past transactions and generate reprint-ready invoices.

### 🔒 Security & Architecture
- **JWT Authentication:** Stateful user context handled entirely via secure JSON Web Tokens.
- **Protected Routes:** React Router DOM secures frontend views ensuring only authorized users can access the dashboard.
- **Role-Based Access:** Backend endpoints are guarded globally by Spring Security.

---

## 🏗️ Technology Stack

### Frontend (User Interface)
- **Framework:** React 19 mapped through Vite
- **Styling:** Tailwind CSS v4 (Custom surface and primary color palettes)
- **Routing:** React Router DOM v7
- **HTTP Client:** Axios
- **Icons:** Lucide-React

### Backend (Server & API)
- **Language/Framework:** Java 17 / Spring Boot 3.2.3
- **Database Access:** Spring Data JPA / Hibernate
- **Security:** Spring Security & Custom JWT Filters
- **Database:** PostgreSQL
- **Utilities:** Lombok (to reduce boilerplate constraints)

---

## 📂 Repository Structure

This repository uses a monolithic-style structure containing both sub-projects to streamline local execution.

```text
/ (Project Root)
├── backend/            # Spring Boot REST API
│   ├── src/main/java   # Java Source Code (Controllers, Services, Repositories, Entities)
│   ├── src/main/resources/application.properties  # Configuration (DB credentials, JWT secrets)
│   └── pom.xml         # Maven dependencies
├── frontend/           # Vite + React Client
│   ├── src/            
│   │   ├── components/ # Reusable UI components (Layouts, Inputs, Buttons)
│   │   ├── pages/      # Route-defined fullscreen views (Billing, Products, Dashboard)
│   │   └── context/    # Global State (AuthContext)
│   ├── package.json    # Node dependencies and scripts
│   └── vite.config.js  # Vite bundling configurations
└── screenshots/        # Application image references for this README
```

---

## ⚙️ Environment Configuration

### Backend
The `application.properties` manages all connections:
- `spring.datasource.url` - Postgres DB URL (e.g., `jdbc:postgresql://localhost:5432/inventory_saas`)
- `spring.datasource.username` / `password`
- `app.jwt.secret` - The base64 secret used for token signature validation.

### Frontend
Any Axios configuration is generally directed towards `http://localhost:8081/api` where the Spring Boot server runs.

---

## 🛠️ Prerequisites

To run this project, make sure these are installed on your system:
- [Java 17 JDK](https://adoptium.net/)
- [Node.js](https://nodejs.org/) (v18+)
- [PostgreSQL](https://www.postgresql.org/) (Ensure your local Database is running)

---

## 🚀 Getting Started

Follow these steps to clone and manually bring up the environment:

### 1. Clone the Repository
```bash
git clone https://github.com/amishashank/Inventory-Management.git
cd Inventory-Management
```

### 2. Database Configuration
Launch PostgreSQL and manually create the database required for this application:
```sql
CREATE DATABASE inventory_saas;
```
*(With Spring JPA `ddl-auto=update`, all application tables (e.g., users, products, invoices) will be generated automatically on first startup).*

### 3. Start the Backend API
Navigate to the backend directory and launch the Spring Boot server:

```bash
cd backend
./mvnw spring-boot:run
```
> The API will bind natively to `http://localhost:8081`.

### 4. Start the Frontend Application
In a separate terminal, navigate into the frontend folder, install the packages, and run the developer server:

```bash
cd frontend
npm install
npm run dev
```
> The web interface will map natively to `http://localhost:5173`.

---

## 🤝 Contribution Guidelines
When contributing to this project:
1. Ensure Java controllers map DTOs securely.
2. Ensure UI improvements follow the existing Tailwind utility designs within the `/components` folder.
