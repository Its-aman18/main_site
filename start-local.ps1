# Local run for the full club platform on Windows PowerShell.
# Starts Postgres (if installed as a service) + all 6 services in separate
# windows. Run from the repo root:  powershell -ExecutionPolicy Bypass -File .\start-local.ps1
#
# Prereqs (one-time): local Postgres with `codescriet` DB, .env pointing at it
# (DATABASE_URL=postgresql://postgres:postgres@localhost:5432/codescriet),
# `npm install` at root, `npx prisma migrate deploy`, `npm run db:seed`.
# URLs when up: web http://localhost:5173 | api :5001 | playground :5174 (exec :5002) | zero-one :5175 (api :5003)

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

function Start-Svc($title, $dir, $cmd) {
  Write-Host "starting $title ..."
  Start-Process powershell -ArgumentList @('-NoExit', '-Command', "Set-Location '$dir'; $cmd") | Out-Null
}

# 1. Postgres service (needs the EDB/PostgreSQL install; harmless if absent)
$svc = Get-Service 'postgresql-x64-17' -ErrorAction SilentlyContinue
if ($svc) {
  if ($svc.Status -ne 'Running') {
    Write-Host 'starting postgres service ...'
    Start-Service 'postgresql-x64-17' -ErrorAction SilentlyContinue
  }
  Write-Host 'postgres: Running'
} else {
  Write-Host 'WARNING: postgresql-x64-17 service not found — make sure Postgres is running'
}

# 2. API + frontends + satellites (staggered: concurrent vite/tsx cold boots
# can flake on shared caches, so pause briefly between launches)
Start-Svc 'api :5001'            $root "`$env:NODE_ENV='development'; npx tsx watch apps/api/src/index.ts"
Start-Sleep -Seconds 12
Start-Svc 'web :5173'            $root "npm run dev --workspace=apps/web"
Start-Sleep -Seconds 8
Start-Svc 'playground-exec :5002' $root "`$env:NODE_ENV='development'; `$env:PORT='5002'; node apps/playground/execute-server.js"
Start-Sleep -Seconds 5
Start-Svc 'playground :5174'     $root "npm run dev --workspace=apps/playground"
Start-Sleep -Seconds 8
Start-Svc 'zero-one-api :5003'   "$root\apps\zero-one" "`$env:PORT='5003'; `$env:HOST='127.0.0.1'; `$env:NODE_ENV='development'; npx tsx server/standaloneServer.ts"
Start-Sleep -Seconds 8
Start-Svc 'zero-one :5175'       $root "npm run dev --workspace=apps/zero-one"
Start-Sleep -Seconds 20

Write-Host ''
Write-Host 'All services launching. Verify with:'
Write-Host '  API      http://127.0.0.1:5001/ping'
Write-Host '  Web      http://localhost:5173'
Write-Host '  Event    http://localhost:5173/events/zero-one-2026'
Write-Host '  Zero-One http://localhost:5175  (backend :5003)'
Write-Host 'Stop everything with: powershell -ExecutionPolicy Bypass -File .\stop-local.ps1'
Write-Host ''
Write-Host 'Port check:'
$failed = $false
foreach ($port in 5001, 5002, 5003, 5173, 5174, 5175) {
  $conn = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($conn) { Write-Host "  port $port LISTENING" } else { Write-Host "  port $port MISSING <- rerun this script"; $failed = $true }
}
if ($failed) { exit 1 }
