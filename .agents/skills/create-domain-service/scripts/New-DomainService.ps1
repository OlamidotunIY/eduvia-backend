[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$Module,
    [Parameter(Mandatory = $true)][ValidatePattern('^[A-Z][A-Za-z0-9]*DomainService$')][string]$ServiceName,
    [string]$MethodsJson = '[]'
)

$ErrorActionPreference = 'Stop'
$contextScript = Join-Path $PSScriptRoot '..\..\eduvia-module-workflow\scripts\Get-EduviaContext.ps1'
$context = (& $contextScript -Module $Module -Artifact 'domain-service') | ConvertFrom-Json
$utilsScript = Join-Path $PSScriptRoot '..\..\eduvia-module-workflow\scripts\Eduvia-Utils.ps1'
. $utilsScript

$targetDir = Join-Path $context.domainDir 'services'
Ensure-Directory -Path $targetDir
$indexFile = Join-Path $targetDir 'index.ts'

$baseName = $ServiceName -replace 'DomainService$', ''
$kebabName = (To-KebabCase -String $baseName) + '.domain-service'
$targetFile = Join-Path $targetDir "$kebabName.ts"

if (Test-Path $targetFile) { throw "Refusing to overwrite domain service: $targetFile" }

$methods = @()
try { $methods = $MethodsJson | ConvertFrom-Json } catch { $methods = @() }

$methodImpls = ($methods | ForEach-Object {
    @"
  public $($_.name)($($_.params)): $($_.returnType) {
    // Pure domain logic calculation
    throw new Error('Not implemented');
  }
"@
}) -join "`n`n"

$content = @"
export class $ServiceName {
$methodImpls
}
"@

Set-Content -LiteralPath $targetFile -Value $content.Trim() -Encoding utf8NoBOM
Add-ExportToIndex -IndexPath $indexFile "export * from './$kebabName';"
Write-Host "CREATED DOMAIN SERVICE: $targetFile"
