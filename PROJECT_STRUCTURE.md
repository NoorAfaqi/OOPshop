# OOPshop Project Structure

This document describes the organization and structure of the OOPshop project.

## 📁 Directory Structure

```
OOPshop/
├── backend/                 # Backend application (Node.js + Express)
│   ├── src/                 # Source code
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # Request handlers (MVC Controllers)
│   │   ├── services/        # Business logic layer (MVC Model)
│   │   ├── middleware/      # Custom middleware
│   │   ├── routes/          # API route definitions
│   │   ├── validators/      # Input validation schemas
│   │   ├── utils/           # Utility functions
│   │   └── migrations/      # Database migrations
│   ├── __tests__/           # Backend tests
│   ├── logs/                # Application logs (gitignored)
│   ├── Dockerfile.dev       # Development Dockerfile
│   ├── Dockerfile.prod      # Production Dockerfile
│   ├── docker-entrypoint.sh # Docker entrypoint script
│   └── package.json         # Backend dependencies
│
├── frontend/                # Frontend application (Next.js + React)
│   ├── app/                 # Next.js app directory (pages)
│   ├── components/          # React components
│   ├── lib/                 # Library code
│   │   ├── config/          # Configuration
│   │   ├── services/        # API service layer
│   │   ├── hooks/           # Custom React hooks
│   │   ├── types/           # TypeScript type definitions
│   │   └── utils/           # Utility functions
│   ├── __tests__/           # Frontend tests
│   ├── public/              # Static assets
│   ├── Dockerfile.dev       # Development Dockerfile
│   ├── Dockerfile.prod      # Production Dockerfile
│   └── package.json         # Frontend dependencies
│
├── docs/                    # 📚 Documentation
│   ├── README.md            # Documentation index
│   ├── ARCHITECTURE_PATTERNS.md
│   ├── SETUP_GUIDE.md
│   ├── TESTING_GUIDE.md
│   ├── DOCKER_SETUP.md
│   └── ...                  # Other documentation files
│
├── scripts/                  # 🔧 Build and deployment scripts
│   ├── README.md            # Scripts documentation
│   ├── docker-build-dev.ps1
│   ├── docker-build-dev.sh
│   ├── docker-build-prod.ps1
│   └── docker-build-prod.sh
│
├── logs/                    # Application logs (gitignored)
│
├── docker-compose.yml       # Docker Compose for development
├── docker-compose.prod.yml  # Docker Compose for production
├── docker-compose.remote-db.yml  # Docker Compose with remote DB
├── render.yaml              # Render.com deployment configuration
│
├── README.md                # Main project README
├── ARCHITECTURE.md          # Architecture documentation
├── LICENSE                  # License file
├── .gitignore              # Git ignore rules
└── PROJECT_STRUCTURE.md     # This file
```

## 📂 Key Directories

### Backend (`backend/`)

- **`src/controllers/`**: HTTP request handlers (MVC Controllers)
- **`src/services/`**: Business logic and data access (MVC Model)
- **`src/routes/`**: API route definitions
- **`src/middleware/`**: Authentication, validation, error handling
- **`src/validators/`**: Input validation schemas
- **`__tests__/`**: Unit and integration tests

### Frontend (`frontend/`)

- **`app/`**: Next.js pages and layouts
- **`components/`**: Reusable React components
- **`lib/services/`**: API communication layer
- **`lib/hooks/`**: Custom React hooks for state management
- **`__tests__/`**: Component and service tests

### Documentation (`docs/`)

All project documentation is organized here:
- Architecture and design documents
- Setup and deployment guides
- Testing documentation
- Integration guides
- Historical documentation

### Scripts (`scripts/`)

Build and deployment scripts:
- Docker build scripts (PowerShell and Bash)
- Deployment automation scripts

## 🗂️ File Organization Principles

1. **Separation of Concerns**
   - Backend and frontend are separate
   - Each has its own dependencies and configuration

2. **Documentation Centralization**
   - All docs in `docs/` directory
   - Easy to find and maintain

3. **Script Organization**
   - Build scripts in `scripts/` directory
   - Cross-platform support (PowerShell + Bash)

4. **Test Organization**
   - Tests co-located with code (`__tests__/`)
   - Follows Jest conventions

5. **Configuration Files**
   - Root level: Docker Compose, deployment configs
   - Project-specific: Inside respective directories

## 📝 Naming Conventions

- **Files**: kebab-case (e.g., `product.controller.js`)
- **Directories**: kebab-case (e.g., `__tests__/`, `docker-compose.yml`)
- **Documentation**: UPPER_SNAKE_CASE for main docs (e.g., `ARCHITECTURE.md`)
- **Scripts**: kebab-case with extension (e.g., `docker-build-dev.ps1`)

## 🔍 Finding Files

### Backend Code
- Controllers: `backend/src/controllers/`
- Services: `backend/src/services/`
- Routes: `backend/src/routes/`
- Tests: `backend/__tests__/`

### Frontend Code
- Pages: `frontend/app/`
- Components: `frontend/components/`
- Services: `frontend/lib/services/`
- Tests: `frontend/__tests__/`

### Documentation
- All docs: `docs/`
- Main README: `README.md`
- Architecture: `ARCHITECTURE.md`

### Configuration
- Docker: Root level (`docker-compose.yml`)
- Backend: `backend/package.json`, `backend/.env`
- Frontend: `frontend/package.json`, `frontend/.env`

## 🚀 Quick Navigation

- **Start Development**: See [docs/SETUP_GUIDE.md](./docs/SETUP_GUIDE.md)
- **Run Tests**: See [docs/TESTING_GUIDE.md](./docs/TESTING_GUIDE.md)
- **Deploy**: See [docs/RENDER_DEPLOYMENT.md](./docs/RENDER_DEPLOYMENT.md)
- **Architecture**: See [ARCHITECTURE.md](./ARCHITECTURE.md)

---

**Last Updated**: January 2026
