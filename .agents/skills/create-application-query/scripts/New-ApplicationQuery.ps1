[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$Module,
    [Parameter(Mandatory = $true)][ValidatePattern('^[A-Z][A-Za-z0-9]*Query$')][string]$QueryName,
    [Parameter(Mandatory = $true)][string]$RepositoryInterface,
    [string]$DtoName = '',
    [string]$PayloadFieldsJson = '[]',
    [string]$DtoFieldsJson = '[]'
)

$ErrorActionPreference = 'Stop'
$contextScript = Join-Path $PSScriptRoot '..\..\eduvia-module-workflow\scripts\Get-EduviaContext.ps1'
$context = (& $contextScript -Module $Module -Artifact 'application-query') | ConvertFrom-Json
$utilsScript = Join-Path $PSScriptRoot '..\..\eduvia-module-workflow\scripts\Eduvia-Utils.ps1'
. $utilsScript

$baseName = $QueryName -replace 'Query$', ''
$kebabName = To-KebabCase -String $baseName
$handlerName = "${baseName}Handler"
$payloadName = "${baseName}Payload"
if (-not $DtoName) {
    $DtoName = "${baseName}DTO"
}

$queryDir = Join-Path $context.appDir "queries\$kebabName"
Ensure-Directory -Path $queryDir

$queryFile = Join-Path $queryDir "$kebabName.query.ts"
$payloadFile = Join-Path $queryDir "$kebabName.payload.ts"
$handlerFile = Join-Path $queryDir "$kebabName.handler.ts"
$localIndexFile = Join-Path $queryDir 'index.ts'
$queriesIndexFile = Join-Path $context.appDir 'queries\index.ts'

if (Test-Path $queryFile) { throw "Refusing to overwrite query: $queryFile" }

# Parse payload & DTO fields
$payloadFields = @()
try { $payloadFields = $PayloadFieldsJson | ConvertFrom-Json } catch { $payloadFields = @() }
$dtoFields = @()
try { $dtoFields = $DtoFieldsJson | ConvertFrom-Json } catch { $dtoFields = @() }

$payloadDecls = ($payloadFields | ForEach-Object { "  $($_.name): $($_.type);" }) -join "`n"
$dtoDecls = ($dtoFields | ForEach-Object { "  $($_.name): $($_.type);" }) -join "`n"

# 1. Payload & DTO file
$payloadContent = @"
export interface $payloadName {
$payloadDecls
}

export interface $DtoName {
$dtoDecls
}
"@
Set-Content -LiteralPath $payloadFile -Value $payloadContent.Trim() -Encoding utf8NoBOM

# 2. Query file
$queryContent = @"
import { Query } from '@nestjs/cqrs';
import { $payloadName, $DtoName } from './$kebabName.payload';

export class $QueryName extends Query<$DtoName> {
  constructor(public readonly payload: $payloadName) {
    super();
  }
}
"@
Set-Content -LiteralPath $queryFile -Value $queryContent.Trim() -Encoding utf8NoBOM

# 3. Handler file
$repoVar = To-CamelCase -String ($RepositoryInterface -replace '^I', '')
$handlerContent = @"
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { $QueryName } from './$kebabName.query';
import { $DtoName } from './$kebabName.payload';
import { $RepositoryInterface } from '../../../domain/repository';

@QueryHandler($QueryName)
export class $handlerName implements IQueryHandler<$QueryName, $DtoName> {
  constructor(
    private readonly ${repoVar}: $RepositoryInterface,
  ) {}

  async execute(query: $QueryName): Promise<$DtoName> {
    const { payload } = query;

    // TODO: Perform read operation using repository port
    throw new Error('Not implemented');
  }
}
"@
Set-Content -LiteralPath $handlerFile -Value $handlerContent.Trim() -Encoding utf8NoBOM

# 4. Barrels
Add-ExportToIndex -IndexPath $localIndexFile "export * from './$kebabName.query';"
Add-ExportToIndex -IndexPath $localIndexFile "export * from './$kebabName.handler';"
Add-ExportToIndex -IndexPath $localIndexFile "export * from './$kebabName.payload';"

Add-ExportToIndex -IndexPath $queriesIndexFile "export * from './$kebabName';"

Write-Host "CREATED QUERY SLICE: $queryDir"
