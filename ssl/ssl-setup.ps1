# Define command line arguments
param (
    [switch]$DryRun,
    [switch]$Overwrite,
    [switch]$Help
)

###################################################
# Variables
###################################################
$OpenSslConfigPath = Join-Path -Path $env:ProgramData -ChildPath "robocorp-openssl\openssl.cnf"

###################################################
# Custom functions
###################################################
function CheckEnvVariable {
    param (
        [Parameter(Position = 0, Mandatory = $true)]
        [string]$variableName,
        [Parameter(Position = 1)]
        [string]$target = "User" # User / Machine
    )

    $variable = [System.Environment]::GetEnvironmentVariable($variableName, [System.EnvironmentVariableTarget]::$target)
    
    if ($variable -ne $null) {
        Write-Host "Environment variable '$variableName' exists in under '$target'"
        return $true
    } else {
        Write-Host "Environment variable '$variableName' not found"
        return $false
    }
}

function RemoveEnvVariable {
    param (
        [Parameter(Position = 0, Mandatory = $true)]
        [string]$variableName
    )

    $exists = Check-EnvVariable $variableName "User"
    if ($exists) {
        [System.Environment]::SetEnvironmentVariable($variableName, $null, [System.EnvironmentVariableTarget]::User)
        Write-Host "Removed user-level environment variable '$variableName'."
    }

    $exists = Check-EnvVariable $variableName "Machine"
    if ($exists) {
        [System.Environment]::SetEnvironmentVariable($variableName, $null, [System.EnvironmentVariableTarget]::Machine)
        Write-Host "Removed system-level environment variable '$variableName'."
    }
}

function SetEnvVariable {
    param (
        [Parameter(Position = 0, Mandatory = $true)]
        [string]$variableName,
        [Parameter(Position = 1, Mandatory = $true)]
        [string]$variableValue,
        [Parameter(Position = 2)]
        [string]$target = "User" # User / Machine
    )
    $exists = CheckEnvVariable($variableName, $target)
    if (-not $exists) {
        [System.Environment]::SetEnvironmentVariable($variableName, $variableValue, $target)
        Write-Host "Set environment variable '$variableName' to '$variableValue' at $target level."
    }
}

function CreateOpenSslConfigFile {
   
    $configContent = @"
nodejs_conf = openssl_init
[openssl_init]
ssl_conf = ssl_sect
[ssl_sect]
system_default = system_default_sect
[system_default_sect]
Options = UnsafeLegacyRenegotiation
"@

    try {
        # Create the directory if it does not exist
        $opensslConfigDirectory = Split-Path $OpenSslConfigPath
        if (-not (Test-Path -Path $opensslConfigDirectory)) {
            New-Item -Path $opensslConfigDirectory -ItemType Directory -Force
        }
        # Write the content to openssl.cnf
        Set-Content -Path $OpenSslConfigPath -Value $configContent

        Write-Host "[X] OpenSSL config written to $OpenSslConfigPath"
    } catch {
        Write-Host "[!!] Error writing the OpenSSL config to $OpenSslConfigPath : $_"
    }
}

function RemoveOpenSslConfigFile {
    if (Test-Path -Path $OpenSslConfigPath) {
        Remove-Item -Path $OpenSslConfigPath -Force
    }
}


###################################################
# Detect if any parts of the setup be found
# - Even partial or failed should return $true
###################################################
function DetectSetup {
    $found = $false
    Write-Host "Check existing setups..."
    if (CheckEnvVariable "OPENSSL_CONF") {
        Write-Host "- OPENSSL_CONF is set"
        $found = $true
    }

    if (CheckEnvVariable "RC_TLS_LEGACY_RENEGOTIATION_ALLOWED") {
        Write-Host "- RC_TLS_LEGACY_RENEGOTIATION_ALLOWED is set"
        $found = $true
    }

    if (Test-Path -Path $OpenSslConfigPath) {
        Write-Host "- Found OpenSSL config file"
        $found = $true
    }

    if (-not $found) {
        Write-Host "Did not find previous setups, executing..."
    }

    return [bool]$found
}

###################################################
# Detect if a valid wanted outcome can be found
###################################################
function ValidSetup {
    $valid = $true

    Write-Host "Check setup validity..."
    if (-not (CheckEnvVariable "OPENSSL_CONF")) {
        Write-Host "- OPENSSL_CONF is not set"
        $valid = $false
    }

    if (-not (CheckEnvVariable "RC_TLS_LEGACY_RENEGOTIATION_ALLOWED")) {
        Write-Host "- RC_TLS_LEGACY_RENEGOTIATION_ALLOWED is not set"
        $valid = $false
    }

    if (-not (Test-Path -Path $OpenSslConfigPath)) {
        Write-Host "- OpenSSL config file not found"
        $valid = $false
    }

    if ($valid) {
        Write-Host "Setup OK!"
    } else {
        Write-Host "Setup was not successful!"
    }
    return [bool]$valid
}


###################################################
# The setup logic
###################################################
function RunSetup {
    try {
        # Script logic here
        Write-Host "Running setup..."

        Write-Host "- Create OpenSSL config file to: $OpenSslConfigPath"
        if (-not $DryRun) {
            CreateOpenSslConfigFile
        }

        Write-Host "- Set env. variable: OPENSSL_CONF=$OpenSslConfigPath"
        if (-not $DryRun) {
            SetEnvVariable "OPENSSL_CONF" $OpenSslConfigPath
        }

        Write-Host "- Set env. variable: RC_TLS_LEGACY_RENEGOTIATION_ALLOWED=True"
        if (-not $DryRun) {
            SetEnvVariable "RC_TLS_LEGACY_RENEGOTIATION_ALLOWED" "True"
        }
    } catch {
        # Capture and handle errors here
        Write-Host "RunSetup failed!"
        Write-Host "- ExitCode: $LASTEXITCODE"
        Write-Host "- Error: $_"
    }
}

###################################################
# Clear previous/failed setups
###################################################
function ClearSetup {
    try {
        Write-Host "Clearing setup:"

        Write-Host "- Remove env. variable: OPENSSL_CONF"
        if (-not $DryRun) {
            RemoveEnvVariable "OPENSSL_CONF"
        }

        Write-Host "- Remove env. variable: RC_TLS_LEGACY_RENEGOTIATION_ALLOWED"
        if (-not $DryRun) {
            RemoveEnvVariable "RC_TLS_LEGACY_RENEGOTIATION_ALLOWED"
        }

        Write-Host "- Remove OpenSSL config at: $OpenSslConfigPath"
        if (-not $DryRun) {
            RemoveOpenSslConfigFile
        }

    } catch {
        # Capture and handle errors here
        Write-Host "ClearSetup Failed!"
        Write-Host "- ExitCode: $LASTEXITCODE"
        Write-Host "- Error: $_"
    }
}


###################################################
# Main script start
###################################################

# Check if PowerShell is run as administrator
if (-not ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Output "Please run this script as an administrator."
    Exit
}

# Help -flag prints the documentation
$documentation = @"
# Enable SSL workarounds for cases with proxy, MITM Firewall, etc.

- Enables NodeJS tools and applications to work inside proxy networks
  - Creates an OpenSSL config file that allows legacy renegoation
  - Sets environment variable 'OPENSSL_CONF=<path to config file>' to point to the config file
- Enables Python toolstacks to work inside proxy networks
  - Sets environment variable 'RC_TLS_LEGACY_RENEGOTIATION_ALLOWED=true'

Usage: .\ssl-setup.ps1 [-DryRun] [-Overwrite] [-Help]
"@

if ($Help) {
    Write-Host $documentation
    Exit(0)
}


# The base script:
# - Detect if the outcome of the script exists
# - If overwrite of not run will execute
# - Overwriting will do full clear and normal execution
# - After execution, success is detected based on the outcome
if (DetectSetup) {
    if ($Overwrite) {
        ClearSetup
        RunSetup
    } else {
        # Already done, detect outcome tells if it is ok or not
    }
} else {
    RunSetup
}

# Re-detect if the execution did what it was meant to do
if (-not (ValidSetup)) {
    # Script did not succeed so Recover if possible
    Write-Host "Error: Wanted outcome was not found, attempting to clear..."
    ClearSetup
    Write-Host "Setup cleared"
    Exit(1000)
}
