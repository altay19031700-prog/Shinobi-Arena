@echo off
title Shinobi Arena - GitHub Upload
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0UPLOAD_TO_GITHUB.ps1"
echo.
if errorlevel 1 (
  echo Upload failed. Please send a screenshot of the error above.
) else (
  echo Check: https://github.com/altay19031700-prog/Shinobi-Arena/actions
)
echo.
pause
