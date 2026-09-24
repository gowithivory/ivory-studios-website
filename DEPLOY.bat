@echo off
title Ivory Studios — Deploy to Vercel
color 0A
cd /d "%~dp0"

set LOGFILE=%~dp0docs\deploy-log.txt
echo Ivory Studios Deploy Log > "%LOGFILE%"
echo Started: %DATE% %TIME% >> "%LOGFILE%"
echo. >> "%LOGFILE%"

echo.
echo  ==========================================
echo   IVORY STUDIOS — Deploy to Vercel
echo  ==========================================
echo.

:: ── Check Node ──────────────────────────────────────────────
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found. >> "%LOGFILE%"
    echo  ERROR: Node.js is not installed.
    echo  Download from https://nodejs.org then re-run.
    echo ERROR: Node not installed >> "%LOGFILE%"
    pause & exit /b 1
)
for /f "tokens=*" %%v in ('node --version 2^>^&1') do echo Node version: %%v >> "%LOGFILE%"
echo  [OK] Node.js found.

:: ── Check / install Vercel CLI ───────────────────────────────
where vercel >nul 2>&1
if %errorlevel% neq 0 (
    echo  [1/3] Installing Vercel CLI...
    echo Installing Vercel CLI... >> "%LOGFILE%"
    call npm install -g vercel >> "%LOGFILE%" 2>&1
    if %errorlevel% neq 0 (
        echo  ERROR: npm install failed. Check deploy-log.txt
        echo npm install FAILED >> "%LOGFILE%"
        pause & exit /b 1
    )
    echo  Vercel CLI installed.
    echo Vercel CLI installed successfully >> "%LOGFILE%"
) else (
    for /f "tokens=*" %%v in ('vercel --version 2^>^&1') do echo Vercel version: %%v >> "%LOGFILE%"
    echo  [1/3] Vercel CLI already installed.
)

:: ── Deploy ──────────────────────────────────────────────────
echo  [2/3] Deploying to production...
echo  A browser window may open for login — sign in then come back.
echo.
echo Running: vercel deploy --prod --yes >> "%LOGFILE%"
call vercel deploy --prod --yes >> "%LOGFILE%" 2>&1
set DEPLOY_EXIT=%errorlevel%

echo. >> "%LOGFILE%"
echo Deploy exit code: %DEPLOY_EXIT% >> "%LOGFILE%"

if %DEPLOY_EXIT% neq 0 (
    echo  [ERROR] Deploy failed. Opening log...
    echo DEPLOY FAILED - check errors above >> "%LOGFILE%"
    notepad "%LOGFILE%"
    pause & exit /b 1
)

:: ── Success ──────────────────────────────────────────────────
echo  [3/3] SUCCESS! Live at the URL shown above.
echo DEPLOY SUCCEEDED >> "%LOGFILE%"
echo.
echo  ==========================================
echo   Next: connect ivorystudios.io
echo  ==========================================
echo   1. Go to vercel.com/dashboard
echo   2. Open ivory-studios project
echo   3. Settings > Domains > Add > ivorystudios.io
echo.
echo   Squarespace DNS (Domains > Manage > DNS):
echo   A     @    76.76.21.21
echo   CNAME www  cname.vercel-dns.com
echo  ==========================================
echo.
echo  Log saved to: docs\deploy-log.txt
echo.
pause
