# Setup a Windows machine under SSO system

## [machine-setup.ps1](machine-setup.ps1)
Execute once per machine with admin permissions
- Sets Long paths -support
- Sets the premissions for `C:\ProgramData\robocorp` -folder that enables use of pre-built environments and shared environments.

## [user-setup.ps1](user-setup.ps1)
Execute per user as the user
- Script makes sure the user has a working base directory for ROBOCORP tooling
- Enables the use of shared folder for the user

Optional actions:
- Load and activate an [RCC profile]() for the user
  - Set the `$PROFILE_URL` -variable in the beginning of the script
- Installs Robocorp Assistant
  - Set the `$ASSISTANT_VERSION` -variable in the beginning of the script

## [get-scripts.bat](get-scripts.bat)
A very simple script to load the latest versions of the above scripts directly from this GitHub
