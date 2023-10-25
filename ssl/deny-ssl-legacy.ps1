# Check if PowerShell is run as administrator
if (-not ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Output "Please run this script as an administrator."
    Exit
}

# Define the file path
$opensslConfigPath = Join-Path -Path $env:ProgramData -ChildPath "robocorp-openssl\openssl.cnf"

# Check if openssl.cnf file exists and delete it
if (Test-Path -Path $opensslConfigPath) {
    Remove-Item -Path $opensslConfigPath -Force
    Write-Output "- Config file removed from: $opensslConfigPath"
}

# Check and remove OPENSSL_CONF environment variable from user level
if ([System.Environment]::GetEnvironmentVariable("OPENSSL_CONF", [System.EnvironmentVariableTarget]::User)) {
    [System.Environment]::SetEnvironmentVariable("OPENSSL_CONF", $null, [System.EnvironmentVariableTarget]::User)
    Write-Output "- OPENSSL_CONF environment variable removed from user level."
}

# Check and remove OPENSSL_CONF environment variable from system level
if ([System.Environment]::GetEnvironmentVariable("OPENSSL_CONF", [System.EnvironmentVariableTarget]::Machine)) {
    [System.Environment]::SetEnvironmentVariable("OPENSSL_CONF", $null, [System.EnvironmentVariableTarget]::Machine)
    Write-Output "- OPENSSL_CONF environment variable removed from system level."
}

# Check and remove RC_TLS_LEGACY_RENEGOTIATION_ALLOWED environment variable from user level
if ([System.Environment]::GetEnvironmentVariable("RC_TLS_LEGACY_RENEGOTIATION_ALLOWED", [System.EnvironmentVariableTarget]::User)) {
    [System.Environment]::SetEnvironmentVariable("RC_TLS_LEGACY_RENEGOTIATION_ALLOWED", $null, [System.EnvironmentVariableTarget]::User)
    Write-Output "- RC_TLS_LEGACY_RENEGOTIATION_ALLOWED environment variable removed from user level."
}

# Check and remove RC_TLS_LEGACY_RENEGOTIATION_ALLOWED environment variable from system level
if ([System.Environment]::GetEnvironmentVariable("RC_TLS_LEGACY_RENEGOTIATION_ALLOWED", [System.EnvironmentVariableTarget]::Machine)) {
    [System.Environment]::SetEnvironmentVariable("RC_TLS_LEGACY_RENEGOTIATION_ALLOWED", $null, [System.EnvironmentVariableTarget]::Machine)
    Write-Output "- RC_TLS_LEGACY_RENEGOTIATION_ALLOWED environment variable removed from system level."
} 

Write-Output ""
Write-Output "Done!"