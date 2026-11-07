@echo off
setlocal
echo JK BMS Config v0.1.1: http://localhost:8080
echo Stop: Ctrl+C. Only the site directory is served.
python -m http.server 8080 --bind 127.0.0.1 --directory "%~dp0site"
if errorlevel 1 (
  echo Server could not start. Check that Python 3 is installed and port 8080 is free.
  pause
)
endlocal
