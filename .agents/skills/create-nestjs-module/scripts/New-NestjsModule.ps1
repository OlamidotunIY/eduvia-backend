[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$Module
)

$ErrorActionPreference = 'Stop'
$contextScript = Join-Path $PSScriptRoot '..\..\eduvia-module-workflow\scripts\Get-EduviaContext.ps1'
$context = (& $contextScript -Module $Module -Artifact 'nestjs-module') | ConvertFrom-Json
$utilsScript = Join-Path $PSScriptRoot '..\..\eduvia-module-workflow\scripts\Eduvia-Utils.ps1'
. $utilsScript

$moduleName = $context.moduleName
$pascalName = $context.pascalName
$moduleDir = $context.moduleDir
$appModuleFile = Join-Path $context.repoRoot 'src\app.module.ts'

# Verify app.module.ts import
if (Test-Path $appModuleFile) {
    $appContent = Get-Content -LiteralPath $appModuleFile -Raw -Encoding utf8
    $importStmt = "import { ${pascalName}Module } from './modules/$moduleName/$moduleName.module';"
    if ($appContent -notmatch [regex]::Escape("${pascalName}Module")) {
        # Add import
        $appContent = "$importStmt`n$appContent"
        # Add to imports array
        $appContent = $appContent -replace 'imports:\s*\[', "imports: [`n    ${pascalName}Module,"
        Set-Content -LiteralPath $appModuleFile -Value $appContent -Encoding utf8NoBOM
        Write-Host "WIRED ${pascalName}Module into src/app.module.ts"
    } else {
        Write-Host "${pascalName}Module is already imported in src/app.module.ts"
    }
}

# Run sync-module-aliases
$syncScript = Join-Path $context.repoRoot 'scripts\sync-module-aliases.cjs'
if (Test-Path $syncScript) {
    node "$syncScript"
}

Write-Host "SUCCESS: NestJS Module composition verified for $moduleName."
