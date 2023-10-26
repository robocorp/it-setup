# Setup a Windows machine to run Robocorp tools

The script by default work under `C:\robocorp\setup` -folder.

## [machine-setup.ps1](machine-setup.ps1)
Execute once per machine with admin permissions
- Sets up [Windows support for long filenames](https://robocorp.com/docs/troubleshooting/windows-long-path)
- Sets the permissions that enable use of [pre-built environments](https://robocorp.com/docs/rcc/pre-built-environments) and [shared environments](https://robocorp.com/docs/faq/shared-holotree).
- All files used during the script run are placed in `C:\robocorp\setup\machine`
  - `machine.log`: Log of the last run
  - `machine-setup.ok`: File exists only if the last run was successful (for verification)
  - The folder can be deleted after each installation as the setups do not rely on this folder after passing.

## [user-setup.ps1](user-setup.ps1)
Execute per user as the user
- Script makes sure the user has a [working base directory](https://robocorp.com/docs/troubleshooting/robocorp-home) for ROBOCORP tooling
- Enables the use of a shared folder for the user
- All files used during the script run are placed in `C:\robocorp\setup\user`
  - `user.log`: Log of the last run
  - `user-setup.ok`: File exists only if the last run was successful (for verification)
  - The folder can be deleted after each installation as the setups do not rely on this folder after passing.

Optional actions:
- Load and activate an [RCC profile](https://robocorp.com/docs/faq/profile-support) for the user
  - Set the `$PROFILE_URL` -variable at the beginning of the script
- Installs [Robocorp Assistant](https://robocorp.com/docs/control-room/attended)
  - Set the `$ASSISTANT_VERSION` -variable at the beginning of the script
  - [Assistant Releases](https://updates.robocorp.com/tag/assistant)

## [get-scripts.ps1](get-scripts.ps1)
A simple script to load the latest versions of the above scripts directly from this GitHub repo
