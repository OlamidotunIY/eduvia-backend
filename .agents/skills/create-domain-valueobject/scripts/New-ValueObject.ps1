[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$Module,
    [Parameter(Mandatory = $true)][ValidatePattern('^[A-Z][A-Za-z0-9]*$')][string]$Name,
    [switch]$IsTypedId,
    [switch]$IsEnum,
    [string]$EnumValuesJson = '[]',
    [string]$FieldsJson = '[]'
)

$ErrorActionPreference = 'Stop'
$contextScript = Join-Path $PSScriptRoot '..\..\eduvia-module-workflow\scripts\Get-EduviaContext.ps1'
$context = (& $contextScript -Module $Module -Artifact 'domain-valueobject') | ConvertFrom-Json
$utilsScript = Join-Path $PSScriptRoot '..\..\eduvia-module-workflow\scripts\Eduvia-Utils.ps1'
. $utilsScript

$targetDir = Join-Path $context.domainDir 'value-objects'
Ensure-Directory -Path $targetDir
$indexFile = Join-Path $targetDir 'index.ts'

$kebabName = To-KebabCase -String $Name
$targetFile = Join-Path $targetDir "$kebabName.vo.ts"

if (Test-Path $targetFile) { throw "Refusing to overwrite value object: $targetFile" }

if ($IsTypedId) {
    $content = @"
import { BaseEntityId } from '@modules/shared';

class $Name extends BaseEntityId {
  private constructor(value: string) {
    super(value);
  }

  public static create(): $Name {
    return new $Name(this.nextValue());
  }

  public static from(value: string): $Name {
    return new $Name(value);
  }
}

export { $Name };
"@
} elseif ($IsEnum) {
    $values = @()
    try { $values = $EnumValuesJson | ConvertFrom-Json } catch { $values = @() }

    $entries = ($values | ForEach-Object {
        $k = $_.ToUpper() -replace '[^A-Z0-9]+', '_'
        "  $k = '$_',"
    }) -join "`n"

    $content = @"
export enum $Name {
$entries
}
"@
} else {
    $fields = @()
    try { $fields = $FieldsJson | ConvertFrom-Json } catch { $fields = @() }

    $decls = ($fields | ForEach-Object { "  public readonly $($_.name): $($_.type);" }) -join "`n"
    $paramTypes = ($fields | ForEach-Object { "    $($_.name): $($_.type);" }) -join "`n"
    $assignments = ($fields | ForEach-Object { "    this.$($_.name) = params.$($_.name);" }) -join "`n"
    $equalsChecks = ($fields | ForEach-Object { "this.$($_.name) === other.$($_.name)" }) -join " && "
    if (-not $equalsChecks) { $equalsChecks = "true" }

    $content = @"
class $Name {
$decls

  private constructor(params: {
$paramTypes
  }) {
$assignments
  }

  public static create(params: {
$paramTypes
  }): $Name {
    // Add invariant validation rules here
    return new $Name(params);
  }

  public equals(other: $Name): boolean {
    if (!other) return false;
    return $equalsChecks;
  }
}

export { $Name };
"@
}

Set-Content -LiteralPath $targetFile -Value $content.Trim() -Encoding utf8NoBOM
Add-ExportToIndex -IndexPath $indexFile "export * from './$kebabName.vo';"
Write-Host "CREATED VALUE OBJECT: $targetFile"
