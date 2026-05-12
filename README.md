<p align="center">
  <img src="src/assets/logo.png" alt="RT Admin Logo" width="120"/>
</p>

<h1 align="center">RT Administration — Frontend</h1>

<p align="center">
  Single Page Application for residential neighborhood (RT) administration management.<br>
  Built with React 18 + Vite + Tailwind CSS.
</p>

---

## 📋 Table of Contents

1. [About](#-about)
2. [Tech Stack](#-tech-stack)
3. [Requirements](#-requirements)
4. [Step 1 — Install Node.js & npm](#-step-1--install-nodejs--npm)
5. [Step 2 — Clone Repository](#-step-2--clone-repository)
6. [Step 3 — Install Dependencies](#-step-3--install-dependencies)
7. [Step 4 — Environment Configuration](#-step-4--environment-configuration)
8. [Step 5 — Ensure Backend is Running](#-step-5--ensure-backend-is-running)
9. [Step 6 — Start Development Server](#-step-6--start-development-server)
10. [Step 7 — Login & Test](#-step-7--login--test)
11. [Build for Production](#-build-for-production)
12. [Directory Structure](#-directory-structure)
13. [Features](#-features)
14. [Screenshots](#-screenshots)
15. [Troubleshooting](#-troubleshooting)
16. [Final Checklist](#-final-checklist)
17. [License](#-license)

---

## 📖 About

Frontend SPA for RT administration with the following capabilities:

- 🔐 Admin login with token authentication
- 🏘️ Dashboard with KPI summary cards and financial chart
- 🏠 House management — 20 houses, assign/unassign residents
- 👤 Resident management — CRUD with KTP photo upload
- 💳 Bill generation and payment recording
- 💰 Expense tracking with categories
- 📊 Annual & monthly financial reports with charts
- 🌙 Light & Dark mode

---

## 🛠️ Tech Stack

| Component | Version | Description |
|-----------|---------|-------------|
| Node.js | 18+ | JavaScript runtime |
| npm | 9+ | Package manager |
| React | 18.x | UI library |
| Vite | 5.x | Build tool & dev server |
| React Router | 7.x | Client-side routing |
| Axios | 1.x | HTTP client |
| Tailwind CSS | 3.x | Utility-first styling |
| Recharts | 3.x | Charts & data visualization |

---

## ⚙️ Requirements

- [ ] **Node.js 18 or higher**
- [ ] **npm 9+** (bundled with Node.js)
- [ ] **Git**
- [ ] **RT Administration API running** at `http://localhost:8000`
- [ ] **Modern browser** (Chrome, Firefox, Edge, Safari)

### Verify installed versions:

```bash
node -v    # Must be v18.x.x or higher
npm -v     # Must be 9.x.x or higher
git --version
```

---

## 📥 Step 1 — Install Node.js & npm

### Windows — Download Installer (Recommended)

1. Go to [nodejs.org](https://nodejs.org/)
2. Download the **LTS** version
3. Run the installer (Next → Next → Finish)
4. Restart terminal, then verify: `node -v`

### Ubuntu/Debian

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v
```

### macOS (Homebrew)

```bash
brew install node@20
brew link --overwrite node@20
node -v
```

### NVM (Recommended for developers)

**Linux/macOS:**
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
# Restart terminal, then:
nvm install 20 && nvm use 20 && nvm alias default 20
```

**Windows:** Download [nvm-windows](https://github.com/coreybutler/nvm-windows/releases).

---

## 📦 Step 2 — Clone Repository

```bash
git clone https://github.com/elzidanecodes/rt-administration-frontend.git
cd rt-administration-frontend
```

---

## 🎼 Step 3 — Install Dependencies

```bash
npm install
```

Expected output:
```
added 250+ packages, and audited 251+ packages in 30s
found 0 vulnerabilities
```

> ⏱️ Estimated time: 1–3 minutes.

---

## 🔧 Step 4 — Environment Configuration

### 4.1 Copy the .env file

```bash
cp .env.example .env
```

**Windows (Command Prompt):**
```cmd
copy .env.example .env
```

### 4.2 Edit `.env`

```env
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME="RT Administration"
```

> ⚠️ All Vite environment variables **must** be prefixed with `VITE_` to be accessible in the browser.

If your backend runs on a different port, update accordingly:
```env
VITE_API_URL=http://localhost:8001/api
```

---

## 🔌 Step 5 — Ensure Backend is Running

Frontend requires the backend for authentication and all data.

Test backend:
```bash
curl http://localhost:8000/api
```

Or open `http://localhost:8000` in a browser.

If not running, open a new terminal and start it:
```bash
cd ../rt-administration-api
php artisan serve
```

Keep that terminal open and use a separate terminal for the frontend.

---

## 🚀 Step 6 — Start Development Server

```bash
npm run dev
```

Expected output:
```
  VITE v5.x.x  ready in 800 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Open `http://localhost:5173` in your browser.

You should see the **Login** page.

> 💡 Vite has Hot Module Reload (HMR) — changes in code reflect instantly in the browser without a full reload.

---

## ✅ Step 7 — Login & Test

### Login credentials (from backend seeder):

| Field | Value |
|-------|-------|
| **Email** | `rt@perumahan.com` |
| **Password** | `password` |

### After login, verify:

- ✅ Redirected to **Dashboard**
- ✅ Sidebar with all menu items visible
- ✅ KPI cards showing data
- ✅ Menu **Rumah** → 20 houses (A-01 to A-15, B-01 to B-05)

### Quick feature test:

1. **Houses** → click a house → Assign a resident
2. **Residents** → Add resident with KTP photo upload
3. **Bills** → Click "Generate Tagihan" → select month/year
4. **Payments** → Record payment for a bill
5. **Expenses** → Add an expense with category
6. **Reports** → View 12-month financial chart

---

## 🏗️ Build for Production

```bash
npm run build
```

Output goes to `dist/` folder. Preview before deploying:

```bash
npm run preview
```

Runs at `http://localhost:4173`.

---

## 📁 Directory Structure

```
rt-administration-frontend/
├── src/
│   ├── api/               # Axios instance + API service modules
│   │   ├── axios.js
│   │   ├── authApi.js
│   │   ├── houseApi.js
│   │   ├── residentApi.js
│   │   ├── billApi.js
│   │   ├── paymentApi.js
│   │   ├── expenseApi.js
│   │   └── reportApi.js
│   ├── components/
│   │   ├── layout/        # Sidebar, Topbar, DashboardLayout
│   │   └── ui/            # Button, Badge, Modal, Input, Select
│   ├── context/           # AuthContext, ThemeContext
│   ├── pages/             # One component per route
│   │   ├── LoginPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── HousesPage.jsx
│   │   ├── ResidentsPage.jsx
│   │   ├── BillsPage.jsx
│   │   ├── ExpensesPage.jsx
│   │   └── ReportsPage.jsx
│   └── utils/             # formatCurrency, date helpers
├── .env                   # Environment variables (DO NOT COMMIT)
├── .env.example           # Template (commit this)
├── tailwind.config.js
├── vite.config.js
└── README.md
```

---

## 🎯 Features

### 1. Authentication
- Login with email + password
- Auto-redirect to login on token expiry
- Logout

### 2. Dashboard
- KPI cards: occupied/vacant houses, residents, income, expenses, balance, unpaid bills
- Annual financial area chart (income vs expense)
- Unpaid bills alert with quick action link

### 3. House Management
- List 20 houses with filter (status, ownership type) and search
- Add / edit / delete house
- House detail: current resident + full assignment history
- Assign / Unassign resident with start/end date

### 4. Resident Management
- List residents with search
- Add / edit / delete resident
- KTP photo upload with preview
- Resident detail: current house assignment + billing history

### 5. Bills
- List bills with filter (month, year, status, house)
- Generate monthly bills (manual button)
- Bill status: Unpaid / Paid / Partial
- Bill detail with payment history

### 6. Payments
- Record payment per bill
- Pay 12 months at once (annual payment)
- Payment history list

### 7. Expenses
- CRUD expense categories
- Add / edit / delete expenses with receipt upload
- Filter by date range and category

### 8. Reports
- 12-month area chart: income vs expense
- Monthly breakdown: income and expense detail
- Running balance visualization

---

## 🖼️ Screenshots

Each feature is shown in both **Light** and **Dark** mode.

---

### 1. Authentication — Login

<table>
<tr>
<td align="center"><b>Light Mode</b></td>
<td align="center"><b>Dark Mode</b></td>
</tr>
<tr>
<td><img src="src/docs/screenshots/light/01-login.png" alt="Login Light"/></td>
<td><img src="src/docs/screenshots/dark/01-login.png" alt="Login Dark"/></td>
</tr>
</table>

---

### 2. Dashboard

<table>
<tr>
<td align="center"><b>Light Mode</b></td>
<td align="center"><b>Dark Mode</b></td>
</tr>
<tr>
<td><img src="src/docs/screenshots/light/02-dashboard.png" alt="Dashboard Light"/></td>
<td><img src="src/docs/screenshots/dark/02-dashboard.png" alt="Dashboard Dark"/></td>
</tr>
</table>

---

### 3. House Management

<table>
<tr>
<td align="center"><b>Light Mode</b></td>
<td align="center"><b>Dark Mode</b></td>
</tr>
<tr>
<td colspan="2" align="center"><i>House list with status & ownership filter</i></td>
</tr>
<tr>
<td><img src="src/docs/screenshots/light/03-houses-list.png" alt="Houses List Light"/></td>
<td><img src="src/docs/screenshots/dark/03-houses-list.png" alt="Houses List Dark"/></td>
</tr>
<tr>
<td colspan="2" align="center"><i>House detail — current resident & assignment history</i></td>
</tr>
<tr>
<td><img src="src/docs/screenshots/light/04-houses-detail.png" alt="House Detail Light"/></td>
<td><img src="src/docs/screenshots/dark/04-houses-detail.png" alt="House Detail Dark"/></td>
</tr>
<tr>
<td colspan="2" align="center"><i>Add / Edit house form</i></td>
</tr>
<tr>
<td><img src="src/docs/screenshots/light/05-houses-form-add.png" alt="Add House Light"/></td>
<td><img src="src/docs/screenshots/dark/05-houses-form-add.png" alt="Add House Dark"/></td>
</tr>
<tr>
<td colspan="2" align="center"><i>Assign resident to house</i></td>
</tr>
<tr>
<td><img src="src/docs/screenshots/light/06-houses-form-occupants.png" alt="Assign Resident Light"/></td>
<td><img src="src/docs/screenshots/dark/06-houses-form-occupants.png" alt="Assign Resident Dark"/></td>
</tr>
</table>

---

### 4. Resident Management

<table>
<tr>
<td align="center"><b>Light Mode</b></td>
<td align="center"><b>Dark Mode</b></td>
</tr>
<tr>
<td colspan="2" align="center"><i>Resident list with search</i></td>
</tr>
<tr>
<td><img src="src/docs/screenshots/light/07-residents-list.png" alt="Residents List Light"/></td>
<td><img src="src/docs/screenshots/dark/07-residents-list.png" alt="Residents List Dark"/></td>
</tr>
<tr>
<td colspan="2" align="center"><i>Resident detail — house assignment & billing history</i></td>
</tr>
<tr>
<td><img src="src/docs/screenshots/light/08-residents-detail.png" alt="Resident Detail Light"/></td>
<td><img src="src/docs/screenshots/dark/08-residents-detail.png" alt="Resident Detail Dark"/></td>
</tr>
<tr>
<td colspan="2" align="center"><i>Add resident form with KTP photo upload</i></td>
</tr>
<tr>
<td><img src="src/docs/screenshots/light/10-residents-form-add.png" alt="Add Resident Light"/></td>
<td><img src="src/docs/screenshots/dark/10-residents-form-add.png" alt="Add Resident Dark"/></td>
</tr>
<tr>
<td colspan="2" align="center"><i>Edit resident form</i></td>
</tr>
<tr>
<td><img src="src/docs/screenshots/light/09-residents-form-edit.png" alt="Edit Resident Light"/></td>
<td><img src="src/docs/screenshots/dark/09-residents-form-edit.png" alt="Edit Resident Dark"/></td>
</tr>
</table>

---

### 5. Bills & Payments

<table>
<tr>
<td align="center"><b>Light Mode</b></td>
<td align="center"><b>Dark Mode</b></td>
</tr>
<tr>
<td colspan="2" align="center"><i>Bill list with month/year/status filter</i></td>
</tr>
<tr>
<td><img src="src/docs/screenshots/light/11-bills-list.png" alt="Bills List Light"/></td>
<td><img src="src/docs/screenshots/dark/11-bills-list.png" alt="Bills List Dark"/></td>
</tr>
<tr>
<td colspan="2" align="center"><i>Bill detail with payment history</i></td>
</tr>
<tr>
<td><img src="src/docs/screenshots/light/12-bills-detail.png" alt="Bill Detail Light"/></td>
<td><img src="src/docs/screenshots/dark/12-bills-detail.png" alt="Bill Detail Dark"/></td>
</tr>
<tr>
<td colspan="2" align="center"><i>Partial payment detail</i></td>
</tr>
<tr>
<td><img src="src/docs/screenshots/light/13-bills-partial-detail.png" alt="Partial Payment Light"/></td>
<td><img src="src/docs/screenshots/dark/13-bills-partial-detail.png" alt="Partial Payment Dark"/></td>
</tr>
<tr>
<td colspan="2" align="center"><i>Generate monthly bills</i></td>
</tr>
<tr>
<td><img src="src/docs/screenshots/light/14-bills-generate.png" alt="Generate Bills Light"/></td>
<td><img src="src/docs/screenshots/dark/14-bills-generate.png" alt="Generate Bills Dark"/></td>
</tr>
<tr>
<td colspan="2" align="center"><i>Select year for bill generation</i></td>
</tr>
<tr>
<td><img src="src/docs/screenshots/light/15-bills-generate-years.png" alt="Generate Bills Years Light"/></td>
<td><img src="src/docs/screenshots/dark/15-bills-generate-years.png" alt="Generate Bills Years Dark"/></td>
</tr>
</table>

---

### 6. Expenses

<table>
<tr>
<td align="center"><b>Light Mode</b></td>
<td align="center"><b>Dark Mode</b></td>
</tr>
<tr>
<td colspan="2" align="center"><i>Expense list with date range & category filter</i></td>
</tr>
<tr>
<td><img src="src/docs/screenshots/light/16-expenses-list.png" alt="Expenses List Light"/></td>
<td><img src="src/docs/screenshots/dark/16-expenses-list.png" alt="Expenses List Dark"/></td>
</tr>
<tr>
<td colspan="2" align="center"><i>Add expense form with receipt upload</i></td>
</tr>
<tr>
<td><img src="src/docs/screenshots/light/17-expenses-form-add.png" alt="Add Expense Light"/></td>
<td><img src="src/docs/screenshots/dark/17-expenses-form-add.png" alt="Add Expense Dark"/></td>
</tr>
<tr>
<td colspan="2" align="center"><i>Expense detail view</i></td>
</tr>
<tr>
<td><img src="src/docs/screenshots/light/18-expenses-detail.png" alt="Expense Detail Light"/></td>
<td><img src="src/docs/screenshots/dark/18-expenses-detail.png" alt="Expense Detail Dark"/></td>
</tr>
</table>

---

### 7. Reports

<table>
<tr>
<td align="center"><b>Light Mode</b></td>
<td align="center"><b>Dark Mode</b></td>
</tr>
<tr>
<td colspan="2" align="center"><i>Annual report — 12-month income vs expense area chart</i></td>
</tr>
<tr>
<td><img src="src/docs/screenshots/light/19-reports-annual.png" alt="Annual Report Light"/></td>
<td><img src="src/docs/screenshots/dark/19-reports-annual.png" alt="Annual Report Dark"/></td>
</tr>
<tr>
<td><img src="src/docs/screenshots/light/20-reports-annual.png" alt="Annual Report Detail Light"/></td>
<td><img src="src/docs/screenshots/dark/20-reports-annual.png" alt="Annual Report Detail Dark"/></td>
</tr>
<tr>
<td colspan="2" align="center"><i>Monthly report — income & expense breakdown</i></td>
</tr>
<tr>
<td><img src="src/docs/screenshots/light/21-reports-monthly.png" alt="Monthly Report Light"/></td>
<td><img src="src/docs/screenshots/dark/21-reports-monthly.png" alt="Monthly Report Dark"/></td>
</tr>
</table>

---

## 🛠️ Troubleshooting

| Error | Solution |
|-------|----------|
| `command not found: npm` | Node.js not installed or PATH not set — reinstall Node.js |
| `Cannot find module 'react'` | Run `npm install` |
| `EACCES: permission denied` | Fix with: `sudo chown -R $USER ~/.npm` |
| `ERR_CONNECTION_REFUSED` on login | Backend not running — start `php artisan serve` |
| `CORS policy` error | Check backend `config/cors.php` allows `http://localhost:5173`, then `php artisan config:clear` |
| `401 Unauthorized` repeatedly | Clear localStorage (DevTools → Application → Local Storage → Clear), then login again |
| Port 5173 in use | Use: `npm run dev -- --port 5174` |
| Tailwind classes not applied | Check `tailwind.config.js` content path includes `./src/**/*.{js,jsx}` |
| `Out of memory` on build | Run: `NODE_OPTIONS=--max-old-space-size=4096 npm run build` |
| `Could not resolve dependency` | Delete `node_modules` and `package-lock.json`, then `npm install` |

---

## ✅ Final Checklist

- [ ] Node.js 18+ installed (`node -v`)
- [ ] npm 9+ installed (`npm -v`)
- [ ] Repository cloned
- [ ] `npm install` completed without errors
- [ ] `.env` file exists with correct `VITE_API_URL`
- [ ] **Backend running** at `http://localhost:8000`
- [ ] `npm run dev` running at `http://localhost:5173`
- [ ] Login succeeds with `rt@perumahan.com` / `password`
- [ ] Dashboard loads with KPI cards
- [ ] Menu **Rumah** shows 20 houses
- [ ] Can add a resident with KTP photo upload
- [ ] Can generate bills and record payments

If all ✅, installation is successful! 🎉

---

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (port 5173) |
| `npm run build` | Build for production → `dist/` folder |
| `npm run preview` | Preview production build (port 4173) |
| `npm run lint` | Run ESLint |

---

## 📜 License

&copy; 2025 Laita Zidan  
Released under the [MIT License](LICENSE)

---

## 🙋 About the Developer

**Laita Zidan**  
Program Studi Sistem Informasi Bisnis  
Politeknik Negeri Malang (POLINEMA)  
GitHub: [github.com/elzidanecodes](https://github.com/elzidanecodes)
