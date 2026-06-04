$ErrorActionPreference = "Stop"

$RootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendDir = Join-Path $RootDir "backend"
$FrontendDir = Join-Path $RootDir "frontend"
$EnvFile = Join-Path $RootDir ".env"

if (Test-Path $EnvFile) {
    Get-Content $EnvFile | ForEach-Object {
        $Line = $_.Trim()
        if (-not $Line -or $Line.StartsWith("#") -or -not $Line.Contains("=")) {
            return
        }

        $Parts = $Line.Split("=", 2)
        [Environment]::SetEnvironmentVariable($Parts[0].Trim(), $Parts[1].Trim(), "Process")
    }
}

$BackendPort = if ($env:BACKEND_PORT) { $env:BACKEND_PORT } else { "8081" }
$FrontendPort = if ($env:FRONTEND_PORT) { $env:FRONTEND_PORT } else { "3000" }
$ServerAddress = if ($env:SERVER_ADDRESS) { $env:SERVER_ADDRESS } else { "0.0.0.0" }
$LanIp = if ($env:LAN_IP) {
    $env:LAN_IP
} else {
    Get-NetIPAddress -AddressFamily IPv4 |
        Where-Object {
            $_.IPAddress -notlike "127.*" -and
            $_.IPAddress -notlike "169.254.*" -and
            $_.PrefixOrigin -ne "WellKnown"
        } |
        Select-Object -First 1 -ExpandProperty IPAddress
}

$BackendJob = $null
$FrontendJob = $null

function Receive-ServerLogs {
    param($Jobs)

    $PreviousPreference = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    try {
        Receive-Job -Job $Jobs -ErrorAction Continue
    } finally {
        $ErrorActionPreference = $PreviousPreference
    }
}

function Test-TcpPort {
    param(
        [string]$HostName,
        [int]$Port
    )

    $Client = [System.Net.Sockets.TcpClient]::new()
    try {
        $Connect = $Client.BeginConnect($HostName, $Port, $null, $null)
        if (-not $Connect.AsyncWaitHandle.WaitOne(500)) {
            return $false
        }
        $Client.EndConnect($Connect)
        return $true
    } catch {
        return $false
    } finally {
        $Client.Close()
    }
}

try {
    Write-Host "Starting backend on http://$ServerAddress`:$BackendPort"
    $BackendJob = Start-Job -Name "rms-backend" -ArgumentList $BackendDir, $BackendPort, $ServerAddress -ScriptBlock {
        param($BackendDir, $BackendPort, $ServerAddress)
        Set-Location $BackendDir
        if (Test-Path ".\mvnw.cmd") {
            & ".\mvnw.cmd" spring-boot:run "-Dspring-boot.run.arguments=--server.address=$ServerAddress --server.port=$BackendPort"
        } else {
            & mvn spring-boot:run "-Dspring-boot.run.arguments=--server.address=$ServerAddress --server.port=$BackendPort"
        }
    }

    Write-Host "Waiting for backend port $BackendPort..."
    $BackendReady = $false
    for ($Attempt = 1; $Attempt -le 60; $Attempt++) {
        Receive-ServerLogs -Jobs @($BackendJob)
        if ($BackendJob.State -ne "Running") {
            throw "Backend stopped before it was ready. Check the output above."
        }
        if (Test-TcpPort -HostName "127.0.0.1" -Port ([int]$BackendPort)) {
            $BackendReady = $true
            break
        }
        Start-Sleep -Seconds 1
    }
    if (-not $BackendReady) {
        throw "Backend did not open port $BackendPort within 60 seconds."
    }

    Write-Host "Starting frontend on http://0.0.0.0:$FrontendPort"
    $FrontendJob = Start-Job -Name "rms-frontend" -ArgumentList $FrontendDir, $FrontendPort -ScriptBlock {
        param($FrontendDir, $FrontendPort)
        Set-Location $FrontendDir
        if (Get-Command yarn -ErrorAction SilentlyContinue) {
            & yarn dev --host 0.0.0.0 --port $FrontendPort
        } else {
            & npm run dev -- --host 0.0.0.0 --port $FrontendPort
        }
    }

    Write-Host ""
    Write-Host "Backend Job : $($BackendJob.Id)"
    Write-Host "Frontend Job: $($FrontendJob.Id)"
    Write-Host ""
    Write-Host "Open on this PC    : http://localhost:$FrontendPort"
    if ($LanIp) {
        Write-Host "Open from phone/PC : http://$LanIp`:$FrontendPort"
        Write-Host "Backend base       : http://$LanIp`:$BackendPort"
    } else {
        Write-Host "LAN IP was not detected. Use your PC IPv4 address with port $FrontendPort."
    }
    Write-Host "Press Ctrl+C to stop both servers."
    Write-Host ""

    while ($true) {
        Receive-ServerLogs -Jobs @($BackendJob, $FrontendJob)
        if ($BackendJob.State -ne "Running" -or $FrontendJob.State -ne "Running") {
            throw "One server stopped. Check the output above."
        }
        Start-Sleep -Seconds 2
    }
} finally {
    Write-Host ""
    Write-Host "Stopping backend and frontend..."
    if ($BackendJob) {
        Stop-Job $BackendJob -ErrorAction SilentlyContinue
        Remove-Job $BackendJob -Force -ErrorAction SilentlyContinue
    }
    if ($FrontendJob) {
        Stop-Job $FrontendJob -ErrorAction SilentlyContinue
        Remove-Job $FrontendJob -Force -ErrorAction SilentlyContinue
    }
}
