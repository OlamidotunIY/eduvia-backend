[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$Module,
    [Parameter(Mandatory = $true)][ValidatePattern('^[A-Z][A-Za-z0-9]*Error$')][string]$ErrorName,
    [ValidateSet('ConflictError', 'NotFoundError', 'BadRequestError', 'BusinessRuleViolationError', 'ForbiddenError', 'DomainError')]
    [string]$BaseError = 'ConflictError',
    [string]$DefaultMessage = ''
)

$ErrorActionPreference = 'Stop'
$contextScript = Join-Path $PSScriptRoot '..\..\eduvia-module-workflow\scripts\Get-EduviaContext.ps1'
$context = (& $contextScript -Module $Module -Artifact 'domain-error') | ConvertFrom-Json
$utilsScript = Join-Path $PSScriptRoot '..\..\eduvia-module-workflow\scripts\Eduvia-Utils.ps1'
. $utilsScript

$targetDir = Join-Path $context.domainDir 'errors'
Ensure-Directory -Path $targetDir
$indexFile = Join-Path $targetDir 'index.ts'

$baseName = $ErrorName -replace 'Error$', ''
$kebabName = (To-KebabCase -String $baseName) + '.error'
$targetFile = Join-Path $targetDir "$kebabName.ts"

if (Test-Path $targetFile) { throw "Refusing to overwrite domain error: $targetFile" }

if (-not $DefaultMessage) {
    $DefaultMessage = "$baseName error occurred"
}

$content = @"
import { $BaseError } from '@modules/shared';

class $ErrorName extends $BaseError {
  constructor(message = '$DefaultMessage', details?: unknown) {
    super(message, details);
  }
}

export { $ErrorName };
"@

Set-Content -LiteralPath $targetFile -Value $content.Trim() -Encoding utf8NoBOM
Add-ExportToIndex -IndexPath $indexFile "export * from './$kebabName';"
Write-Host "CREATED DOMAIN ERROR: $targetFile"
