@echo off
SET TYPE=%1
cd /d %~dp0
node index.js
exit /b