[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$Module,
    [Parameter(Mandatory = $true)][ValidatePattern('^[A-Z][A-Za-z0-9]*Scheduler$')][string]$SchedulerName,
    [string]$CronExpr = 'EVERY_MINUTE'
)

$ErrorActionPreference = 'Stop'
$contextScript = Join-Path $PSScriptRoot '..\..\eduvia-module-workflow\scripts\Get-EduviaContext.ps1'
$context = (& $contextScript -Module $Module -Artifact 'scheduler') | ConvertFrom-Json
$utilsScript = Join-Path $PSScriptRoot '..\..\eduvia-module-workflow\scripts\Eduvia-Utils.ps1'
. $utilsScript

$messagingDir = Join-Path $context.infraDir 'messaging'
$targetDir = Join-Path $messagingDir 'scheduler'
Ensure-Directory -Path $targetDir
$indexFile = Join-Path $targetDir 'index.ts'

$baseName = $SchedulerName -replace 'Scheduler$', ''
$kebabBase = To-KebabCase -String $baseName
$targetFile = Join-Path $targetDir "$kebabBase.scheduler.ts"

if (Test-Path $targetFile) { throw "Refusing to overwrite scheduler: $targetFile" }

$content = @"
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CommandBus } from '@nestjs/cqrs';

@Injectable()
export class $SchedulerName {
  private readonly logger = new Logger($SchedulerName.name);

  constructor(private readonly commandBus: CommandBus) {}

  @Cron(CronExpression.$CronExpr)
  async handleCron(): Promise<void> {
    this.logger.debug('Executing scheduled task: $SchedulerName');
    // TODO: Dispatch command for background sweep/reconciliation
  }
}
"@

Set-Content -LiteralPath $targetFile -Value $content.Trim() -Encoding utf8NoBOM
Add-ExportToIndex -IndexPath $indexFile "export * from './$kebabBase.scheduler';"
$messagingIndex = Join-Path $messagingDir 'index.ts'
Add-ExportToIndex -IndexPath $messagingIndex "export * from './scheduler';"
Write-Host "CREATED SCHEDULER: $targetFile"
