# Define customer specific variables
#$PROFILE_URL = "https://acme.robocorp.dev/.well-known/rcc-profile.yaml"
#$ASSISTANT_VERSION = "robocorp-assistant-win-2.2.1.exe"

# Store the current working directory
$originalPath = Get-Location
$RCC_VERSION = "v16.2.1"

# Define the Robocorp folder under %TEMP%
$robocorpFolder = Join-Path -Path "C:\robocorp" -ChildPath "setup\user"
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
$isOkFile = Join-Path -Path $robocorpFolder -ChildPath "user-setup.ok"
if (Test-Path -Path $isOkFile) {
    Remove-Item -Path $isOkFile
}

# Change the working directory to the Robocorp folder under %TEMP%
Set-Location -Path $robocorpFolder
$RCC_EXE = Join-Path -Path $robocorpFolder -ChildPath "rcc.exe"
$LOGFILE = Join-Path -Path $robocorpFolder -ChildPath "user.log"


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

function RccCommand {
    param (
        [string]$Arguments
    )

    $command = "$RCC_EXE $Arguments"
    Log " - > $command"
    Invoke-Expression -Command $command | Out-File -FilePath $LOGFILE -Append
}

function SetProfile {
    # Load and switch to a profile

    if ([string]::IsNullOrEmpty($PROFILE_URL)) {
        return
    }
    
    Log "Setting profile from: $PROFILE_URL"
    curl.exe -s -o "profile.yaml" $PROFILE_URL | Out-File -FilePath $LOGFILE -Append
    
    RccCommand "config import -f 'profile.yaml' -s --silent"

    # Just to log the profiles and the activated one
    RccCommand "config switch --silent"
}

function FixRobocorpHome {
    # Create a user specific ROBOCORP_HOME path if needed
    # Detects if needed: path cannot contain non-ASCII characters or spaces
    Log "Check ROBOCORP_HOME"

    $pathToTest = $env:LocalAppData
    if (-not $env:ROBOCORP_HOME -eq "") {
        $pathToTest = $env:ROBOCORP_HOME
    }

    $robocorpHomeNeeded = $pathToTest -match '[^\u0000-\u007F\s]'
    if (-not $robocorpHomeNeeded) {
        # Detect spaces
        $robocorpHomeNeeded = $pathToTest -match '\s'
    }

    if ($robocorpHomeNeeded) {
        Log "Detected invalid ROBOCORP_HOME: pathToTest"
        
        # Replace non-ASCII characters
        $cleanedUsername = $env:Username -replace '[^\x20-\x7E]', ''
        
        # Replace spaces
        $cleanedUsername = $cleanedUsername -replace '\s', ''

        $newRobocorpHome = $env:ProgramData + "\robocorp-users\" + $cleanedUsername
        if (-not (Test-Path -Path $newRobocorpHome -PathType Container)) {
            New-Item -Path $newRobocorpHome -ItemType Directory
        }

        [Environment]::SetEnvironmentVariable("ROBOCORP_HOME", $newRobocorpHome, [System.EnvironmentVariableTarget]::User)
        $env:ROBOCORP_HOME = $newRobocorpHome
        Log "Set ROBOCORP_HOME=$newRobocorpHome"
    }
}
 
function InstallAssistant {
    if ([string]::IsNullOrEmpty($ASSISTANT_VERSION)) {
        return
    }

    $ASSISTANT_EXE = Join-Path -Path $robocorpFolder -ChildPath $ASSISTANT_VERSION

    Log "Installing Assistant: $ASSISTANT_VERSION"
    $url = "https://downloads.robocorp.com/assistant/releases/v2/$ASSISTANT_VERSION"
    curl.exe -s -o $ASSISTANT_EXE $url | Out-File -FilePath $LOGFILE -Append

    $command = "$ASSISTANT_EXE /S"
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

    # Fix ROBOCORP_HOME
    FixRobocorpHome

    # Use Shared holotree
    Log "Initialize shared holotree:"
    RccCommand "ht init --silent"

    # Set Profile
    SetProfile

    # Install Assistant
    InstallAssistant

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
