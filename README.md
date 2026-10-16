# QuickPoll 🗳️

A modern, full-stack polling and election application built for academic institutions. QuickPoll streamlines campus elections and real-time opinion polling with role-based access for students and faculty, supported across web and mobile platforms.

---

## 🌟 Key Features

- **Role-Based Access Control**:
  - **Students**: View eligible live polls, cast verified votes, and review participation status with duplicate vote prevention.
  - **Faculty / Teachers**: Create and manage polls, configure candidate details, view real-time vote tallies, track eligible voter turnout, and pause or end polls.
- **Cross-Platform**:
  - Responsive web application built with **React 19** and **Vite**.
  - Native Android application wrapper powered by **Capacitor**.
- **Lightweight & High-Performance Backend**:
  - PHP REST API utilizing PDO with prepared statements for secure database interactions.
  - MySQL database schema with relational integrity and cascade constraints.
- **Network Ready**:
  - Configurable API endpoints for localhost, local Wi-Fi hotspots, or production servers.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, React Router v7, Lucide React
- **Mobile**: Capacitor (Android runtime)
- **Backend**: PHP (PDO MySQL)
- **Database**: MySQL / MariaDB
- **Tooling**: Oxlint

---

## 📂 Project Structure

```
QuickPoll/
├── android/                 # Capacitor Android native project
├── public/                  # Static assets
├── src/
│   ├── assets/              # Icons and images
│   ├── components/          # Reusable UI components
│   ├── context/             # React context providers
│   ├── pages/               # Application views (Student, Teacher, Auth, etc.)
│   ├── App.jsx              # Main router & layout
│   └── main.jsx             # React entry point
├── api.php                  # PHP backend REST API endpoints
├── database_setup.sql       # MySQL schema and initial setup
├── capacitor.config.json    # Capacitor configuration
├── fix_firewall.ps1         # Windows Firewall helper for LAN hosting
├── package.json             # Node dependencies and scripts
└── vite.config.js           # Vite build configuration
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher) & **npm**
- **PHP** (7.4 or higher) with PDO MySQL extension enabled
- **MySQL** / **MariaDB** (e.g., via XAMPP, WampServer, or standalone)
- **Android Studio** (optional, required only for building Android APK)

---

### 1. Database Setup

1. Start your MySQL service (e.g. through XAMPP).
2. Import `database_setup.sql` into MySQL:
   ```bash
   mysql -u root -p < database_setup.sql
   ```
   Or open phpMyAdmin and import `database_setup.sql` directly.
3. This creates the `quickpoll_db` database and its associated tables (`users`, `profiles`, `polls`, `poll_options`, `votes`).

---

### 2. Backend API Setup

1. Place `api.php` in your web server root (e.g. `C:\xampp\htdocs\quickpoll_api\api.php`).
2. Verify database connection settings in `api.php`:
   ```php
   $host = 'localhost';
   $db   = 'quickpoll_db';
   $user = 'root';
   $pass = '';
   ```
3. Test the API in your browser:
   ```
   http://localhost/quickpoll_api/api.php?action=get_polls
   ```

---

### 3. Frontend Setup

1. Clone the repository and navigate to the project directory:
   ```bash
   git clone https://github.com/Ab-Wahab-Shar/QuickPoll.git
   cd QuickPoll
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Update `VITE_API_URL` to match your local or LAN backend URL:
   ```env
   VITE_API_URL=http://localhost/quickpoll_api/api.php
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

---

### 4. Android Build (Capacitor)

To sync and build the Android APK:
```bash
npm run build
npx cap sync android
npx cap open android
```
Build and run the project using Android Studio.

---

## 🔒 Security Best Practices

- Ensure `.env` is kept private and never committed to version control.
- In production environments, replace default database credentials with restricted-privilege database users.

---

## 📄 License

This project is open-source and available under the standard MIT License.
