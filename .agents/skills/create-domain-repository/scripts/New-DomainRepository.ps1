[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$Module,
    [Parameter(Mandatory = $true)][ValidatePattern('^I[A-Z][A-Za-z0-9]*Repository$')][string]$InterfaceName,
    [Parameter(Mandatory = $true)][string]$EntityName,
    [string]$IdType = '',
    [string]$MethodsJson = '[]'
)

$ErrorActionPreference = 'Stop'
$contextScript = Join-Path $PSScriptRoot '..\..\eduvia-module-workflow\scripts\Get-EduviaContext.ps1'
$context = (& $contextScript -Module $Module -Artifact 'domain-repository') | ConvertFrom-Json
$utilsScript = Join-Path $PSScriptRoot '..\..\eduvia-module-workflow\scripts\Eduvia-Utils.ps1'
. $utilsScript

$targetDir = Join-Path $context.domainDir 'repository'
Ensure-Directory -Path $targetDir
$indexFile = Join-Path $targetDir 'index.ts'

if (-not $IdType) {
    $IdType = "${EntityName}Id"
}
$kebabEntity = To-KebabCase -String $EntityName
$kebabId = To-KebabCase -String $IdType
$targetFile = Join-Path $targetDir "$kebabEntity.repository.ts"

if (Test-Path $targetFile) { throw "Refusing to overwrite domain repository: $targetFile" }

$methods = @()
try { $methods = $MethodsJson | ConvertFrom-Json } catch { $methods = @() }

$methodSigs = ($methods | ForEach-Object {
    "  abstract $($_.name)($($_.params)): Promise<$($_.returnType)>;"
}) -join "`n"

$content = @"
import { BaseRepository } from '@modules/shared';
import { $EntityName } from '../model/$EntityName';
import { $IdType } from '../value-objects/$kebabId.vo';

export abstract class $InterfaceName extends BaseRepository<$EntityName, $IdType> {
$methodSigs
}
"@

Set-Content -LiteralPath $targetFile -Value $content.Trim() -Encoding utf8NoBOM
Add-ExportToIndex -IndexPath $indexFile "export * from './$kebabEntity.repository';"
Write-Host "CREATED DOMAIN REPOSITORY PORT: $targetFile"
