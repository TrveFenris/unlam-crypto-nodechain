@echo off
set client_location=packages/client
set server_location=packages/server
set ports=1337,1338,1339

for %%a in ("%ports:,=" "%") do (
   netstat -ano|findstr %%a >nul || start cmd /k yarn server start %%~a
)

netstat -ano|findstr "127.0.0.1:3000" >nul
IF NOT %ERRORLEVEL% equ 0 (
   start /B cmd echo export default [%ports%] > %client_location%/src/config/ports.js && yarn client start
) ELSE (
   exit
)



