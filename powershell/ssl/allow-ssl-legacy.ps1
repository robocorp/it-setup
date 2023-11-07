# ---
# title: Allow SSL Legacy Renegociation
# description: Allow SSL Legacy Renegociation
# requirements: User needs to be an admin
# os: windows
# category: SSL
# type: ingredient
# ---

param (
    [string]$Level="user"
)

# Check if PowerShell is run as administrator
if (-not ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Output "Please run this script as an administrator."
    Exit
}

# Define the file path
$opensslConfigPath = Join-Path -Path $env:ProgramData -ChildPath "robocorp-openssl\openssl.cnf"

# Check if openssl.cnf file already exists
if (-not (Test-Path -Path $opensslConfigPath)) {
    # Define the content of openssl.cnf
    $opensslConfigContent = @"
nodejs_conf = openssl_init

[openssl_init]
ssl_conf = ssl_sect

[ssl_sect]
system_default = system_default_sect

[system_default_sect]
Options = UnsafeLegacyRenegotiation
"@

    # Create the directory if it does not exist
    $opensslConfigDirectory = Split-Path $opensslConfigPath
    if (-not (Test-Path -Path $opensslConfigDirectory)) {
        New-Item -Path $opensslConfigDirectory -ItemType Directory -Force
    }

    # Write the content to openssl.cnf
    Set-Content -Path $opensslConfigPath -Value $opensslConfigContent

    Write-Output "openssl.cnf created at: $opensslConfigPath"
} else {
    Write-Output "openssl.cnf already exists at: $opensslConfigPath"
}

# Set environment variables based on user choice
if ($Level -eq "system") {
    $target = [System.EnvironmentVariableTarget]::Machine
} elseif ($Level -eq "user") {
    $target = [System.EnvironmentVariableTarget]::User
} else {
    Write-Output "Invalid level argument. Please use '-Level system' or '-Level user'."
    Exit
}

# Set OPENSSL_CONF environment variable for the current PowerShell session if not already set
if (-not $env:OPENSSL_CONF) {
    $env:OPENSSL_CONF = $opensslConfigPath
}

# Check if OPENSSL_CONF environment variable is already set
if (-not [System.Environment]::GetEnvironmentVariable("OPENSSL_CONF", $target)) {
    # Set the environment variable OPENSSL_CONF to point to the created file
    [System.Environment]::SetEnvironmentVariable("OPENSSL_CONF", $opensslConfigPath, $target)

    Write-Output "- OPENSSL_CONF environment variable on $Level level, set to: $opensslConfigPath"
} else {
    Write-Output "- OPENSSL_CONF environment variable on $Level level, is already set to: $($env:OPENSSL_CONF)"
}

# Check if RC_TLS_LEGACY_RENEGOTIATION_ALLOWED environment variable is already set
if (-not [System.Environment]::GetEnvironmentVariable("RC_TLS_LEGACY_RENEGOTIATION_ALLOWED", $target)) {
    # Set the environment variable RC_TLS_LEGACY_RENEGOTIATION_ALLOWED to point to the created file
    [System.Environment]::SetEnvironmentVariable("RC_TLS_LEGACY_RENEGOTIATION_ALLOWED", "true", $target)

    Write-Output "- RC_TLS_LEGACY_RENEGOTIATION_ALLOWED environment variable set on $Level level"
} else {
    Write-Output "- RC_TLS_LEGACY_RENEGOTIATION_ALLOWED environment variable is already set on $Level level"
}

Write-Output ""
Write-Output "Remember to update your automation project!"
Write-Output "- More information at: robocorp.com/docs/faq/tls-problems"
