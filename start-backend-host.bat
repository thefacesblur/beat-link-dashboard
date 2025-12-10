@echo off
echo Starting Beat Link API Backend on Host...
echo.
echo This will run the backend on your host machine so it can access Pro DJ Link network.
echo The Docker container will run only the frontend and connect to this backend.
echo.
echo Press Ctrl+C to stop the backend when done.
echo.

cd /d %~dp0
cd api-server

REM Run the application
echo Starting server on port 17081...
java -jar target\uberjar\beat-link-api-standalone.jar 17081

pause

