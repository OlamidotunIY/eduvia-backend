[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$Module,
    [Parameter(Mandatory = $true)][ValidatePattern('^[A-Z][A-Za-z0-9]*Adapter$')][string]$AdapterName,
    [Parameter(Mandatory = $true)][string]$PortName
)

$ErrorActionPreference = 'Stop'
$contextScript = Join-Path $PSScriptRoot '..\..\eduvia-module-workflow\scripts\Get-EduviaContext.ps1'
$context = (& $contextScript -Module $Module -Artifact 'external-adapter') | ConvertFrom-Json
$utilsScript = Join-Path $PSScriptRoot '..\..\eduvia-module-workflow\scripts\Eduvia-Utils.ps1'
. $utilsScript

$targetDir = Join-Path $context.infraDir 'services'
Ensure-Directory -Path $targetDir
$indexFile = Join-Path $targetDir 'index.ts'

$baseName = $AdapterName -replace 'Adapter$', ''
$kebabBase = To-KebabCase -String $baseName
$kebabPort = (To-KebabCase -String ($PortName -replace '^I', '' -replace 'Port$', '')) + '.port'
$targetFile = Join-Path $targetDir "$kebabBase.adapter.ts"

if (Test-Path $targetFile) { throw "Refusing to overwrite external adapter: $targetFile" }

$content = @"
import { Injectable } from '@nestjs/common';
import { $PortName } from '../../domain/ports/$kebabPort';

@Injectable()
export class $AdapterName implements $PortName {
  // TODO: Integrate external SDK or infrastructure client
}
"@

Set-Content -LiteralPath $targetFile -Value $content.Trim() -Encoding utf8NoBOM
Add-ExportToIndex -IndexPath $indexFile "export * from './$kebabBase.adapter';"
Write-Host "CREATED EXTERNAL ADAPTER: $targetFile"
