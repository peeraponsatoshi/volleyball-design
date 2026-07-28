@echo off
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"

title yft-design - Design Editor
set "PORT=5174"
set "URL=http://localhost:%PORT%/"
set "LOG=%~dp0run.log"
set "USE_NPM=0"

> "%LOG%" echo ===== yft-design run log %DATE% %TIME% =====

echo.
echo  ========================================
echo   yft-design - Design Editor
echo   %URL%
echo  ========================================
echo.

:: ---- Node ----
where node >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Node.js not found. Install Node 18+ from https://nodejs.org
  pause
  exit /b 1
)
for /f "tokens=*" %%v in ('node -v') do echo [OK] Node %%v

:: Put npm global folders on PATH for THIS window
if defined APPDATA if exist "%APPDATA%\npm" set "PATH=%APPDATA%\npm;%PATH%"
if defined LOCALAPPDATA if exist "%LOCALAPPDATA%\pnpm" set "PATH=%LOCALAPPDATA%\pnpm;%PATH%"
if exist "%ProgramFiles%\nodejs" set "PATH=%ProgramFiles%\nodejs;%PATH%"

for /f "delims=" %%p in ('npm config get prefix 2^>nul') do (
  set "NPM_PREFIX=%%p"
  if exist "%%p" set "PATH=%%p;%%p\node_modules\.bin;%PATH%"
)

:: ---- Find or install pnpm ----
call :find_pnpm
if not defined PNPM (
  echo [INFO] pnpm not found. Installing...
  call npm install -g pnpm@9 >>"%LOG%" 2>&1

  if defined APPDATA if exist "%APPDATA%\npm" set "PATH=%APPDATA%\npm;%PATH%"
  for /f "delims=" %%p in ('npm config get prefix 2^>nul') do (
    set "NPM_PREFIX=%%p"
    if exist "%%p" set "PATH=%%p;%PATH%"
  )

  call :find_pnpm
)

if defined PNPM (
  echo [OK] pnpm: %PNPM%
) else (
  echo [WARN] pnpm still not found - using npm instead
  set "USE_NPM=1"
)

:: ---- Install deps if needed ----
if not exist "node_modules\vite" (
  echo [INFO] Installing dependencies...
  if "%USE_NPM%"=="1" (
    call npm install --legacy-peer-deps >>"%LOG%" 2>&1
  ) else (
    call "%PNPM%" install >>"%LOG%" 2>&1
    if errorlevel 1 (
      echo [WARN] pnpm install failed, trying npm...
      call npm install --legacy-peer-deps >>"%LOG%" 2>&1
      set "USE_NPM=1"
    )
  )
  if errorlevel 1 (
    echo [ERROR] Install failed. See run.log
    type "%LOG%"
    pause
    exit /b 1
  )
  echo [OK] Dependencies installed
) else (
  echo [OK] node_modules ready
)

:: Free port 5174 if busy
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":%PORT% " ^| findstr LISTENING') do (
  echo [INFO] Freeing port %PORT% ^(PID %%a^)...
  taskkill /F /PID %%a >nul 2>&1
)

:: Open browser after 3 seconds
start "" cmd /c "timeout /t 3 /nobreak >nul & start %URL%"

echo [INFO] Starting dev server...
echo [INFO] Press Ctrl+C to stop.
echo.

if "%USE_NPM%"=="1" (
  call npm run dev
) else (
  call "%PNPM%" dev
)

if errorlevel 1 (
  echo.
  echo [ERROR] Dev server exited with an error.
  echo [INFO] Log file: %LOG%
  pause
  exit /b 1
)

exit /b 0

:: --------------------
:find_pnpm
set "PNPM="

if exist "%APPDATA%\npm\pnpm.cmd" (
  set "PNPM=%APPDATA%\npm\pnpm.cmd"
  exit /b 0
)

if defined NPM_PREFIX if exist "!NPM_PREFIX!\pnpm.cmd" (
  set "PNPM=!NPM_PREFIX!\pnpm.cmd"
  exit /b 0
)

if exist "%LOCALAPPDATA%\pnpm\pnpm.exe" (
  set "PNPM=%LOCALAPPDATA%\pnpm\pnpm.exe"
  exit /b 0
)

where pnpm.cmd >nul 2>&1
if not errorlevel 1 (
  for /f "delims=" %%i in ('where pnpm.cmd') do (
    set "PNPM=%%i"
    exit /b 0
  )
)

where pnpm >nul 2>&1
if not errorlevel 1 (
  for /f "delims=" %%i in ('where pnpm') do (
    set "PNPM=%%i"
    exit /b 0
  )
)

:: corepack
where corepack >nul 2>&1
if not errorlevel 1 (
  call corepack enable >>"%LOG%" 2>&1
  call corepack prepare pnpm@9.15.0 --activate >>"%LOG%" 2>&1
  where pnpm.cmd >nul 2>&1
  if not errorlevel 1 (
    for /f "delims=" %%i in ('where pnpm.cmd') do (
      set "PNPM=%%i"
      exit /b 0
    )
  )
)

exit /b 0
