@echo off
echo Remplacement des banques par AFG Bank...
cd /d "%~dp0"

powershell -Command "(Get-Content lib\ldfData.ts) -replace 'BNQ-001', 'AFG-001' -replace 'BNQ-002', 'AFG-001' -replace 'BNQ-003', 'AFG-001' -replace 'BNQ-004', 'AFG-001' -replace 'Société Générale CI', 'AFG Bank' -replace 'BICICI', 'AFG Bank' -replace 'BIAO', 'AFG Bank' -replace 'Coris Bank', 'AFG Bank' | Set-Content lib\ldfData-temp.ts"

move /Y lib\ldfData-temp.ts lib\ldfData.ts

echo.
echo Remplacement termine !
echo Toutes les banques sont maintenant AFG Bank.
echo.
pause
