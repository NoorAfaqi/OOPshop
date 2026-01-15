# Build Scripts

This directory contains build and deployment scripts for the OOPshop project.

## Available Scripts

### Docker Build Scripts

- **`docker-build-dev.ps1`** / **`docker-build-dev.sh`**
  - Builds Docker images for development environment
  - Usage: `./scripts/docker-build-dev.ps1` or `bash scripts/docker-build-dev.sh`

- **`docker-build-prod.ps1`** / **`docker-build-prod.sh`**
  - Builds Docker images for production environment
  - Usage: `./scripts/docker-build-prod.ps1` or `bash scripts/docker-build-prod.sh`

## Usage

### Windows (PowerShell)
```powershell
.\scripts\docker-build-dev.ps1
.\scripts\docker-build-prod.ps1
```

### Linux/Mac (Bash)
```bash
bash scripts/docker-build-dev.sh
bash scripts/docker-build-prod.sh
```

## Notes

- Scripts are provided for both Windows (PowerShell) and Unix-like systems (Bash)
- Make sure Docker is installed and running before executing these scripts
- For more information about Docker setup, see [docs/DOCKER_SETUP.md](../docs/DOCKER_SETUP.md)
