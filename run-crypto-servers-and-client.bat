@echo off
set client_location=client
set ports=1337,1338,1339

mkdir node_modules

for %%a in ("%ports:,=" "%") do (
   netstat -ano|findstr %%a >nul || start cmd /k yarn start %%~a
)

netstat -ano|findstr "127.0.0.1:3000" >nul
IF NOT %ERRORLEVEL% equ 0 (
   start /B cmd mkdir %client_location%\node_modules & echo export default [%ports%] > %client_location%/src/config/ports.js && cd %client_location% && yarn && yarn start
) ELSE (
   exit
)



