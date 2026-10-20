[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$Module,
    [Parameter(Mandatory = $true)][ValidatePattern('^[A-Z][A-Za-z0-9]*Controller$')][string]$ControllerName,
    [string]$RoutePrefix = '',
    [string]$ServiceName = ''
)

$ErrorActionPreference = 'Stop'
$contextScript = Join-Path $PSScriptRoot '..\..\eduvia-module-workflow\scripts\Get-EduviaContext.ps1'
$context = (& $contextScript -Module $Module -Artifact 'controller') | ConvertFrom-Json
$utilsScript = Join-Path $PSScriptRoot '..\..\eduvia-module-workflow\scripts\Eduvia-Utils.ps1'
. $utilsScript

$baseName = $ControllerName -replace 'Controller$', ''
$kebabBase = To-KebabCase -String $baseName
if (-not $RoutePrefix) {
    $RoutePrefix = $context.moduleName
}
if (-not $ServiceName) {
    $ServiceName = "${baseName}Service"
}

# 1. Generate Presentation Service if not present
$serviceDir = Join-Path $context.presDir 'services'
Ensure-Directory -Path $serviceDir
$serviceIndex = Join-Path $serviceDir 'index.ts'
$serviceFile = Join-Path $serviceDir "$kebabBase.service.ts"

if (-not (Test-Path $serviceFile)) {
    $serviceContent = @"
import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

@Injectable()
export class $ServiceName {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  // Thin orchestrator methods that dispatch to commandBus or queryBus
}
"@
    Set-Content -LiteralPath $serviceFile -Value $serviceContent.Trim() -Encoding utf8NoBOM
    Add-ExportToIndex -IndexPath $serviceIndex "export * from './$kebabBase.service';"
    Write-Host "CREATED PRESENTATION SERVICE: $serviceFile"
}

# 2. Generate Controller
$ctrlDir = Join-Path $context.presDir 'controllers'
Ensure-Directory -Path $ctrlDir
$ctrlIndex = Join-Path $ctrlDir 'index.ts'
$ctrlFile = Join-Path $ctrlDir "$kebabBase.controller.ts"

if (Test-Path $ctrlFile) { throw "Refusing to overwrite controller: $ctrlFile" }

$serviceVar = To-CamelCase -String $ServiceName

$ctrlContent = @"
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  AuthGuard,
  CorrelationId,
  CurrentUser,
  type CurrentUserPayload,
} from '@modules/shared';
import { $ServiceName } from '../services/$kebabBase.service';

@Controller('$RoutePrefix')
export class $ControllerName {
  constructor(private readonly $serviceVar: $ServiceName) {}

  @UseGuards(AuthGuard)
  @Get(':id')
  async getById(
    @Param('id') id: string,
    @CurrentUser() currentUser: CurrentUserPayload,
  ) {
    // Dispatch query via presentation service
    return { id };
  }
}
"@

Set-Content -LiteralPath $ctrlFile -Value $ctrlContent.Trim() -Encoding utf8NoBOM
Add-ExportToIndex -IndexPath $ctrlIndex "export * from './$kebabBase.controller';"
Write-Host "CREATED CONTROLLER: $ctrlFile"
