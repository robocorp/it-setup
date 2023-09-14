@echo off
pushd .

SET scriptPath=%~dp0
SET scriptPath=%scriptPath:~0,-1%
cd /D %scriptPath%

SET BASE_URL=https://raw.githubusercontent.com/robocorp/it-setup/master/sso/setup-machine

curl -s -o machine-setup.ps1 %BASE_URL%/machine-setup.ps1 --fail || goto :error
curl -s -o user-setup.ps1 %BASE_URL%/user-setup.ps1 --fail || goto :error

goto :end

:error
echo.
echo Downloads failed!

:end
pause
popd
