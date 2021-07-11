@echo off
set ports=1337,1338,1339

for %%a in ("%ports:,=" "%") do (
   netstat -ano|findstr %%a >nul || start cmd /k yarn server start %%~a
)

netstat -ano|findstr "127.0.0.1:3000" >nul
IF NOT %ERRORLEVEL% equ 0 (
   yarn client start
) ELSE (
   exit
)
