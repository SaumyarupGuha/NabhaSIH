@echo off
echo Setting up Nabha Health Platform...

echo Installing backend dependencies...
cd backend
call npm install

echo Installing frontend dependencies...
cd ..\frontend
call npm install

echo Setup complete!
echo.
echo To start development:
echo 1. Backend: cd backend && npm run dev
echo 2. Frontend: cd frontend && npm run dev
echo 3. Seed doctors: cd backend && npm run seed

pause