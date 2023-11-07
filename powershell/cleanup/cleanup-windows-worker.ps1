# ---
# title: Remove Windows Worker
# description: Running several atomic scripts that would remove the Windows Service & Scheduled task
# requirements: User needs to be an admin
# os: windows
# category: Worker
# type: recipe
# ---

[CmdletBinding()]
param (
    [Parameter(Mandatory=$true)]
    [string]$SERVICE_NAME,
    [string]$USER_NAME,
    [switch]$DryRun
)

# Check if PowerShell is run as administrator
if (-not ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Output "Please run this script as an administrator."
    Exit
}

# Step 2: Stop the service using Stop-Service cmdlet
Write-Output "Stopping service: $SERVICE_NAME"
if (-not $DryRun) {
    Stop-Service -Name $SERVICE_NAME -Force
}

# Step 3: Delete the service using sc.exe command
Write-Output "Deleting service: $SERVICE_NAME"
if (-not $DryRun) {
    Start-Process -NoNewWindow -FilePath "sc.exe" -ArgumentList "delete", "$SERVICE_NAME"
}

# Step 4: Check for services with 'Robocorp-' in their name using Get-Service
Write-Output "Checking services existence with 'Robocorp-' in their name:"
$matchingServices = Get-Service | Where-Object { $_.Name -like "Robocorp-*" }
$matchingServices | ForEach-Object {
    Write-Output ("- " + $_.Name)
}

# Step 5: Delete scheduled task using Unregister-ScheduledTask cmdlet
Write-Output "Deleting scheduled task: $SERVICE_NAME"
if (-not $DryRun) {
    Unregister-ScheduledTask -TaskName $SERVICE_NAME -Confirm:$false
}

# Step 6: Display scheduled tasks with names starting with 'Robocorp-'
Write-Output "Remaining scheduled tasks:"
$remainingTasks = Get-ScheduledTask | Where-Object { $_.TaskName -like "Robocorp-*" }
$remainingTasks | ForEach-Object {
	 Write-Output ("- " + $_.TaskName)
}

# Step 7: Find and remove status files related to the worker
$workersPath="$env:ProgramData\robocorp\workers"
$matchingFiles = Get-ChildItem -Path $workersPath -Filter '*.json' -Recurse |
    Where-Object { (Get-Content $_.FullName -Raw) -match $SERVICE_NAME }

Write-Output "Matching '*.json' files:"
$matchingFiles | ForEach-Object {
    Write-Output $_.FullName
}

if (-not $DryRun) {
    Write-Output "Removing matching '*.status.json' files:"
    $matchingFiles | ForEach-Object {
        Write-Output $_.FullName
        Remove-Item $_.FullName -Force
    }
}

# Step 8: Delete the user-specific worker folder
$folderPath = "C:\Users\$USER_NAME\AppData\Local\robocorp\workforce-agent-core-service"
if (Test-Path $folderPath -PathType Container) {
	Write-Output "Found user specific worker folder at: $folderPath"
	Write-Output "Deleting folder: $folderPath"
	if (-not $DryRun) {
		Remove-Item $folderPath -Recurse -Force
	}
}
