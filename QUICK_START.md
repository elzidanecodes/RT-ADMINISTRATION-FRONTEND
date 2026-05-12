# ⚡ Quick Start Guide — RT Administration App

> **TL;DR for reviewers who want to run the app in under 10 minutes.**  
> Full installation details are in each repo's `README.md`.

---

## 📋 Prerequisites

```bash
php -v       # PHP 8.2+
composer -V  # Composer 2.x
mysql -V     # MySQL 8.0+
node -v      # Node.js 18+
```

If any are missing, install them first (see full README).

---

## 🚀 Backend Setup (~5 minutes)

```bash
# 1. Clone
git clone https://github.com/elzidanecodes/rt-administration-api.git
cd rt-administration-api

# 2. Install packages
composer install

# 3. Environment
cp .env.example .env
# Edit .env — set DB_USERNAME and DB_PASSWORD

# 4. Create database
mysql -u root -p -e "CREATE DATABASE rt_administration CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 5. Setup
php artisan key:generate
php artisan migrate --seed
php artisan storage:link

# 6. Start server
php artisan serve
```

✅ **Backend running at** `http://localhost:8000`

---

## 🎨 Frontend Setup (~3 minutes)

Open a **new terminal** (keep backend running):

```bash
# 1. Clone
git clone https://github.com/elzidanecodes/rt-administration-frontend.git
cd rt-administration-frontend

# 2. Install packages
npm install

# 3. Environment
cp .env.example .env
# VITE_API_URL=http://localhost:8000/api  ← already set by default

# 4. Start dev server
npm run dev
```

✅ **Frontend running at** `http://localhost:5173`

---

## 🔐 Login Credentials

| Field | Value |
|-------|-------|
| **URL** | `http://localhost:5173` |
| **Email** | `rt@perumahan.com` |
| **Password** | `password` |

---

## ✅ Verify Installation

Open `http://localhost:5173` → login → you should see:

- ✅ Dashboard with KPI summary cards
- ✅ Menu **Rumah** → 20 houses (A-01 to A-15, B-01 to B-05)
- ✅ Menu **Pengeluaran** → 5 expense categories

If all appear, **installation is successful!** 🎉

---

## 🆘 Common Errors

| Error | Solution |
|-------|----------|
| `SQLSTATE Connection refused` | MySQL not running → `sudo service mysql start` |
| `Access denied` | Check `DB_USERNAME` & `DB_PASSWORD` in `.env` |
| `Unknown database` | Database not created → repeat backend step 4 |
| `npm command not found` | Node.js not installed |
| Login `Network Error` | Backend not running → check backend terminal |
| `CORS policy` error | Restart backend with `php artisan serve` |

---

## 🎯 Demo Flow (~5 minutes)

1. **Login** → Dashboard loads
2. **Residents** → Add 3 residents with KTP photo
3. **Houses** → Open house A-01 → Assign a resident
4. **Bills** → Click "Generate Tagihan" for current month
5. **Payments** → Record payment for 1 bill
6. **Expenses** → Add "Gaji Satpam — Rp 1.500.000"
7. **Reports** → View 12-month financial chart

This covers **all features** as required.
