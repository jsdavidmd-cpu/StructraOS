# Windows PowerShell Script to Initialize STRUCTRA
# Run this after completing Supabase setup

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   STRUCTRA - Construction Management System   " -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking prerequisites..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js $nodeVersion found" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found. Please install Node.js 18+ from nodejs.org" -ForegroundColor Red
    exit 1
}

# Check if .env exists
if (Test-Path ".env") {
    Write-Host "✓ .env file found" -ForegroundColor Green
} else {
    Write-Host "✗ .env file not found" -ForegroundColor Red
    Write-Host "Creating .env from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host ""
    Write-Host "⚠ Please edit .env file with your Supabase credentials before continuing" -ForegroundColor Yellow
    Write-Host "  1. Open .env in a text editor" -ForegroundColor Yellow
    Write-Host "  2. Add your VITE_SUPABASE_URL" -ForegroundColor Yellow
    Write-Host "  3. Add your VITE_SUPABASE_ANON_KEY" -ForegroundColor Yellow
    Write-Host ""
    $continue = Read-Host "Press Enter when ready to continue (or Ctrl+C to exit)"
}

Write-Host ""
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "            Setup Complete!                     " -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Ensure Supabase migrations are run (see SETUP.md)" -ForegroundColor White
Write-Host "2. Create your first admin user" -ForegroundColor White
Write-Host "3. Start the development server:" -ForegroundColor White
Write-Host ""
Write-Host "   npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Or for Desktop app:" -ForegroundColor White
Write-Host "   npm run electron:dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Open http://localhost:5173 in your browser" -ForegroundColor White
Write-Host ""
Write-Host "For detailed setup instructions, see SETUP.md" -ForegroundColor Yellow
Write-Host ""
Write-Host "Happy building! 🏗️" -ForegroundColor Green
Write-Host ""
