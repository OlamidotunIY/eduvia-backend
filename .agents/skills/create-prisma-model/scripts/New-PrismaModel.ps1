[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$Module,
    [Parameter(Mandatory = $true)][ValidatePattern('^[A-Z][A-Za-z0-9]*$')][string]$ModelName,
    [string]$TableName = '',
    [string]$FieldsJson = '[]',
    [switch]$SkipGenerate
)

$ErrorActionPreference = 'Stop'
$contextScript = Join-Path $PSScriptRoot '..\..\eduvia-module-workflow\scripts\Get-EduviaContext.ps1'
$context = (& $contextScript -Module $Module -Artifact 'prisma-model') | ConvertFrom-Json
$utilsScript = Join-Path $PSScriptRoot '..\..\eduvia-module-workflow\scripts\Eduvia-Utils.ps1'
. $utilsScript

if (-not $TableName) {
    $TableName = (To-KebabCase -String $ModelName) -replace '-', '_'
}

$prismaFile = Join-Path $context.prismaSchemaDir "$($context.moduleName).prisma"
Ensure-Directory -Path $context.prismaSchemaDir

$fields = @()
try { $fields = $FieldsJson | ConvertFrom-Json } catch { $fields = @() }

$fieldLines = ($fields | ForEach-Object {
    $fName = $_.name
    $fType = $_.type
    $fAttr = if ($_.attributes) { " " + $_.attributes } else { "" }
    "  $fName $fType$fAttr"
}) -join "`n"

$modelBlock = @"

model $ModelName {
  id        String   @id @default(uuid()) @map("_id")
$fieldLines
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("$TableName")
}
"@

if (Test-Path $prismaFile) {
    $existing = Get-Content -LiteralPath $prismaFile -Raw -Encoding utf8
    if ($existing -match "\bmodel\s+$ModelName\b") {
        throw "Model $ModelName already exists in $prismaFile"
    }
    Add-Content -LiteralPath $prismaFile -Value $modelBlock -Encoding utf8NoBOM
} else {
    Set-Content -LiteralPath $prismaFile -Value $modelBlock.TrimStart() -Encoding utf8NoBOM
}

Write-Host "UPDATED PRISMA SCHEMA: $prismaFile with model $ModelName"

if (-not $SkipGenerate) {
    Write-Host "Running prisma generate..."
    pnpm prisma:generate
}
