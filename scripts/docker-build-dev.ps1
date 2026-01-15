# Development Docker Build Script
Write-Host "Building development Docker images and containers..." -ForegroundColor Green

# Build images
Write-Host "`nBuilding images..." -ForegroundColor Yellow
docker-compose build

# Start containers
Write-Host "`nStarting containers..." -ForegroundColor Yellow
docker-compose up -d

# Show status
Write-Host "`nContainer status:" -ForegroundColor Yellow
docker-compose ps

Write-Host "`n✅ Development environment is ready!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend: http://localhost:5000" -ForegroundColor Cyan
Write-Host "`nTo view logs: docker-compose logs -f" -ForegroundColor Gray
Write-Host "To stop: docker-compose down" -ForegroundColor Gray

