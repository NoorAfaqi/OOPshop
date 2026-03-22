# OOPshop Android app

Native **Kotlin** client for the OOPshop platform: customer shop flow, account, checkout (including PayPal), and an **admin drawer** for managers (products, inventory, users, invoices, reports, payments). Built with **MVVM**, **LiveData**, **Retrofit**, **Room** (cart), and **Jetpack Compose**.

## Architecture (MVVM)

| Layer | Location | Role |
|--------|----------|------|
| **Model** | `data/` | DTOs, Retrofit APIs, `RetrofitClient`, repositories, `Resource` |
| **View** | `ui/` | Compose screens, reusable components, `NavGraph` |
| **ViewModel** | `viewmodel/` | Coroutines + `LiveData` exposing `Resource<T>` to the UI |

Flow: **UI → ViewModel → Repository / Retrofit → Backend** → results back as **LiveData** (`Loading` / `Success` / `Error`).

## Package layout

```
com.ooplab.oopshop_app/
├── data/
│   ├── api/           # Retrofit interfaces, ApiResponse, request bodies
│   ├── dto/           # Gson-mapped models (products, auth, checkout, invoices, …)
│   ├── local/         # Room (cart)
│   ├── network/       # RetrofitClient, TokenHolder
│   └── repository/    # ProductRepository, AuthRepository, CartRepository, …
├── viewmodel/         # ProductsViewModel, AuthViewModel, CartViewModel, AccountViewModel, AdminViewModel
├── ui/
│   ├── components/    # LoadingView, ErrorView, charts, barcode scanner, …
│   ├── screens/       # Main, shop, cart, billing, auth, admin screens
│   ├── navigation/    # NavGraph, Routes, AdminRoutes
│   └── theme/
└── MainActivity.kt
```

## API base URL

| Environment | Typical URL |
|-------------|-------------|
| Emulator → host | `http://10.0.2.2:3001/` (default in `app/build.gradle.kts` → `BuildConfig.API_BASE_URL`) |
| Physical device | `http://<your-LAN-IP>:3001/` |
| Production | Set `API_BASE_URL` in `app/app/build.gradle.kts` (e.g. `https://oopshop.onrender.com/`) |

Cleartext HTTP is allowed in the manifest for local dev; use HTTPS in production.

## Backend endpoints used (summary)

| Area | Examples |
|------|-----------|
| **Catalog** | `GET /products`, `GET /products/:id`, filters, recommendations, barcode helpers |
| **Auth** | `POST /auth/login`, `POST /auth/register`, `GET /auth/me`, password change |
| **Checkout** | `POST /checkout`, PayPal create/capture where implemented |
| **Account** | Profile, orders, order detail |
| **Admin / manager** | Users CRUD, products CRUD, stock, `GET /invoices`, `GET /invoices/:id`, **`PUT /invoices/:id`** (e.g. `{"status":"shipped"}`), reports, payments |

Success shape: `{ "status": "success", "message"?, "data"? }`. Authenticated routes send `Authorization: Bearer <token>`.

### Admin invoice → mark shipped

On **Admin → Invoices → order detail**, managers can use **Mark as shipped**. The app shows a confirmation dialog, then calls:

`PUT /invoices/{id}` with body `{ "status": "shipped" }`.

The server updates stock, may send the customer a shipped email (if SMTP is configured), and returns the updated invoice; the UI refreshes the detail and invoice list.

## Build & run

1. Start the API: from repo root, `cd backend && npm run dev` (default port **3001**).
2. Open the **`app/`** directory in Android Studio (Gradle root is `app/`, application module is `:app`).
3. Run on an emulator or device with a reachable `API_BASE_URL`.

### Tests & coverage (local)

```bash
cd app
./gradlew testDebugUnitTest jacocoTestReport
```

HTML report: `app/build/reports/jacoco/jacocoTestReport/html/index.html` (JaCoCo scope is configured in `app/app/build.gradle.kts`).

## Requirements

- **Android Studio** with AGP compatible with the repo’s `libs.versions.toml`
- **JDK 17** (matches `compileOptions` in the app module)

## Related docs

- Root **[README.md](../README.md)** — full monorepo overview  
- **[backend/README.md](../backend/README.md)** — API & env vars  
- Swagger when API is running: `http://<host>:<port>/api-docs`
