# 🎯 Admin Panel - Restaurant App

Separate Next.js application for restaurant admin panel.

## 🚀 Running the App

### Development Mode
```bash
cd apps/admin
npm install
npm run dev
```

**Access:** http://localhost:3001

### Build for Production
```bash
npm run build
npm start
```

---

## 📁 Structure

```
apps/admin/
├── app/
│   ├── components/         # Shared components
│   │   ├── AdminSidebar.tsx
│   │   ├── ProductForm.tsx
│   │   ├── Toast.tsx
│   │   └── StatsCard.tsx
│   ├── dashboard/          # Dashboard page
│   ├── products/           # Products management
│   │   ├── new/           # Add new product
│   │   └── page.tsx       # Products list
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home (redirects to dashboard)
│   └── globals.css         # Global styles
├── public/                 # Static assets
├── package.json
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🎨 Features

### ✅ Modern Dark Theme
- Gradient sidebar design
- Professional color scheme
- Smooth animations

### ✅ Dashboard
- Product stats
- Order stats
- Subscription stats
- Revenue metrics

### ✅ Products Management
- List all products
- Add new products
- Edit products (coming soon)
- Modern form UI

### ✅ Components
- Collapsible sidebar
- Toast notifications
- Stats cards
- Form components

---

## 🔗 API Integration

**Backend:** http://localhost:5000

All API calls use the backend running on port 5000.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Port:** 3001

---

## 📝 Routes

| Route | Description |
|-------|-------------|
| `/` | Redirects to dashboard |
| `/dashboard` | Admin dashboard with stats |
| `/products` | Products list |
| `/products/new` | Add new product |

---

## 🔒 Authentication

Currently runs without authentication for development.

**To enable auth:** Update `app/layout.tsx`

---

## 🎯 Next Steps

1. Install dependencies: `npm install`
2. Start dev server: `npm run dev`
3. Open: http://localhost:3001
4. Start managing your restaurant!

---

**Enjoy your separate admin panel! 🎉**






