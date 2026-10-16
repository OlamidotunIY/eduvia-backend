[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$Module,
    [Parameter(Mandatory = $true)][ValidatePattern('^[A-Z][A-Za-z0-9]*QueryAdapter$')][string]$AdapterName,
    [Parameter(Mandatory = $true)][string]$PortName,
    [Parameter(Mandatory = $true)][string]$DtoName,
    [Parameter(Mandatory = $true)][string]$RepositoryInterface
)

$ErrorActionPreference = 'Stop'
$contextScript = Join-Path $PSScriptRoot '..\..\eduvia-module-workflow\scripts\Get-EduviaContext.ps1'
$context = (& $contextScript -Module $Module -Artifact 'query-port-adapter') | ConvertFrom-Json
$utilsScript = Join-Path $PSScriptRoot '..\..\eduvia-module-workflow\scripts\Eduvia-Utils.ps1'
. $utilsScript

$targetDir = Join-Path $context.infraDir 'services'
Ensure-Directory -Path $targetDir
$indexFile = Join-Path $targetDir 'index.ts'

$baseName = $AdapterName -replace 'Adapter$', ''
$kebabBase = To-KebabCase -String $baseName
$targetFile = Join-Path $targetDir "$kebabBase.adapter.ts"

if (Test-Path $targetFile) { throw "Refusing to overwrite query adapter: $targetFile" }

$repoVar = To-CamelCase -String ($RepositoryInterface -replace '^I', '')

$content = @"
import { Injectable } from '@nestjs/common';
import { $PortName, $DtoName } from '@modules/shared';
import { $RepositoryInterface } from '../../domain/repository';

@Injectable()
export class $AdapterName implements $PortName {
  constructor(
    private readonly $repoVar: $RepositoryInterface,
  ) {}

  // TODO: Implement read methods returning $DtoName
}
"@

Set-Content -LiteralPath $targetFile -Value $content.Trim() -Encoding utf8NoBOM
Add-ExportToIndex -IndexPath $indexFile "export * from './$kebabBase.adapter';"
Write-Host "CREATED QUERY PORT ADAPTER: $targetFile"
