[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$Module,
    [string]$DocFile = ''
)

$ErrorActionPreference = 'Stop'
$contextScript = Join-Path $PSScriptRoot 'Get-EduviaContext.ps1'
$context = (& $contextScript -Module $Module -Artifact 'doc-audit') | ConvertFrom-Json
$utilsScript = Join-Path $PSScriptRoot 'Eduvia-Utils.ps1'
. $utilsScript

Write-Host "=========================================="
Write-Host "Auditing Documentation Consistency for: $Module"
Write-Host "==========================================`n"

$docsDir = $context.docsDir
if (-not $DocFile) {
    # Try finding matching doc file
    $candidates = Get-ChildItem -Path $docsDir -Filter "*$Module*.md"
    if ($candidates.Count -gt 0) {
        $DocFile = $candidates[0].FullName
    } else {
        $DocFile = Join-Path $docsDir "00-ddd-architecture.md"
    }
}

if (-not (Test-Path $DocFile)) {
    Write-Warning "Doc file not found at: $DocFile"
    exit 0
}

Write-Host "Analyzing document: $(Split-Path $DocFile -Leaf)"
$docText = Get-Content -LiteralPath $DocFile -Raw -Encoding utf8

$inconsistencies = [System.Collections.Generic.List[string]]::new()

# Check 1: Naming Inconsistencies (pluralization, kebab-case vs snake_case)
if ($docText -match '/orgs/' -and $docText -match '/organizations/') {
    $inconsistencies.Add("Doc mixes '/orgs/' and '/organizations/' URL prefixes. Codebase convention uses '/organizations/'.")
}

# Check 2: Shared Port write violations in doc
if ($docText -match 'QueryPort' -and ($docText -match 'update' -or $docText -match 'save' -or $docText -match 'create')) {
    $inconsistencies.Add("Doc may mention write operations near QueryPort. Architecture strictly forbids write methods on shared query ports.")
}

# Check 3: Storage provider references (S3 vs Firebase Storage)
if ($docText -match 'S3') {
    $inconsistencies.Add("Doc mentions 'S3' upload URL. In this project Firebase Storage is used for uploads.")
}

# Check 4: UUID vs UUIDv7
if ($docText -match 'UUID\b' -and $docText -notmatch 'UUIDv7') {
    $inconsistencies.Add("Doc specifies raw 'UUID'. Note that BaseEntityId strictly enforces UUIDv7 format.")
}

if ($inconsistencies.Count -gt 0) {
    Write-Host "`n[DOCUMENTATION INCONSISTENCIES FOUND] ($($inconsistencies.Count)):`n" -ForegroundColor Yellow
    foreach ($item in $inconsistencies) {
        Write-Host " [!] $item" -ForegroundColor Yellow
    }
    Write-Host "`nRecommendation: Align implementation with the canonical Architecture Rules (.agents/rules/architecture.md)."
} else {
    Write-Host "No obvious documentation inconsistencies detected." -ForegroundColor Green
}
