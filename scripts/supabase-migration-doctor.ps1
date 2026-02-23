$ErrorActionPreference = 'Stop'

function Get-DbUrlFromEnv {
  if (-not (Test-Path '.env')) {
    throw '.env file not found in project root.'
  }

  $line = Get-Content '.env' | Where-Object { $_ -match '^SUPABASE_DB_URL=' } | Select-Object -First 1
  if (-not $line) {
    throw 'SUPABASE_DB_URL is missing in .env'
  }

  $dbUrl = $line.Replace('SUPABASE_DB_URL=', '')
  if ([string]::IsNullOrWhiteSpace($dbUrl)) {
    throw 'SUPABASE_DB_URL is empty in .env'
  }

  return $dbUrl
}

try {
  $dbUrl = Get-DbUrlFromEnv
  Write-Host 'Checking migration alignment (local vs remote)...'

  $cmd = "supabase migration list --db-url `"$dbUrl`" 2>&1"
  $output = cmd /c $cmd | Out-String

  if ($output -match 'Local \| Remote') {
    Write-Host ''
    Write-Host $output
    Write-Host 'Migration doctor: OK (history table readable).' -ForegroundColor Green
    exit 0
  }

  Write-Host $output
  throw 'Could not read migration table. Check DB URL, password, and network access.'
}
catch {
  Write-Error $_.Exception.Message
  exit 1
}
