# ---
# title: Get Scripts
# description: Retrieves scripts
# requirements: User needs to be an admin
# os: windows
# type: ingredient
# ---


# Store the current working directory
$originalPath = Get-Location
try {
    $BASE_URL = "https://raw.githubusercontent.com/robocorp/it-setup/master/setup-machine"
    curl.exe -o machine-setup.ps1 $BASE_URL/machine-setup.ps1
    curl.exe -o user-setup.ps1 $BASE_URL/user-setup.ps1
    Get-ChildItem *-setup.ps1
}
catch {
    Write-Host "An error occurred: $($_.Exception.Message)"
    Pause
}
# Return to the original working directory
Set-Location -Path $originalPath
