[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$Module,
    [Parameter(Mandatory = $true)][ValidatePattern('^[A-Z][A-Za-z0-9]*Processor$')][string]$ProcessorName,
    [string]$QueueName = '',
    [string]$HandledEventsJson = '[]'
)

$ErrorActionPreference = 'Stop'
$contextScript = Join-Path $PSScriptRoot '..\..\eduvia-module-workflow\scripts\Get-EduviaContext.ps1'
$context = (& $contextScript -Module $Module -Artifact 'bullmq-listener') | ConvertFrom-Json
$utilsScript = Join-Path $PSScriptRoot '..\..\eduvia-module-workflow\scripts\Eduvia-Utils.ps1'
. $utilsScript

if (-not $QueueName) {
    $QueueName = "$($context.moduleName)-events"
}

$targetDir = Join-Path $context.infraDir 'messaging\listeners'
Ensure-Directory -Path $targetDir
$indexFile = Join-Path $targetDir 'index.ts'

$baseName = $ProcessorName -replace 'Processor$', ''
$kebabBase = To-KebabCase -String $baseName
$targetFile = Join-Path $targetDir "$kebabBase.processor.ts"

if (Test-Path $targetFile) { throw "Refusing to overwrite event processor: $targetFile" }

$handledEvents = @()
try { $handledEvents = $HandledEventsJson | ConvertFrom-Json } catch { $handledEvents = @() }

$cases = ($handledEvents | ForEach-Object {
    $eName = $_.eventName
    $cmdName = $_.commandName
    @"
    if (job.name === '$eName') {
      const payload = job.data.payload;
      // TODO: Map event payload to $cmdName and execute
      // await this.commandBus.execute(new $cmdName({ ... }));
      return;
    }
"@
}) -join "`n`n"

$content = @"
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CommandBus } from '@nestjs/cqrs';

@Processor('$QueueName')
export class $ProcessorName extends WorkerHost {
  constructor(private readonly commandBus: CommandBus) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<void> {
$cases
  }
}
"@

Set-Content -LiteralPath $targetFile -Value $content.Trim() -Encoding utf8NoBOM
Add-ExportToIndex -IndexPath $indexFile "export * from './$kebabBase.processor';"
Write-Host "CREATED BULLMQ LISTENER: $targetFile"
