# PowerShell script to run the application in Docker
# This is for Windows users who prefer not to use WSL

# Clear the console
Clear-Host
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Globomantics Robot Fleet Security Demo" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Define required ports
$APP_PORT = 30000
$MONGO_PORT = 27017
$REDIS_PORT = 6379
$MQTT_PORT = 18830
$MONGO_EXPRESS_PORT = 8081

# Function to cleanup Docker resources
function Cleanup-Docker {
    Write-Host "Stopping any existing Docker containers for this project..." -ForegroundColor Yellow
    docker-compose down --remove-orphans
    
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
    
    Write-Host "Docker cleanup completed." -ForegroundColor Green
}

# Function to check and free ports if they're in use
function Free-Ports {
    Write-Host "Checking for processes using required ports..." -ForegroundColor Yellow
    
    $ports = @($APP_PORT, $MONGO_PORT, $REDIS_PORT, $MQTT_PORT, $MONGO_EXPRESS_PORT)
    foreach ($port in $ports) {
        # Check if port is in use
        $process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
        if ($process) {
            $processName = (Get-Process -Id $process).ProcessName
            Write-Host "Found process $processName (ID: $process) using port $port" -ForegroundColor Red
            Write-Host "Attempting to free port $port..." -ForegroundColor Yellow
            Stop-Process -Id $process -Force -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 1
        }
    }
    
    Write-Host "Port check completed." -ForegroundColor Green
}

# Main execution
Write-Host "Preparing environment..." -ForegroundColor Yellow
Cleanup-Docker
Free-Ports

Write-Host "Starting Globomantics Robot Fleet Security demo..." -ForegroundColor Yellow
Write-Host "Using Docker Compose" -ForegroundColor Yellow

# Run Docker Compose to start all services
Write-Host "Starting services with Docker Compose..." -ForegroundColor Yellow
docker-compose up -d

# Check if services started successfully
if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Services are now running:" -ForegroundColor Green
    Write-Host "- Application: http://localhost:$APP_PORT" -ForegroundColor Cyan
    Write-Host "- MongoDB Express: http://localhost:$MONGO_EXPRESS_PORT" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Default login credentials:" -ForegroundColor Yellow
    Write-Host "- Username: admin" -ForegroundColor White
    Write-Host "- Password: Password1!" -ForegroundColor White
    Write-Host ""
    Write-Host "To view logs:" -ForegroundColor Yellow
    Write-Host "  docker-compose logs -f app" -ForegroundColor White
    Write-Host ""
    Write-Host "To stop all services:" -ForegroundColor Yellow
    Write-Host "  docker-compose down" -ForegroundColor White
    Write-Host ""
    Write-Host "If you encounter any issues, run this script again to restart with a clean environment." -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "ERROR: Failed to start services. See error messages above." -ForegroundColor Red
    Write-Host "You may try running again with:" -ForegroundColor Yellow
    Write-Host "  .\scripts\run-docker.ps1" -ForegroundColor White
    Write-Host ""
} 