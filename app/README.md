# OOPshop Android App

Android client for the OOPshop e-commerce platform. Built with **MVVM**, **LiveData**, **Retrofit**, and **Jetpack Compose**. APIs are defined in the project's `backend/` folder.

## Architecture (MVVM)

- **Model**: `data/` — DTOs, Retrofit APIs, Repositories (single source of truth from backend).
- **View**: `ui/` — Compose screens and reusable components.
- **ViewModel**: `viewmodel/` — Exposes LiveData from repositories; UI observes via `observeAsState()`.

Data flow: **UI → ViewModel → Repository → Retrofit (API) → Backend**. Results flow back as **LiveData** → **Resource\<T\>** (Loading / Success / Error).

## Package Structure

```
com.ooplab.oopshop_app/
├── data/
│   ├── api/          # Retrofit interfaces & ApiResponse wrapper
│   ├── dto/          # Request/response DTOs (Product, Auth, Checkout)
│   ├── network/      # RetrofitClient, token holder
│   └── repository/   # ProductRepository, AuthRepository, Resource
├── viewmodel/        # ProductsViewModel, AuthViewModel
├── ui/
│   ├── components/   # LoadingView, ErrorView, PrimaryButton, ProductCard
│   ├── screens/      # ShopScreen, ProductDetailScreen, AuthScreen, …
│   ├── navigation/   # NavGraph, Routes
│   └── theme/        # OOPShop_AppTheme, colors, typography
└── MainActivity.kt   # Sets Compose content, ViewModels, NavGraph
```

## API Base URL

- Default: `http://10.0.2.2:3001/` (Android emulator → host machine).
- To override: set `API_BASE_URL` in `app/build.gradle.kts` or use BuildConfig.
- For a real device, use your machine's LAN IP (e.g. `http://192.168.1.x:3001/`).
- Cleartext HTTP is allowed in the app manifest for development.

## Backend API Reference

APIs used by the app (see `backend/src/routes/` and `backend/src/controllers/`):

| Area    | Endpoints |
|---------|-----------|
| **Products** | `GET /products`, `GET /products/:id` (public) |
| **Auth**     | `POST /auth/login`, `POST /auth/register`, `GET /auth/me` (Bearer token) |
| **Checkout** | `POST /checkout` (optional auth) |

All success responses follow: `{ "status": "success", "message?", "data?" }`.

## Running

1. Start the backend (from repo root): `cd backend && npm run dev` (port 3001).
2. Open `app/` in Android Studio and run on an emulator or device.
3. Ensure the device/emulator can reach the API base URL.

## Reusable Components

- **LoadingView** — Full-screen progress indicator.
- **ErrorView** — Error message + optional Retry.
- **PrimaryButton** — Full-width primary action.
- **ProductCard** — Product image, name, price; click → detail.

Screens use these plus Material3 (Scaffold, TopAppBar, OutlinedTextField, etc.).
