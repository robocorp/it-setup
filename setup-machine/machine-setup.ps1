# Store the current working directory
$originalPath = Get-Location
$RCC_VERSION = "v16.2.1"

# Define the Robocorp folder under %TEMP%
$robocorpFolder = Join-Path -Path "C:\robocorp" -ChildPath "setup\machine"
if (-not (Test-Path -Path $robocorpFolder)) {
    try {
        # Attempt to create the directory
        New-Item -Path $robocorpFolder -ItemType Directory -ErrorAction Stop | Out-Null
    } catch {
        # If an error occurs (e.g., directory already exists), print an error message
        Write-Host "Failed to create the directory: $robocorpFolder"
        Write-Host "Error: $($_.Exception.Message)"
    }
}

# The isOkFile is used to detect successful run
# It should only exist after a successful run
$isOkFile = Join-Path -Path $robocorpFolder -ChildPath "machine-setup.ok"
if (Test-Path -Path $isOkFile) {
    Remove-Item -Path $isOkFile
}

# Change the working directory to the Robocorp folder under %TEMP%
Set-Location -Path $robocorpFolder
$LOGFILE = Join-Path -Path $robocorpFolder -ChildPath "machine.log"

function Log {
    param ( [string]$Message )
    Write-Host $Message
    if ($LOGFILE) {
        $Message | Out-File -Append -FilePath $LOGFILE
    }
}

function RunCommand {
    param (
        [string]$command
    )
    Log " - > $command"
    Invoke-Expression -Command $command | Out-File -FilePath $LOGFILE -Append
}

function SetShared {
    Log "Enable machine level shared folder:"

    $folderPath = "C:\ProgramData\robocorpb\ht"
    if (-not (Test-Path -Path $folderPath -PathType Container)) {
        New-Item -Path $folderPath -ItemType Directory -Force | Out-Null
    }
    RunCommand "echo $RCC_VERSION > $folderPath\shared.yes"
    RunCommand "icacls '$folderPath' /grant 'BUILTIN\Users:(OI)(CI)M' /T"
}

# The main script
try {
    # Start a fresh log
    "Running at: $(Get-Date)" | Out-File -FilePath $LOGFILE
    "Logging to: $LOGFILE"

    Log "Fix Long paths:"
    RunCommand "reg add `"HKLM\SYSTEM\CurrentControlSet\Control\FileSystem`" /v LongPathsEnabled /t REG_DWORD /d 1 /f"

    SetShared

    # Done
    Log "Done, writing ok file: $isOkFile"

    Get-Date | Out-File -FilePath $isOkFile
}
catch {
    # Exception handling code
    Log "An error occurred: $($_.Exception.Message)"
    # Handle the exception as needed
}

# Return to the original working directory
Set-Location -Path $originalPath
