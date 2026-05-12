<p align="center">
  <img src="src/assets/logo.png" alt="RT Admin Logo" width="120"/>
</p>

<h1 align="center">RT Administration — Frontend</h1>

<p align="center">
  Single Page Application for RT (Residential Neighborhood) administration management.<br>
  Built by <strong>Laita Zidan</strong>.<br>
  Covers house & resident management, billing, expense tracking, and financial reporting.
</p>

---

## 🎯 Features

- Login with token-based authentication (Sanctum)
- Dashboard with KPI summary cards and annual financial area chart
- Houses management — list, create, edit, delete, assign/unassign resident
- Residents management — list, create, edit, resident detail with billing history
- Bills & Payments — create bill, record payment, track partial payments
- Expenses — list, add, filter by category and period
- Reports — monthly & annual summary with bar and area charts
- Light & Dark mode with full Material Design 3 color system

---

## 🧠 Tech Stack

| Component | Description |
|-----------|-------------|
| **React 18** | UI framework |
| **Vite** | Build tool & dev server |
| **Tailwind CSS v3** | Utility-first styling with MD3 color system |
| **Recharts** | Charts and data visualization |
| **React Router v7** | Client-side routing |
| **Axios** | HTTP client for API communication |

---

## 🧩 Directory Structure

```
rt-administration-frontend/
├── src/
│   ├── api/               # Axios API modules (authApi, houseApi, residentApi, etc.)
│   ├── components/
│   │   ├── layout/        # Sidebar, Topbar, DashboardLayout
│   │   └── ui/            # Button, Badge, Modal, Input, Select
│   ├── context/           # AuthContext, ThemeContext
│   ├── pages/             # DashboardPage, HousesPage, ResidentsPage,
│   │                      #   BillsPage, ExpensesPage, ReportsPage, LoginPage
│   └── utils/             # formatCurrency, date helpers
├── tailwind.config.js     # Color system with CSS variable + RGB opacity support
└── src/index.css          # Material Design 3 CSS custom properties (light & dark)
```

---

## 🔁 Application Flow

1. User opens the app → redirected to `/login` if no token
2. After login → token stored in `localStorage` → redirected to `/dashboard`
3. Dashboard shows KPI cards (houses, residents, income, expenses, balance, unpaid bills)
4. All pages use the shared layout (Sidebar + Topbar)
5. Data fetched from the backend API with Axios (with auth token in headers)
6. Dark/Light mode toggled via `ThemeContext` — persists across sessions

---

## 🖼️ Screenshots

> Light Mode

<p align="center">
  <img src="docs/screenshot-light.png" alt="Light Mode" width="700"/>
</p>

> Dark Mode

<p align="center">
  <img src="docs/screenshot-dark.png" alt="Dark Mode" width="700"/>
</p>

---

## 🚀 Getting Started

**1. Clone & install dependencies**
```bash
git clone https://github.com/elzidanecodes/rt-administration-frontend.git
cd rt-administration-frontend
npm install
```

**2. Environment setup**

Create a `.env` file:
```env
VITE_API_URL=http://localhost:8000
```

**3. Start the dev server**
```bash
npm run dev
```

App will be available at `http://localhost:5173`

---

## 📦 Build for Production

```bash
npm run build
```

Output will be in the `dist/` folder.

---

## ⚙️ Requirements

- Node.js 18+
- Backend API running — see [rt-administration-api](https://github.com/elzidanecodes/rt-administration-api)

---

## 👮 Roles & Access

| Role | Access |
|------|--------|
| Admin | Full access — manage houses, residents, bills, expenses, reports |

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
