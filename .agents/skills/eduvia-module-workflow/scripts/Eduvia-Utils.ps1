function Ensure-Directory {
    param([Parameter(Mandatory = $true)][string]$Path)
    if (-not (Test-Path $Path)) {
        New-Item -ItemType Directory -Force -Path $Path | Out-Null
    }
}

function To-PascalCase {
    param([Parameter(Mandatory = $true)][string]$String)
    $clean = $String -replace '[^a-zA-Z0-9]+', '-'
    $parts = $clean -split '-'
    $capitalized = $parts | Where-Object { $_.Length -gt 0 } | ForEach-Object {
        $_.Substring(0, 1).ToUpper() + $_.Substring(1)
    }
    return ($capitalized -join '')
}

function To-KebabCase {
    param([Parameter(Mandatory = $true)][string]$String)
    $clean = $String -replace '([a-z0-9])([A-Z])', '$1-$2'
    $clean = $clean -replace '[^a-zA-Z0-9]+', '-'
    return $clean.ToLower().Trim('-')
}

function To-CamelCase {
    param([Parameter(Mandatory = $true)][string]$String)
    $pascal = To-PascalCase -String $String
    if ($pascal.Length -eq 0) { return '' }
    return $pascal.Substring(0, 1).ToLower() + $pascal.Substring(1)
}

function Add-ExportToIndex {
    param(
        [Parameter(Mandatory = $true)][string]$IndexPath,
        [Parameter(Mandatory = $true)][string]$ExportStatement
    )
    $dir = Split-Path $IndexPath -Parent
    Ensure-Directory -Path $dir

    if (-not (Test-Path $IndexPath)) {
        Set-Content -LiteralPath $IndexPath -Value "$ExportStatement`n" -Encoding utf8NoBOM
        return
    }

    $existing = Get-Content -LiteralPath $IndexPath -Raw -Encoding utf8
    if ($existing -notmatch [regex]::Escape($ExportStatement.Trim())) {
        $trimmed = $existing.TrimEnd()
        if ($trimmed.Length -gt 0) {
            $newContent = "$trimmed`n$ExportStatement`n"
        } else {
            $newContent = "$ExportStatement`n"
        }
        Set-Content -LiteralPath $IndexPath -Value $newContent -Encoding utf8NoBOM
    }
}
