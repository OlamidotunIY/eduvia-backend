[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$Module,
    [Parameter(Mandatory = $true)][ValidatePattern('^Prisma[A-Z][A-Za-z0-9]*Repository$')][string]$AdapterName,
    [Parameter(Mandatory = $true)][string]$InterfaceName,
    [Parameter(Mandatory = $true)][string]$DomainEntity,
    [Parameter(Mandatory = $true)][string]$PrismaModel,
    [string]$IdType = '',
    [string]$MapperName = ''
)

$ErrorActionPreference = 'Stop'
$contextScript = Join-Path $PSScriptRoot '..\..\eduvia-module-workflow\scripts\Get-EduviaContext.ps1'
$context = (& $contextScript -Module $Module -Artifact 'repository-adapter') | ConvertFrom-Json
$utilsScript = Join-Path $PSScriptRoot '..\..\eduvia-module-workflow\scripts\Eduvia-Utils.ps1'
. $utilsScript

$targetDir = Join-Path $context.infraDir 'persistence\repository'
Ensure-Directory -Path $targetDir
$indexFile = Join-Path $targetDir 'index.ts'

$baseName = $DomainEntity
$kebabBase = To-KebabCase -String $baseName
$kebabEntity = To-KebabCase -String $DomainEntity
if (-not $IdType) {
    $IdType = "${DomainEntity}Id"
}
$kebabId = To-KebabCase -String $IdType
if (-not $MapperName) {
    $MapperName = "${DomainEntity}Mapper"
}
$kebabMapper = To-KebabCase -String ($MapperName -replace 'Mapper$', '')
$prismaDelegateName = To-CamelCase -String $PrismaModel

$targetFile = Join-Path $targetDir "$kebabBase.repository.ts"
if (Test-Path $targetFile) { throw "Refusing to overwrite repository adapter: $targetFile" }

$content = @"
import { PrismaBaseRepository, PrismaService } from '@modules/shared';
import { Injectable } from '@nestjs/common';
import { $DomainEntity } from '../../domain/model/$DomainEntity';
import { $IdType } from '../../domain/value-objects/$kebabId.vo';
import { $InterfaceName } from '../../domain/repository/$kebabBase.repository';
import { $PrismaModel as Prisma${DomainEntity}Record } from '@generated/prisma/client';
import { $MapperName } from '../mappers/$kebabMapper.mapper';

@Injectable()
export class $AdapterName
  extends PrismaBaseRepository<$IdType, $DomainEntity, Prisma${DomainEntity}Record>
  implements $InterfaceName
{
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly $($prismaDelegateName)Mapper: $MapperName,
  ) {
    super(prisma, $($prismaDelegateName)Mapper);
  }

  protected get delegate() {
    return this.prisma.$prismaDelegateName;
  }
}
"@

Set-Content -LiteralPath $targetFile -Value $content.Trim() -Encoding utf8NoBOM
Add-ExportToIndex -IndexPath $indexFile "export * from './$kebabBase.repository';"
Write-Host "CREATED REPOSITORY ADAPTER: $targetFile"
