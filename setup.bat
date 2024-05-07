@echo off

SET scriptPath=%~dp0schedule.bat

echo Scheduling Daily Task...
schtasks /create /tn "Community Daily Tracker" /tr "\"%scriptPath%\" 86400" /sc HOURLY /st 00:20:00 /f

echo Done

echo Scheduling Weekly Task...
schtasks /create /tn "Community Weekly Tracker" /tr "\"%scriptPath%\" 604800" /sc WEEKLY /d MON /st 00:20:00 /f

echo Done

echo Scheduling Monthly Task...
schtasks /create /tn "Community Monthly Tracker" /tr "\"%scriptPath%\" 2592000" /sc MONTHLY /d 1 /st 00:20:00 /f

echo Done

echo All tasks scheduled successfully. Press any key to exit...
pause >nul