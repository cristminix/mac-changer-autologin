REM install tmac the add executable to the PATH env
REM run this command as administrator
@echo off
:loop
tmac -n Wi-Fi -r -r02 -re -s
timeout /t 300 /nobreak
goto loop