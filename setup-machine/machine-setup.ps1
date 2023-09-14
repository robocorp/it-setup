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
$RCC_EXE = Join-Path -Path $robocorpFolder -ChildPath "rcc.exe"
$LOGFILE = Join-Path -Path $robocorpFolder -ChildPath "machine.log"


function Log {
    param ( [string]$Message )
    Write-Host $Message
    if ($LOGFILE) {
        $Message | Out-File -Append -FilePath $LOGFILE
    }
}

function GetRCC {
    # Get RCC using curl
    if ([string]::IsNullOrEmpty($RCC_VERSION)) {
        $RCC_VERSION = "latest"
    }
   
    Log "Get RCC: $RCC_VERSION"
    curl.exe -s -o $RCC_EXE "https://downloads.robocorp.com/rcc/releases/$RCC_VERSION/windows64/rcc.exe" | Out-File -FilePath $LOGFILE -Append
    
    Log "Using RCC from: $RCC_EXE"
}

function RunCommand {
    param (
        [string]$command
    )
    Log " - > $command"
    Invoke-Expression -Command $command | Out-File -FilePath $LOGFILE -Append
}

function RccCommand {
    param (
        [string]$Arguments
    )

    $command = "$RCC_EXE $Arguments"
    Log " - > $command"
    Invoke-Expression -Command $command | Out-File -FilePath $LOGFILE -Append
}

# The main script
try {
    # Start a fresh log
    "Running at: $(Get-Date)" | Out-File -FilePath $LOGFILE
    "Logging to: $LOGFILE"

    # Get RCC
    GetRCC

    Log "Fix Long paths:"
    RunCommand "reg add `"HKLM\SYSTEM\CurrentControlSet\Control\FileSystem`" /v LongPathsEnabled /t REG_DWORD /d 1 /f"

    Log "Enable machine level shared folder:"
    RccCommand "ht shared --enable --once --silent"

    Log "Diagnostics:"
    RccCommand "config diag --silent"

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
