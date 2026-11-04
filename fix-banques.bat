@echo off
echo Remplacement des banques par AFG BANK CI...
cd /d "%~dp0"

powershell -Command "(Get-Content lib\ldfData.ts) -replace 'BNQ-001', 'AFG-001' -replace 'BNQ-002', 'AFG-001' -replace 'BNQ-003', 'AFG-001' -replace 'BNQ-004', 'AFG-001' -replace 'Société Générale CI', 'AFG BANK CI' -replace 'BICICI', 'AFG BANK CI' -replace 'BIAO', 'AFG BANK CI' -replace 'Coris Bank', 'AFG BANK CI' | Set-Content lib\ldfData-temp.ts"

move /Y lib\ldfData-temp.ts lib\ldfData.ts

echo.
echo Remplacement termine !
echo Toutes les banques sont maintenant AFG BANK CI.
echo.
pause
