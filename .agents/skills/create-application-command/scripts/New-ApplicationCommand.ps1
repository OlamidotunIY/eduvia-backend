[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$Module,
    [Parameter(Mandatory = $true)][ValidatePattern('^[A-Z][A-Za-z0-9]*Command$')][string]$CommandName,
    [Parameter(Mandatory = $true)][string]$RepositoryInterface,
    [string]$EntityName = '',
    [string]$PayloadFieldsJson = '[]',
    [string]$ResultFieldsJson = '[{"name":"id","type":"string"}]'
)

$ErrorActionPreference = 'Stop'
$contextScript = Join-Path $PSScriptRoot '..\..\eduvia-module-workflow\scripts\Get-EduviaContext.ps1'
$context = (& $contextScript -Module $Module -Artifact 'application-command') | ConvertFrom-Json
$utilsScript = Join-Path $PSScriptRoot '..\..\eduvia-module-workflow\scripts\Eduvia-Utils.ps1'
. $utilsScript

$baseName = $CommandName -replace 'Command$', ''
$kebabName = To-KebabCase -String $baseName
$handlerName = "${baseName}Handler"
$resultName = "${baseName}Result"
$payloadName = "${baseName}Payload"

$commandDir = Join-Path $context.appDir "commands\$kebabName"
Ensure-Directory -Path $commandDir

$commandFile = Join-Path $commandDir "$kebabName.command.ts"
$resultFile = Join-Path $commandDir "$kebabName.result.ts"
$handlerFile = Join-Path $commandDir "$kebabName.handler.ts"
$localIndexFile = Join-Path $commandDir 'index.ts'
$commandsIndexFile = Join-Path $context.appDir 'commands\index.ts'

if (Test-Path $commandFile) { throw "Refusing to overwrite command: $commandFile" }

# Parse payload & result fields
$payloadFields = @()
try { $payloadFields = $PayloadFieldsJson | ConvertFrom-Json } catch { $payloadFields = @() }
$resultFields = @()
try { $resultFields = $ResultFieldsJson | ConvertFrom-Json } catch { $resultFields = @() }

$payloadDecls = ($payloadFields | ForEach-Object { "  $($_.name): $($_.type);" }) -join "`n"
$resultDecls = ($resultFields | ForEach-Object { "  $($_.name): $($_.type);" }) -join "`n"

# 1. Result / Payload file
$resultContent = @"
export interface $payloadName {
$payloadDecls
  correlationId: string;
}

export interface $resultName {
$resultDecls
}
"@
Set-Content -LiteralPath $resultFile -Value $resultContent.Trim() -Encoding utf8NoBOM

# 2. Command file
$commandContent = @"
import { Command } from '@nestjs/cqrs';
import { $payloadName, $resultName } from './$kebabName.result';

export class $CommandName extends Command<$resultName> {
  constructor(public readonly payload: $payloadName) {
    super();
  }
}
"@
Set-Content -LiteralPath $commandFile -Value $commandContent.Trim() -Encoding utf8NoBOM

# 3. Handler file
$repoVar = To-CamelCase -String ($RepositoryInterface -replace '^I', '')
$handlerContent = @"
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { $CommandName } from './$kebabName.command';
import { $resultName } from './$kebabName.result';
import { $RepositoryInterface } from '../../../domain/repository';

@CommandHandler($CommandName)
export class $handlerName implements ICommandHandler<$CommandName, $resultName> {
  constructor(
    private readonly ${repoVar}: $RepositoryInterface,
  ) {}

  async execute(command: $CommandName): Promise<$resultName> {
    const { payload } = command;

    // TODO: Load aggregate root or create new aggregate root
    // Example:
    // const entity = $EntityName.create({ ... });
    // await this.${repoVar}.save(entity);

    return {
      id: 'placeholder-id',
    };
  }
}
"@
Set-Content -LiteralPath $handlerFile -Value $handlerContent.Trim() -Encoding utf8NoBOM

# 4. Barrels
Add-ExportToIndex -IndexPath $localIndexFile "export * from './$kebabName.command';"
Add-ExportToIndex -IndexPath $localIndexFile "export * from './$kebabName.handler';"
Add-ExportToIndex -IndexPath $localIndexFile "export * from './$kebabName.result';"

Add-ExportToIndex -IndexPath $commandsIndexFile "export * from './$kebabName';"

Write-Host "CREATED COMMAND SLICE: $commandDir"
