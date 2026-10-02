# Stops everything started by start-local.ps1 (port-targeted, safe).
# Run from the repo root:  powershell -ExecutionPolicy Bypass -File .\stop-local.ps1
foreach ($port in 5001, 5002, 5003, 5173, 5174, 5175) {
  $conn = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($conn) {
    Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
    Write-Host "stopped port $port"
  } else {
    Write-Host "port $port already free"
  }
}
