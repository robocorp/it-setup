# Manage SSL problems

Depending on the enterprise firewall/proxy setup and how up-to-date the target servers of the automations are, users can hit different errors related to SSL or network operations in general.

The reasons are varied, and you can find more detailed explanations in our documentation:
* [Man-in-the-Middle (MITM) Firewall](https://robocorp.com/docs/faq/mitm-firewall)
* [SSL Legacy Renegotiation](https://robocorp.com/docs/faq/tls-problems)

The scripts here allow you to toggle the permission to allow SSL Legacy Renegotiation for NodeJS and Python stacks.

Easy way to just download the scripts is to use curl:
```
curl.exe -o allow-ssl-legacy.ps1 https://raw.githubusercontent.com/robocorp/it-setup/master/ssl/allow-ssl-legacy.ps1
curl.exe -o deny-ssl-legacy.ps1 https://raw.githubusercontent.com/robocorp/it-setup/master/ssl/deny-ssl-legacy.ps1
```

> Scripts below need to be executed in PowerShell with "run as administrator"

## [allow-ssl-legacy.ps1](allow-ssl-legacy.ps1)

Usage:
```PowerShell
.\allow-ssl-legacy.ps1 -Level user
.\allow-ssl-legacy.ps1 -Level system
```

- Use `-Level` to select whether you want the environment variables to be set to system-wide or just for the user
- Creates OpenSSL config file under %ProgramData%\robocorp-openssl\openssl.cnf
- Sets an environment variable `OPENSSL_CONF` that points to the config file
- Sets an environment variable `RC_TLS_LEGACY_RENEGOTIATION_ALLOWED=true`
  - This tells the Python tools also to allow legacy renegotiation
  - Note that this requires you to update your robot environments to new enough dependencies
  - [More info here](https://robocorp.com/docs/faq/tls-problems#2-2-allow-legacy-renegotiation-for-the-python-tool-stack)


## [deny-ssl-legacy.ps1](deny-ssl-legacy.ps1)
Usage:
```PowerShell
.\deny-ssl-legacy.ps1
```

Just removes the environment variables and removes the config file.