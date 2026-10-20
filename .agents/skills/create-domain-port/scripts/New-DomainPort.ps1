[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$Module,
    [Parameter(Mandatory = $true)][ValidatePattern('^I[A-Z][A-Za-z0-9]*Port$')][string]$PortName,
    [string]$MethodsJson = '[]'
)

$ErrorActionPreference = 'Stop'
$contextScript = Join-Path $PSScriptRoot '..\..\eduvia-module-workflow\scripts\Get-EduviaContext.ps1'
$context = (& $contextScript -Module $Module -Artifact 'domain-port') | ConvertFrom-Json
$utilsScript = Join-Path $PSScriptRoot '..\..\eduvia-module-workflow\scripts\Eduvia-Utils.ps1'
. $utilsScript

$targetDir = Join-Path $context.domainDir 'ports'
Ensure-Directory -Path $targetDir
$indexFile = Join-Path $targetDir 'index.ts'

$baseName = $PortName -replace '^I', '' -replace 'Port$', ''
$kebabName = (To-KebabCase -String $baseName) + '.port'
$targetFile = Join-Path $targetDir "$kebabName.ts"

if (Test-Path $targetFile) { throw "Refusing to overwrite domain port: $targetFile" }

$methods = @()
try { $methods = $MethodsJson | ConvertFrom-Json } catch { $methods = @() }

$methodSigs = ($methods | ForEach-Object {
    "  abstract $($_.name)($($_.params)): Promise<$($_.returnType)>;"
}) -join "`n"

$content = @"
export abstract class $PortName {
$methodSigs
}
"@

Set-Content -LiteralPath $targetFile -Value $content.Trim() -Encoding utf8NoBOM
Add-ExportToIndex -IndexPath $indexFile "export * from './$kebabName';"
Write-Host "CREATED DOMAIN PORT: $targetFile"
