[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$Module,
    [Parameter(Mandatory = $true)][ValidatePattern('^[A-Z][A-Za-z0-9]*Event$')][string]$EventName,
    [string]$AggregateIdType = 'string',
    [string]$PayloadFieldsJson = '[]',
    [string]$TargetQueue = ''
)

$ErrorActionPreference = 'Stop'
$contextScript = Join-Path $PSScriptRoot '..\..\eduvia-module-workflow\scripts\Get-EduviaContext.ps1'
$context = (& $contextScript -Module $Module -Artifact 'domain-event') | ConvertFrom-Json
$utilsScript = Join-Path $PSScriptRoot '..\..\eduvia-module-workflow\scripts\Eduvia-Utils.ps1'
. $utilsScript

$targetDir = Join-Path $context.domainDir 'events'
Ensure-Directory -Path $targetDir
$indexFile = Join-Path $targetDir 'index.ts'

$baseName = $EventName -replace 'Event$', ''
$kebabName = (To-KebabCase -String $baseName) + '-event'
$targetFile = Join-Path $targetDir "$kebabName.ts"

if (Test-Path $targetFile) { throw "Refusing to overwrite domain event: $targetFile" }

$payloadFields = @()
try { $payloadFields = $PayloadFieldsJson | ConvertFrom-Json } catch { $payloadFields = @() }

$ctorParams = ($payloadFields | ForEach-Object { "      public readonly $($_.name): $($_.type)," }) -join "`n"

$content = @"
import { BaseDomainEvent } from '@modules/shared';

class $EventName extends BaseDomainEvent<$EventName.Payload> {
  constructor(
    aggregateId: $AggregateIdType,
    payload: $EventName.Payload,
    correlationId: string,
  ) {
    super({
      aggregateId: String(aggregateId),
      eventName: $EventName.name,
      payload,
      correlationId,
    });
  }
}

namespace $EventName {
  export class Payload {
    constructor(
$ctorParams
    ) {}
  }
}

export { $EventName };
"@

Set-Content -LiteralPath $targetFile -Value $content.Trim() -Encoding utf8NoBOM
Add-ExportToIndex -IndexPath $indexFile "export * from './$kebabName';"
Write-Host "CREATED DOMAIN EVENT: $targetFile"

# If TargetQueue was supplied, register in outbox-event-routes.ts
if ($TargetQueue) {
    $outboxRoutesFile = Join-Path $context.sharedDir 'infrastructure\outbox\outbox-event-routes.ts'
    if (Test-Path $outboxRoutesFile) {
        $routesContent = Get-Content -LiteralPath $outboxRoutesFile -Raw -Encoding utf8
        if ($routesContent -notmatch [regex]::Escape("['$EventName',")) {
            $replacement = "  ['$EventName', '$TargetQueue'],`n]);"
            $newRoutes = $routesContent -replace '\s*\]\s*\);\s*$', "`n$replacement"
            Set-Content -LiteralPath $outboxRoutesFile -Value $newRoutes -Encoding utf8NoBOM
            Write-Host "REGISTERED OUTBOX ROUTE: $EventName -> $TargetQueue in outbox-event-routes.ts"
        }
    }
}
