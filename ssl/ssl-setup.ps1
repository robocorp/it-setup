# Define command line arguments
param (
    [switch]$DryRun,
    [switch]$Overwrite,
    [switch]$Help
)

# Check if PowerShell is run as administrator
if (-not ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Output "Please run this script as an administrator."
    Exit
}

# Help -flag prints the documentation
$documentation = @"
# Script Description

This script ...

Usage: .\template.ps1 [-DryRun] [-Overwrite] [-Help]
"@

if ($Help) {
    Write-Host $documentation
    Exit(0)
}

###################################################
# Variables
###################################################
$OpenSslConfigPath = Join-Path -Path $env:ProgramData -ChildPath "robocorp-openssl\openssl.cnf"

###################################################
# Custom functions
###################################################
function CheckEnvVariable {
    param (
        [string]$variableName,
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
        [string]$variableName,
        [string]$variableValue,
        [string]$target = "User" # User / Machine
    )
    $exists = CheckEnvVariable($variableName, $target)
    if (-not $exists) {
        [System.Environment]::SetEnvironmentVariable($variableName, $variableValue, $target)
        Write-Host "Set environment variable '$variableName' to '$variableValue' at $target level."
    }
}

function createOpenSslConfigFile {
   
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

        Write-Host "[X] OpenSSL Config written to $OpenSslConfigPath"
    } catch {
        Write-Host "[!!] Error writing the OpenSSL Config to $OpenSslConfigPath : $_"
    }
}

function legacyssl {
    
    # Step 2 write the env var for the OPENSS_CONF
    Set-EnvironmentVariable -VariableName "OPENSSL_CONF" -VariableValue $configPath

    # Step 3 write the env var for RC_TLS_LEGACY_RENEGOTIATION_ALLOWED
    Set-EnvironmentVariable -VariableName "RC_TLS_LEGACY_RENEGOTIATION_ALLOWED" -VariableValue "true"

}


###################################################
# Detect if any parts of the setup be found
# - Even partial or failed should return $true
###################################################
function DetectSetup {
    $found = $true
    if ($found) {
        Write-Host "Found previous setup"
    } else {
        Write-Host "Did not find previous setups, executing..."
    }

    return [bool]$found
}

###################################################
# Detect if a valid wanted outcome can be found
###################################################
function ValidSetup {
    $valid = $true
    if ($valid) {
        Write-Host "Setup OK!"
    } else {
        Write-Host "Invalid setup found!"
    }
    return [bool]$valid
}


###################################################
# The setup logic
###################################################
function RunSetup {
    try {
        # Script logic here
        if ($DryRun) {
            Write-Host "Setup would perform the following:"
            Write-Host "- Hello World!"
        } else {
            # Perform actual actions
            Write-Host "Running setup..."
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
        if ($DryRun) {
            Write-Host "Clearing would perform the following actions:"
            Write-Host "- Remove Hello World!"
        } else {
            Write-Host "Clearing setup..."
        }
    } catch {
        # Capture and handle errors here
        Write-Host "ClearSetup Failed!"
        Write-Host "- ExitCode: $LASTEXITCODE"
        Write-Host "- Error: $_"
    }
}


###################################################
# The base script
###################################################
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
