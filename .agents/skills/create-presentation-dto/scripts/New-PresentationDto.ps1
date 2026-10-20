[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$Module,
    [Parameter(Mandatory = $true)][ValidatePattern('^[A-Z][A-Za-z0-9]*(DTO|Dto)$')][string]$DtoName,
    [string]$FieldsJson = '[]'
)

$ErrorActionPreference = 'Stop'
$contextScript = Join-Path $PSScriptRoot '..\..\eduvia-module-workflow\scripts\Get-EduviaContext.ps1'
$context = (& $contextScript -Module $Module -Artifact 'presentation-dto') | ConvertFrom-Json
$utilsScript = Join-Path $PSScriptRoot '..\..\eduvia-module-workflow\scripts\Eduvia-Utils.ps1'
. $utilsScript

$targetDir = Join-Path $context.presDir 'dto'
Ensure-Directory -Path $targetDir
$indexFile = Join-Path $targetDir 'index.ts'

$baseName = $DtoName -replace '(DTO|Dto)$', ''
$kebabBase = To-KebabCase -String $baseName
$targetFile = Join-Path $targetDir "$kebabBase.dto.ts"

if (Test-Path $targetFile) { throw "Refusing to overwrite DTO: $targetFile" }

$fields = @()
try { $fields = $FieldsJson | ConvertFrom-Json } catch { $fields = @() }

$fieldLines = ($fields | ForEach-Object {
    $opt = if ($_.isOptional -eq $true) { '?' } else { '' }
    "  $($_.name)$opt: $($_.type);"
}) -join "`n"

$content = @"
export class $DtoName {
$fieldLines
}
"@

Set-Content -LiteralPath $targetFile -Value $content.Trim() -Encoding utf8NoBOM
Add-ExportToIndex -IndexPath $indexFile "export * from './$kebabBase.dto';"
Write-Host "CREATED PRESENTATION DTO: $targetFile"
