# Production Docker Build Script
Write-Host "Building production Docker images and containers..." -ForegroundColor Green

# Build images
Write-Host "`nBuilding images..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml build

# Start containers
Write-Host "`nStarting containers..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml up -d

# Show status
Write-Host "`nContainer status:" -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml ps

Write-Host "`n✅ Production environment is ready!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend: http://localhost:5000" -ForegroundColor Cyan
Write-Host "`nTo view logs: docker-compose -f docker-compose.prod.yml logs -f" -ForegroundColor Gray
Write-Host "To stop: docker-compose -f docker-compose.prod.yml down" -ForegroundColor Gray

