param([ValidateRange(1024,65535)][int]$Port = 8080)
$ErrorActionPreference = 'Stop'
$siteDirectory = Join-Path $PSScriptRoot 'site'
Write-Host "JK BMS Config v0.1.1: http://localhost:$Port"
Write-Host 'Stop: Ctrl+C. Only the site directory is served.'
python -m http.server $Port --bind 127.0.0.1 --directory $siteDirectory
