[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$Module,
    [Parameter(Mandatory = $true)][ValidatePattern('^[A-Z][A-Za-z0-9]*$')][string]$EntityName,
    [switch]$IsAggregateRoot,
    [string]$IdType = '',
    [string]$FieldsJson = '[]',
    [string]$MethodsJson = '[]'
)

$ErrorActionPreference = 'Stop'
$contextScript = Join-Path $PSScriptRoot '..\..\eduvia-module-workflow\scripts\Get-EduviaContext.ps1'
$context = (& $contextScript -Module $Module -Artifact 'domain-entity') | ConvertFrom-Json
$utilsScript = Join-Path $PSScriptRoot '..\..\eduvia-module-workflow\scripts\Eduvia-Utils.ps1'
. $utilsScript

$kebabName = To-KebabCase -String $EntityName
if (-not $IdType) {
    $IdType = "${EntityName}Id"
}
$kebabId = To-KebabCase -String $IdType

# Parse fields
$fields = @()
try {
    $fields = $FieldsJson | ConvertFrom-Json
} catch {
    $fields = @()
}

# Parse methods
$methods = @()
try {
    $methods = $MethodsJson | ConvertFrom-Json
} catch {
    $methods = @()
}

if ($IsAggregateRoot) {
    $targetDir = Join-Path $context.domainDir 'model'
    $targetFile = Join-Path $targetDir "$EntityName.ts"
    $indexFile = Join-Path $targetDir 'index.ts'
    if (Test-Path $targetFile) { throw "Refusing to overwrite aggregate root: $targetFile" }

    Ensure-Directory -Path $targetDir

    # Generate Aggregate Root code
    $fieldDeclarations = ($fields | ForEach-Object {
        $pName = $_.name
        $pType = $_.type
        $isPub = if ($_.isPublic -eq $true) { "public readonly ${pName}: $pType;" } else { "private _${pName}: $pType;" }
        "  $isPub"
    }) -join "`n"

    $ctorAssignments = ($fields | ForEach-Object {
        $pName = $_.name
        if ($_.isPublic -eq $true) { "    this.$pName = params.$pName;" } else { "    this._$pName = params.$pName;" }
    }) -join "`n"

    $paramTypes = ($fields | ForEach-Object { "    $($_.name): $($_.type);" }) -join "`n"

    $getters = ($fields | Where-Object { $_.isPublic -ne $true } | ForEach-Object {
        $pName = $_.name
        $pType = $_.type
        @"
  public get $pName(): $pType {
    return this._$pName;
  }
"@
    }) -join "`n`n"

    $content = @"
import { AggregateRoot } from '@modules/shared';
import { $IdType } from '../value-objects/$kebabId.vo';

class $EntityName extends AggregateRoot<$IdType> {
$fieldDeclarations
  public readonly createdAt: Date;
  private _updatedAt: Date;

  private constructor(params: {
    id: $IdType;
$paramTypes
    createdAt: Date;
    updatedAt: Date;
  }) {
    super(params.id);
$ctorAssignments
    this.createdAt = params.createdAt;
    this._updatedAt = params.updatedAt;
  }

  public static create(params: {
    id: $IdType;
$paramTypes
    correlationId: string;
  }): $EntityName {
    const now = new Date();
    const entity = new $EntityName({
      ...params,
      createdAt: now,
      updatedAt: now,
    });

    // TODO: entity.addDomainEvent(new ${EntityName}CreatedEvent(...));

    return entity;
  }

  public static reconstitute(params: {
    id: $IdType;
$paramTypes
    createdAt: Date;
    updatedAt: Date;
  }): $EntityName {
    return new $EntityName(params);
  }

$getters

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  private touch(): void {
    this._updatedAt = new Date();
  }
}

export { $EntityName };
"@

    Set-Content -LiteralPath $targetFile -Value $content.Trim() -Encoding utf8NoBOM
    Add-ExportToIndex -IndexPath $indexFile "export * from './$EntityName';"
    Write-Host "CREATED AGGREGATE ROOT: $targetFile"
} else {
    $targetDir = Join-Path $context.domainDir 'entities'
    $targetFile = Join-Path $targetDir "$kebabName.entity.ts"
    $indexFile = Join-Path $targetDir 'index.ts'
    if (Test-Path $targetFile) { throw "Refusing to overwrite entity: $targetFile" }

    Ensure-Directory -Path $targetDir

    $fieldDeclarations = ($fields | ForEach-Object {
        $pName = $_.name
        $pType = $_.type
        $isPub = if ($_.isPublic -eq $true) { "public readonly ${pName}: $pType;" } else { "private _${pName}: $pType;" }
        "  $isPub"
    }) -join "`n"

    $ctorAssignments = ($fields | ForEach-Object {
        $pName = $_.name
        if ($_.isPublic -eq $true) { "    this.$pName = params.$pName;" } else { "    this._$pName = params.$pName;" }
    }) -join "`n"

    $paramTypes = ($fields | ForEach-Object { "    $($_.name): $($_.type);" }) -join "`n"

    $getters = ($fields | Where-Object { $_.isPublic -ne $true } | ForEach-Object {
        $pName = $_.name
        $pType = $_.type
        @"
  public get $pName(): $pType {
    return this._$pName;
  }
"@
    }) -join "`n`n"

    $content = @"
import { $IdType } from '../value-objects/$kebabId.vo';

class $EntityName {
  public readonly id: $IdType;
$fieldDeclarations

  private constructor(params: {
    id: $IdType;
$paramTypes
  }) {
    this.id = params.id;
$ctorAssignments
  }

  public static create(params: {
    id: $IdType;
$paramTypes
  }): $EntityName {
    return new $EntityName(params);
  }

  public static reconstitute(params: {
    id: $IdType;
$paramTypes
  }): $EntityName {
    return new $EntityName(params);
  }

$getters
}

export { $EntityName };
"@

    Set-Content -LiteralPath $targetFile -Value $content.Trim() -Encoding utf8NoBOM
    Add-ExportToIndex -IndexPath $indexFile "export * from './$kebabName.entity';"
    Write-Host "CREATED CHILD ENTITY: $targetFile"
}
