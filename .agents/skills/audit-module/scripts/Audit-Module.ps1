[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$Module
)

$ErrorActionPreference = 'Stop'
$contextScript = Join-Path $PSScriptRoot '..\..\eduvia-module-workflow\scripts\Get-EduviaContext.ps1'
$context = (& $contextScript -Module $Module -Artifact 'audit') | ConvertFrom-Json
$utilsScript = Join-Path $PSScriptRoot '..\..\eduvia-module-workflow\scripts\Eduvia-Utils.ps1'
. $utilsScript

$moduleDir = $context.moduleDir
$moduleName = $context.moduleName

Write-Host "=========================================="
Write-Host "Auditing Module: $moduleName"
Write-Host "Path: $moduleDir"
Write-Host "==========================================`n"

$errors = [System.Collections.Generic.List[string]]::new()
$warnings = [System.Collections.Generic.List[string]]::new()

if (-not (Test-Path $moduleDir)) {
    Write-Error "Module directory does not exist: $moduleDir"
    exit 1
}

# 1. Check 4 Layers
$allowedLayers = @('domain', 'application', 'infrastructure', 'presentation', 'test')
$subItems = Get-ChildItem -Path $moduleDir -Directory
foreach ($item in $subItems) {
    if ($item.Name -notin $allowedLayers) {
        $errors.Add("Forbidden top-level directory '$($item.Name)' found. Only 4 layers permitted: domain, application, infrastructure, presentation.")
    }
}

# 2. Check Domain Purity
$domainDir = Join-Path $moduleDir 'domain'
if (Test-Path $domainDir) {
    $domainFiles = Get-ChildItem -Path $domainDir -Recurse -Filter '*.ts'
    foreach ($file in $domainFiles) {
        $text = Get-Content -LiteralPath $file.FullName -Raw -Encoding utf8
        if ($text -match '\.\./infrastructure' -or $text -match '/infrastructure') {
            $errors.Add("Domain file '$($file.Name)' illegally imports from infrastructure layer.")
        }
        if ($text -match '\.\./presentation' -or $text -match '/presentation') {
            $errors.Add("Domain file '$($file.Name)' illegally imports from presentation layer.")
        }
        if ($text -match '@nestjs/common') {
            $warnings.Add("Domain file '$($file.Name)' imports '@nestjs/common'. Domain should be framework-agnostic.")
        }

        # Check Aggregate Root
        if ($file.DirectoryName -match [regex]::Escape('domain\model')) {
            if ($file.Name -ne 'index.ts') {
                if ($text -match 'class\s+\w+\s+extends\s+AggregateRoot') {
                    if ($text -notmatch 'private\s+constructor\(' -and $text -notmatch 'protected\s+constructor\(') {
                        $errors.Add("Aggregate Root '$($file.Name)' must have a private or protected constructor.")
                    }
                    if ($text -notmatch 'static\s+create\(') {
                        $errors.Add("Aggregate Root '$($file.Name)' must declare a static create() factory.")
                    }
                    if ($text -notmatch 'static\s+reconstitute\(') {
                        $errors.Add("Aggregate Root '$($file.Name)' must declare a static reconstitute() factory.")
                    }
                }
            }
        }

        # Check Child Entities
        if ($file.DirectoryName -match [regex]::Escape('domain\entities')) {
            if ($file.Name -ne 'index.ts') {
                if ($text -match 'class\s+\w+\s+extends\s+AggregateRoot') {
                    $errors.Add("Child entity '$($file.Name)' must NOT extend AggregateRoot.")
                }
            }
        }
    }
}

# 3. Check Shared Query Ports (Read-Only)
$sharedPortDir = $context.sharedPortDir
if (Test-Path $sharedPortDir) {
    $sharedPorts = Get-ChildItem -Path $sharedPortDir -Filter '*.port.ts'
    $writeRegex = [regex]'\b(save|create|update|delete|set|mutate|insert|remove|drop|patch|post|put)\w*\s*\('
    foreach ($port in $sharedPorts) {
        $lines = Get-Content -LiteralPath $port.FullName
        for ($i = 0; $i -lt $lines.Count; $i++) {
            $line = $lines[$i].Trim()
            if ($line.StartsWith('//') -or $line.StartsWith('*')) { continue }
            if ($line -match 'abstract\s+' -and $writeRegex.IsMatch($line)) {
                $errors.Add("Shared port '$($port.Name)' contains write operation at line $($i+1): '$line'. Shared ports must be strictly read-only.")
            }
        }
    }
}

# 4. Check Application Handlers
$appDir = Join-Path $moduleDir 'application'
if (Test-Path $appDir) {
    $handlers = Get-ChildItem -Path $appDir -Recurse -Filter '*.handler.ts'
    foreach ($h in $handlers) {
        $text = Get-Content -LiteralPath $h.FullName -Raw -Encoding utf8
        if ($text -match 'PrismaService') {
            $errors.Add("Handler '$($h.Name)' directly injects PrismaService. Handlers must depend on repository interfaces.")
        }
        if ($text -match '@Controller' -or $text -match '@Get\(' -or $text -match '@Post\(') {
            $errors.Add("Handler '$($h.Name)' contains presentation decorators.")
        }
    }
}

# 5. Check Cross-Module Dependencies & Data Integrity
$moduleFile = Join-Path $moduleDir "$moduleName.module.ts"
if (Test-Path $moduleFile) {
    $modText = Get-Content -LiteralPath $moduleFile -Raw -Encoding utf8
    if ($modText -match 'forwardRef\(') {
        $errors.Add("Module file '$moduleName.module.ts' uses forwardRef(). forwardRef is forbidden.")
    }
}

Write-Host "Results for Module: $moduleName"
if ($warnings.Count -gt 0) {
    Write-Host "`nWARNINGS ($($warnings.Count)):" -ForegroundColor Yellow
    foreach ($w in $warnings) { Write-Host " - $w" -ForegroundColor Yellow }
}

if ($errors.Count -gt 0) {
    Write-Host "`nERRORS ($($errors.Count)):" -ForegroundColor Red
    foreach ($e in $errors) { Write-Host " [FAIL] $e" -ForegroundColor Red }
    exit 1
} else {
    Write-Host "`nPASS: Module '$moduleName' complies with all DDD, Clean Architecture, and Cross-Module rules." -ForegroundColor Green
}
