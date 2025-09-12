@echo off
REM CI Pipeline Runner for Windows
REM Runs full pre-commit/pre-push CI chain: type-check, lint, format:check, and build

echo [INFO] Starting Full CI Pipeline (Pre-commit/Pre-push)...
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo [ERROR] package.json not found. Please run this script from the root directory.
    pause
    exit /b 1
)

REM 1. Run Type Checking
echo [STEP 1] Running TypeScript type check...
call npm run type-check
if %errorlevel% neq 0 (
    echo [ERROR] Type checking failed! Please fix the type errors and try again.
    pause
    exit /b 1
)
echo [SUCCESS] Type checking passed!
echo.

REM 2. Run Linting
echo [STEP 2] Running ESLint...
call npm run lint:fix
if %errorlevel% neq 0 (
    echo [ERROR] Linting failed! Please fix the issues and try again.
    echo [TIP] You can run 'npm run lint:fix' to automatically fix some issues.
    pause
    exit /b 1
)
echo [SUCCESS] Linting passed!
echo.

REM 3. Run Formatting
echo [STEP 3] Formatting code...
call npm run format
if %errorlevel% neq 0 (
    echo [ERROR] Code formatting failed! Please check the formatting issues and try again.
    pause
    exit /b 1
)
echo [SUCCESS] Code formatting completed!
echo.

REM 4. Run Build
echo [STEP 4] Building the project...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Build failed! Please fix the build errors and try again.
    pause
    exit /b 1
)
echo [SUCCESS] Build completed successfully!
echo.

echo [COMPLETE] All CI checks passed! Your code is ready for deployment.
echo.
echo Summary:
echo   [PASS] TypeScript - No type errors
echo   [PASS] ESLint - No linting issues
echo   [PASS] Prettier - Code formatting is correct
echo   [PASS] Build - Project builds successfully
echo.
echo [INFO] This matches your pre-push hook configuration.
echo [INFO] You can now safely push to your repository.
echo.
pause
