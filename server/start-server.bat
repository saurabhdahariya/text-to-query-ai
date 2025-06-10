@echo off
cd /d "%~dp0"
echo Starting Text-to-SQL Backend Server...
echo Current directory: %CD%
node server.js
pause
