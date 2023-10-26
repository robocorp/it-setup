# ---
# title: List Services and tasks
# description: Listing Windows Services & Scheduled tasks
# requirements: User needs to be an admin
# type: recipe
# ---


# Check if PowerShell is run as administrator
if (-not ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Output "Please run this script as an administrator."
    Exit
}

# Get the string to search for in Task Scheduler job names
$matchName = "Robocorp-"

# Get Task Scheduler tasks containing the specified string in their name
$matchingTasks = Get-ScheduledTask | Where-Object { $_.TaskName -like "*$matchName*" }

# Output the full name of the task and the action command string for matching tasks
Write-Output "----------------------"
Write-Output "Task schedules:"
Write-Output "----------------------"
foreach ($task in $matchingTasks) {
    $taskActions = $task.Actions | ForEach-Object {
        if ($_.CimClass.CimClassName -eq "MSFT_TaskExecAction") {
            $_.Arguments
        } else {
            $_.ToString()
        }
    }
    Write-Output "$($task.TaskName)"
    Write-Output "- CMD: $($taskActions -join ', ')"
}


Write-Output "----------------------"
Write-Output "Services:"
Write-Output "----------------------"
$matchingServices = Get-Service | Where-Object { $_.DisplayName -like "*$matchName*" }

# Output the service name, status, and "path to executable" for matching services
foreach ($service in $matchingServices) {
    $servicePath = (Get-WmiObject Win32_Service | Where-Object { $_.DisplayName -eq $service.DisplayName }).PathName
    Write-Output "$($service.DisplayName)"
    Write-Output "- Status: $($service.Status)"
    Write-Output "- Path to Executable: $servicePath"
}
Write-Output "----------------------"
