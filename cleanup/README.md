# Cleanup old / existing Robocorp Windows Worker setups

The script helps in cleaning up old or failed installation of Robocorp Windows Worker (a.k.a RDP Worker)
* Open Powershell as admin (need admin permissions to work with Windows Services)
* Get the service name you need to cleanup via Windows Service or from Task Scheduler job
* Run: `.\cleanup-windows-worker.ps1 <service name> -DryRun` to see what would happen
* Run: `.\cleanup-windows-worker.ps1 <service name> ` to actually cleanup.

We will improve this functionality in [Robocorp Setup Utility](https://robocorp.com/docs/control-room/setup-utility) once we have figure out all the different edge-cases