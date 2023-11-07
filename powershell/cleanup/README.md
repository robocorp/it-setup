# Cleanup old / existing Robocorp Windows Worker setups

The script helps in cleaning up old or failed installation of Robocorp Windows Worker (a.k.a RDP Worker)

Easy way to just download the script is to use curl:
```
curl.exe -o cleanup-windows-worker.ps1 https://raw.githubusercontent.com/robocorp/it-setup/master/cleanup/cleanup-windows-worker.ps1
```

> Script needs to be executed in PowerShell with "run as administrator"

* Get the service name you need to cleanup via Windows Service or from Task Scheduler job
* The username you can get from `echo %USERNAME%`
* Run: `.\cleanup-windows-worker.ps1 <service name> <user_name> -DryRun` to see what would happen
* Run: `.\cleanup-windows-worker.ps1 <service name> <user_name>` to actually cleanup.

We will improve this functionality in [Robocorp Setup Utility](https://robocorp.com/docs/control-room/setup-utility) once we have figure out all the different edge-cases


## List existing Robocorp Services and Task Schedules on a machine

```
curl.exe -o list-services-and-tasks.ps1 https://raw.githubusercontent.com/robocorp/it-setup/master/cleanup/list-services-and-tasks.ps1
```

The script simply lists the existing Robocorp Services and Task Schedules with a few key details to help troubleshooting and cleanups actions.
