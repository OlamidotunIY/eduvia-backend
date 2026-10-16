[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$Module,
    [Parameter(Mandatory = $true)][ValidatePattern('^[A-Z][A-Za-z0-9]*Mapper$')][string]$MapperName,
    [Parameter(Mandatory = $true)][string]$DomainEntity,
    [Parameter(Mandatory = $true)][string]$PrismaRecord,
    [string]$IdType = '',
    [string]$FieldMappingsJson = '[]'
)

$ErrorActionPreference = 'Stop'
$contextScript = Join-Path $PSScriptRoot '..\..\eduvia-module-workflow\scripts\Get-EduviaContext.ps1'
$context = (& $contextScript -Module $Module -Artifact 'domain-mapper') | ConvertFrom-Json
$utilsScript = Join-Path $PSScriptRoot '..\..\eduvia-module-workflow\scripts\Eduvia-Utils.ps1'
. $utilsScript

$targetDir = Join-Path $context.infraDir 'persistence\mappers'
Ensure-Directory -Path $targetDir
$indexFile = Join-Path $targetDir 'index.ts'

$baseName = $MapperName -replace 'Mapper$', ''
$kebabBase = To-KebabCase -String $baseName
$kebabEntity = To-KebabCase -String $DomainEntity
if (-not $IdType) {
    $IdType = "${DomainEntity}Id"
}
$kebabId = To-KebabCase -String $IdType

$targetFile = Join-Path $targetDir "$kebabBase.mapper.ts"
if (Test-Path $targetFile) { throw "Refusing to overwrite mapper: $targetFile" }

$fieldMappings = @()
try { $fieldMappings = $FieldMappingsJson | ConvertFrom-Json } catch { $fieldMappings = @() }

$toDomainLines = ($fieldMappings | ForEach-Object {
    $dProp = $_.domain
    $pProp = $_.persistence
    "      $dProp: record.$pProp,"
}) -join "`n"

$toPersistenceLines = ($fieldMappings | ForEach-Object {
    $dProp = $_.domain
    $pProp = $_.persistence
    "      $pProp: entity.$dProp,"
}) -join "`n"

$content = @"
import { IMapper } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import { $DomainEntity } from '../../domain/model/$DomainEntity';
import { $IdType } from '../../domain/value-objects/$kebabId.vo';
import { $PrismaRecord as Prisma${DomainEntity}Record } from '@generated/prisma/client';

@Injectable()
export class $MapperName implements IMapper<$DomainEntity, Prisma${DomainEntity}Record> {
  toDomain(record: Prisma${DomainEntity}Record): $DomainEntity {
    return $DomainEntity.reconstitute({
      id: $IdType.from(record.id),
$toDomainLines
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  toPersistence(entity: $DomainEntity): Omit<Prisma${DomainEntity}Record, 'id'> {
    return {
$toPersistenceLines
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
"@

Set-Content -LiteralPath $targetFile -Value $content.Trim() -Encoding utf8NoBOM
Add-ExportToIndex -IndexPath $indexFile "export * from './$kebabBase.mapper';"
Write-Host "CREATED MAPPER: $targetFile"
