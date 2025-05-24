# PowerShell script to stop all Docker services for the Globomantics Robot Fleet Demo

# Clear the console
Clear-Host
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Stopping Globomantics Robot Fleet Demo" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Stopping all Docker containers..." -ForegroundColor Yellow
docker-compose down --volumes --remove-orphans

# Remove any containers with the project name prefix
$containers = docker ps -a --filter "name=globomantics-" -q
if ($containers) {
    Write-Host "Removing orphaned containers..." -ForegroundColor Yellow
    docker rm -f $containers 2>$null
}

# Remove project-specific networks
$networks = docker network ls --filter "name=dependabot-practice" -q
if ($networks) {
    Write-Host "Removing project networks..." -ForegroundColor Yellow
    docker network rm $networks 2>$null
}

Write-Host ""
Write-Host "All services have been stopped and cleaned up." -ForegroundColor Green
Write-Host "To restart the application, run:" -ForegroundColor Yellow
Write-Host "  .\scripts\run-docker.ps1" -ForegroundColor White
Write-Host "" 