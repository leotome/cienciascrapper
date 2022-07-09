@ECHO OFF
cd %~dp0
call npm install --quiet
ipconfig
node %~dp0server.js