@echo off
REM CI Pipeline Runner for Windows
REM Runs lint, type-check, and build commands in sequence

echo 🚀 Starting CI Pipeline...
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ package.json not found. Please run this script from the root directory.
    pause
    exit /b 1
)

REM 1. Run Linting
echo 🔍 Step 1: Running ESLint...
call npm run lint
if %errorlevel% neq 0 (
    echo ❌ Linting failed! Please fix the issues and try again.
    pause
    exit /b 1
)
echo ✅ Linting passed!
echo.

REM 2. Run Type Checking
echo 🔍 Step 2: Running TypeScript type check...
call npm run type-check
if %errorlevel% neq 0 (
    echo ❌ Type checking failed! Please fix the type errors and try again.
    pause
    exit /b 1
)
echo ✅ Type checking passed!
echo.

REM 3. Run Build
echo 🔨 Step 3: Building the project...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed! Please fix the build errors and try again.
    pause
    exit /b 1
)
echo ✅ Build completed successfully!
echo.

echo 🎉 All CI checks passed! Your code is ready for deployment.
echo.
echo 📋 Summary:
echo   ✅ ESLint - No linting issues
echo   ✅ TypeScript - No type errors  
echo   ✅ Build - Project builds successfully
echo.
pause
