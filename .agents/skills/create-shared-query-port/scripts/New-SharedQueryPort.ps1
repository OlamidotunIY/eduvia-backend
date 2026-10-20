[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$Module,
    [Parameter(Mandatory = $true)][ValidatePattern('^I[A-Z][A-Za-z0-9]*QueryPort$')][string]$PortName,
    [string]$DtoName = '',
    [string]$DtoFieldsJson = '[]',
    [string]$MethodsJson = '[]'
)

$ErrorActionPreference = 'Stop'
$contextScript = Join-Path $PSScriptRoot '..\..\eduvia-module-workflow\scripts\Get-EduviaContext.ps1'
$context = (& $contextScript -Module $Module -Artifact 'shared-query-port') | ConvertFrom-Json
$utilsScript = Join-Path $PSScriptRoot '..\..\eduvia-module-workflow\scripts\Eduvia-Utils.ps1'
. $utilsScript

$baseName = $PortName -replace '^I', '' -replace 'QueryPort$', ''
$kebabBase = To-KebabCase -String $baseName
if (-not $DtoName) {
    $DtoName = "${baseName}DTO"
}

$targetDir = $context.sharedPortDir
Ensure-Directory -Path $targetDir
$indexFile = Join-Path $targetDir 'index.ts'
$targetFile = Join-Path $targetDir "$kebabBase-query.port.ts"

if (Test-Path $targetFile) { throw "Refusing to overwrite shared query port: $targetFile" }

# Guard: Validate that no write methods are defined!
$writeKeywords = @('save', 'create', 'update', 'delete', 'set', 'mutate', 'insert', 'remove', 'drop', 'patch', 'post', 'put')

$methods = @()
try { $methods = $MethodsJson | ConvertFrom-Json } catch { $methods = @() }

foreach ($m in $methods) {
    $mName = $m.name.ToLower()
    foreach ($w in $writeKeywords) {
        if ($mName.StartsWith($w)) {
            throw "VIOLATION: Shared query ports MUST NOT contain write operations! Method '$($m.name)' violates the architecture rule."
        }
    }
}

$dtoFields = @()
try { $dtoFields = $DtoFieldsJson | ConvertFrom-Json } catch { $dtoFields = @() }

$dtoDecls = ($dtoFields | ForEach-Object { "  $($_.name): $($_.type);" }) -join "`n"

$methodSigs = ($methods | ForEach-Object {
    "  abstract $($_.name)($($_.params)): Promise<$($_.returnType)>;"
}) -join "`n"

$content = @"
export interface $DtoName {
$dtoDecls
}

export abstract class $PortName {
$methodSigs
}
"@

Set-Content -LiteralPath $targetFile -Value $content.Trim() -Encoding utf8NoBOM
Add-ExportToIndex -IndexPath $indexFile "export * from './$kebabBase-query.port';"
Write-Host "CREATED SHARED QUERY PORT: $targetFile"
