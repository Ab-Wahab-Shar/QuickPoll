# QuickPoll - Windows Firewall Fix (Private Profile Only)
# Note: Is script ko Administrator PowerShell mein chalana zaroori hai.

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  QuickPoll - Apache Firewall Fix (PRIVATE Profile Only)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

# Check Administrator Rights
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "[ERROR] Administrator privileges nahi hain!" -ForegroundColor Red
    Write-Host "Barahe meherbani PowerShell ko 'Run as administrator' ke sath kholein." -ForegroundColor Yellow
    exit 1
}

try {
    # 1. Update existing Apache rule on Private profile for TCP
    Write-Host "[Step 1/2] Updating existing Apache rule on PRIVATE profile to ALLOW (TCP)..." -ForegroundColor Gray
    & netsh advfirewall firewall set rule name="Apache HTTP Server" dir=in profile=private protocol=tcp new action=allow
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to update Apache HTTP Server rule on Private profile."
    }

    # 2. Add dedicated Port 80 rule for Private profile only
    Write-Host "[Step 2/2] Adding dedicated Port 80 rule on PRIVATE profile only..." -ForegroundColor Gray
    & netsh advfirewall firewall delete rule name="QuickPoll Apache Port 80 Private" 2>$null
    & netsh advfirewall firewall add rule name="QuickPoll Apache Port 80 Private" dir=in action=allow protocol=TCP localport=80 profile=private
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to add QuickPoll Apache Port 80 Private rule."
    }

    Write-Host ""
    Write-Host "SUCCESS: Apache ko sirf PRIVATE profile par allow kar diya gaya hai!" -ForegroundColor Green
    Write-Host "Public network profile par koi tabdeeli nahi ki gayi." -ForegroundColor Green
    Write-Host "URL test: http://192.168.137.1/quickpoll_api/api.php?action=get_polls" -ForegroundColor Yellow
} catch {
    Write-Host ""
    Write-Host "[ERROR] Operation fail ho gayi: $_" -ForegroundColor Red
    exit 1
}
