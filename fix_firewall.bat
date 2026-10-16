@echo off
rem ======================================================================
rem QuickPoll - Apache Windows Firewall Fix (PRIVATE Profile Only)
rem ======================================================================

rem 1. Set current working directory to the script's folder (D:\QuickPoll)
cd /d "%~dp0"

title QuickPoll - Apache Firewall Fix (Private Profile Only)

echo ======================================================================
echo             QuickPoll - Windows Firewall Configuration
echo             Target: Apache HTTP (TCP Port 80) on PRIVATE Profile Only
echo ======================================================================
echo.

rem 2. Verify Administrator Privileges (Dual check: fsutil and net session)
fsutil dirty query %systemdrive% >nul 2>&1
if errorlevel 1 goto :CHECK_NET_SESSION
goto :ADMIN_OK

:CHECK_NET_SESSION
net session >nul 2>&1
if errorlevel 1 goto :ERR_NOT_ADMIN
goto :ADMIN_OK

:ADMIN_OK
echo [OK] Administrator privileges verified.
echo.

rem 3. Update existing Apache rule on Private profile for TCP to ALLOW
echo [Step 1/2] Updating existing Apache HTTP Server rule on PRIVATE profile to ALLOW (TCP)...
netsh advfirewall firewall set rule name="Apache HTTP Server" dir=in profile=private protocol=tcp new action=allow
if errorlevel 1 goto :ERR_UPDATE_APACHE
echo [OK] Existing Apache TCP Block rule on Private profile updated to ALLOW.
echo.

rem 4. Add dedicated Port 80 Inbound Allow Rule strictly on Private profile
echo [Step 2/2] Adding dedicated TCP Port 80 rule on PRIVATE profile only...
netsh advfirewall firewall delete rule name="QuickPoll Apache Port 80 Private" >nul 2>&1
netsh advfirewall firewall add rule name="QuickPoll Apache Port 80 Private" dir=in action=allow protocol=TCP localport=80 profile=private
if errorlevel 1 goto :ERR_ADD_PORT80
echo [OK] Rule "QuickPoll Apache Port 80 Private" added successfully.
echo.

rem 5. Verification Display
echo ======================================================================
echo Verification: Mojooda Apache rules on Private Profile:
echo ======================================================================
netsh advfirewall firewall show rule name="Apache HTTP Server" profile=private verbose | findstr /I "Rule Direction Profiles Action Protocol Program"
netsh advfirewall firewall show rule name="QuickPoll Apache Port 80 Private" verbose | findstr /I "Rule Direction Profiles Action Protocol LocalPort"
echo ======================================================================
echo.
echo ======================================================================
echo SUCCESS: Apache ko sirf PRIVATE network profile par access mil gaya hai!
echo Public profile aur general firewall settings bilkul mehfooz hain.
echo.
echo Ab aap apne Mobile ke Chrome browser mein ye test kar sakte hain:
echo http://192.168.137.1/quickpoll_api/api.php?action=get_polls
echo ======================================================================
goto :END

:ERR_NOT_ADMIN
echo.
echo ======================================================================
echo [ERROR 101] Administrator Privileges Darkar Hain!
echo ======================================================================
echo Yeh script Windows Firewall ke rules badalne ke liye Administrator
echo access chahti hai.
echo.
echo SAHI TAREEQA:
echo 1. File Explorer mein is file ("fix_firewall.bat") par Right Click karein.
echo 2. Menu se "Run as administrator" select karein.
echo 3. Windows UAC popup par "Yes" click karein.
echo ======================================================================
goto :END

:ERR_UPDATE_APACHE
echo.
echo ======================================================================
echo [ERROR 102] Apache HTTP Server rule update nahi ho saka!
echo ======================================================================
echo Netsh command fail ho gayi.
echo Koi ghalat tabdeeli nahi ki gayi.
echo ======================================================================
goto :END

:ERR_ADD_PORT80
echo.
echo ======================================================================
echo [ERROR 103] Dedicated Port 80 rule add nahi ho saka!
echo ======================================================================
echo Netsh firewall add rule command fail ho gayi.
echo ======================================================================
goto :END

:END
echo.
echo ----------------------------------------------------------------------
echo Yeh window khuli rahegi taake aap result dekh sakein.
echo Window band karne ke liye koi bhi key dabayein...
echo ----------------------------------------------------------------------
pause >nul
