[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$Module,
    [string]$Artifact = ''
)

$ErrorActionPreference = 'Stop'

# Walk up from script directory to find repository root (contains package.json)
$current = $PSScriptRoot
while ($current -and -not (Test-Path (Join-Path $current 'package.json'))) {
    $parent = Split-Path $current -Parent
    if ($parent -eq $current) { break }
    $current = $parent
}
$repoRoot = $current

# Module naming: module should be kebab-case
$moduleName = $Module.ToLower()
$parts = $moduleName -split '-'
$pascalParts = $parts | ForEach-Object { 
    if ($_.Length -gt 0) {
        $_.Substring(0,1).ToUpper() + $_.Substring(1)
    }
}
$pascalName = $pascalParts -join ''

$moduleDir = Join-Path $repoRoot "src\modules\$moduleName"
$sharedDir = Join-Path $repoRoot "src\modules\shared"
$prismaDir = Join-Path $repoRoot "prisma\schema"
$docsDir = Join-Path $repoRoot "docs"

$result = [PSCustomObject]@{
    repoRoot        = $repoRoot
    moduleName      = $moduleName
    pascalName      = $pascalName
    moduleDir       = $moduleDir
    sourceRoot      = $moduleDir
    domainDir       = Join-Path $moduleDir 'domain'
    appDir          = Join-Path $moduleDir 'application'
    infraDir        = Join-Path $moduleDir 'infrastructure'
    presDir         = Join-Path $moduleDir 'presentation'
    sharedDir       = $sharedDir
    sharedPortDir   = Join-Path $sharedDir 'application\port'
    prismaSchemaDir = $prismaDir
    docsDir         = $docsDir
    alias           = "@modules/$moduleName"
    artifact        = $Artifact
}

$result | ConvertTo-Json -Compress
