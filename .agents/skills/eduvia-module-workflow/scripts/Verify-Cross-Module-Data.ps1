[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$Module,
    [string[]]$RequiredPorts = @(),
    [string[]]$ConsumedEvents = @()
)

$ErrorActionPreference = 'Stop'
$contextScript = Join-Path $PSScriptRoot 'Get-EduviaContext.ps1'
$context = (& $contextScript -Module $Module -Artifact 'cross-module-check') | ConvertFrom-Json
$utilsScript = Join-Path $PSScriptRoot 'Eduvia-Utils.ps1'
. $utilsScript

Write-Host "=========================================="
Write-Host "Verifying Cross-Module Data Contracts for: $Module"
Write-Host "==========================================`n"

$failures = [System.Collections.Generic.List[string]]::new()

# 1. Verify Required Shared Query Ports
$sharedPortDir = $context.sharedPortDir
foreach ($portName in $RequiredPorts) {
    Write-Host "Checking Shared Query Port: $portName..."
    $portFiles = Get-ChildItem -Path $sharedPortDir -Filter "*.port.ts"
    $found = $false
    foreach ($pf in $portFiles) {
        $content = Get-Content -LiteralPath $pf.FullName -Raw -Encoding utf8
        if ($content -match [regex]::Escape($portName)) {
            $found = $true
            Write-Host "  [OK] Found $portName in $(Split-Path $pf.FullName -Leaf)" -ForegroundColor Green

            # Verify that providing module implements and exports it
            $modules = Get-ChildItem -Path (Join-Path $context.repoRoot 'src\modules') -Directory
            $adapterFound = $false
            foreach ($m in $modules) {
                if ($m.Name -eq 'shared' -or $m.Name -eq $Module) { continue }
                $modFile = Join-Path $m.FullName "$($m.Name).module.ts"
                if (Test-Path $modFile) {
                    $modText = Get-Content -LiteralPath $modFile -Raw -Encoding utf8
                    if ($modText -match [regex]::Escape($portName) -and $modText -match 'exports:') {
                        $adapterFound = $true
                        Write-Host "  [OK] Implemented and exported by module: $($m.Name)" -ForegroundColor Green
                        break
                    }
                }
            }
            if (-not $adapterFound) {
                $failures.Add("Shared query port '$portName' is defined, but no active module exports a provider for it!")
            }
            break
        }
    }
    if (-not $found) {
        $failures.Add("Shared query port '$portName' was not found in $sharedPortDir.")
    }
}

# 2. Verify Consumed Events
$outboxRoutesFile = Join-Path $context.sharedDir 'infrastructure\outbox\outbox-event-routes.ts'
if (Test-Path $outboxRoutesFile) {
    $routesText = Get-Content -LiteralPath $outboxRoutesFile -Raw -Encoding utf8
    foreach ($eventName in $ConsumedEvents) {
        Write-Host "Checking Inbound Event Route: $eventName..."
        if ($routesText -match [regex]::Escape("'$eventName'")) {
            Write-Host "  [OK] $eventName is mapped in OUTBOX_EVENT_ROUTES." -ForegroundColor Green
        } else {
            $failures.Add("Event '$eventName' is not registered in OUTBOX_EVENT_ROUTES (outbox-event-routes.ts). Outbox poller will not route it!")
        }
    }
}

Write-Host "`nSummary:"
if ($failures.Count -gt 0) {
    Write-Host "`n[FAIL] Cross-Module Data Verification Failed ($($failures.Count) issues):" -ForegroundColor Red
    foreach ($f in $failures) {
        Write-Host "  - $f" -ForegroundColor Red
    }
    exit 1
} else {
    Write-Host "[PASS] All cross-module contracts and data dependencies are verified!" -ForegroundColor Green
}
