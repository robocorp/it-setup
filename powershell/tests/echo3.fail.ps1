# ---
# title: Test - Echo 3 - Fail
# description: Echo, echo, echooo... NO - with stderr!
# os: windows
# category: Test
# type: ingredient
# ---

Write-Output "Echo 3 - Will fail..."
# Write-Host "Echo 3 - Failing in a couple of seconds..." -NoNewline 2> $null
# [Console]::Error.WriteLine("Echo 3 - Failing in a couple of seconds...")
Start-Sleep -Seconds 1.5
Get-Content "NonExistentFile.txt"
# throw "ECHOoooOooo failed!"
