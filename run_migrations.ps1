# Migration Execution Script
# Run migrations 015, 016, 017 in order

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "STRUCTRA - Database Migration Runner" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Load environment variables
$envFile = Get-Content .env
$dbUrl = ($envFile | Where-Object { $_ -match '^SUPABASE_DB_URL=' }).Replace('SUPABASE_DB_URL=','').Trim()
$projectRef = ($envFile | Where-Object { $_ -match '^SUPABASE_PROJECT_REF=' }).Replace('SUPABASE_PROJECT_REF=','').Trim()

if ([string]::IsNullOrWhiteSpace($dbUrl)) {
    Write-Error "SUPABASE_DB_URL not found in .env"
    exit 1
}

Write-Host "Project: $projectRef" -ForegroundColor Green
Write-Host ""

# Step 1: Check for duplicates first
Write-Host "[Step 1/4] Checking for duplicate data..." -ForegroundColor Yellow
Write-Host "Opening duplicate check script in browser..." -ForegroundColor Gray
Write-Host "Please run this in Supabase SQL Editor:" -ForegroundColor Gray
Write-Host "  https://supabase.com/dashboard/project/$projectRef/sql/new`n" -ForegroundColor Gray

# Open the check_duplicates.sql file for copy/paste
Write-Host "Copy contents of: supabase\check_duplicates.sql" -ForegroundColor Cyan
Write-Host ""

$continue = Read-Host "Did you check for duplicates? Any duplicates found? (yes/no)"

if ($continue -eq 'yes') {
    Write-Host "`n⚠️  WARNING: Duplicates found!" -ForegroundColor Red
    Write-Host "You MUST clean up duplicates before running migration 016." -ForegroundColor Red
    Write-Host "See check_duplicates.sql for cleanup queries.`n" -ForegroundColor Red
    exit 1
}

# Step 2: Run Migration 015
Write-Host "`n[Step 2/4] Running Migration 015 (Consolidate Inventory Schema)..." -ForegroundColor Yellow
Write-Host "Copy and run in SQL Editor:" -ForegroundColor Gray
Get-Content "supabase\migrations\015_consolidate_inventory_schema.sql" -Raw | Write-Host -ForegroundColor White
Write-Host ""
$continue = Read-Host "Migration 015 completed? (yes/no)"
if ($continue -ne 'yes') { exit 1 }

# Step 3: Run Migration 016
Write-Host "`n[Step 3/4] Running Migration 016 (Add Unique Constraints)..." -ForegroundColor Yellow
Write-Host "Copy and run in SQL Editor:" -ForegroundColor Gray
Get-Content "supabase\migrations\016_add_unique_constraints.sql" -Raw | Write-Host -ForegroundColor White
Write-Host ""
$continue = Read-Host "Migration 016 completed? (yes/no)"
if ($continue -ne 'yes') { exit 1 }

# Step 4: Run Migration 017
Write-Host "`n[Step 4/4] Running Migration 017 (Add Missing Indexes)..." -ForegroundColor Yellow
Write-Host "Copy and run in SQL Editor:" -ForegroundColor Gray
Get-Content "supabase\migrations\017_add_missing_indexes.sql" -Raw | Write-Host -ForegroundColor White
Write-Host ""
$continue = Read-Host "Migration 017 completed? (yes/no)"
if ($continue -ne 'yes') { exit 1 }

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "✅ All migrations completed!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Verify in Supabase Dashboard > Database > Tables" -ForegroundColor White
Write-Host "2. Check that old tables are dropped (stock_cards, purchase_orders)" -ForegroundColor White
Write-Host "3. Run: npm run dev to test the application`n" -ForegroundColor White
