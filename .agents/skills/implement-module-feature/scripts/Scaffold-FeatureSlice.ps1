[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$Module,
    [Parameter(Mandatory = $true)][string]$FeatureName,
    [Parameter(Mandatory = $true)][string]$AggregateName,
    [string]$HttpMethod = 'POST',
    [string]$RoutePath = ''
)

$ErrorActionPreference = 'Stop'
$contextScript = Join-Path $PSScriptRoot '..\..\eduvia-module-workflow\scripts\Get-EduviaContext.ps1'
$context = (& $contextScript -Module $Module -Artifact 'feature-slice') | ConvertFrom-Json
$utilsScript = Join-Path $PSScriptRoot '..\..\eduvia-module-workflow\scripts\Eduvia-Utils.ps1'
. $utilsScript

$pascalFeature = To-PascalCase -String $FeatureName
$kebabFeature = To-KebabCase -String $FeatureName

Write-Host "Scaffolding Feature Slice: $pascalFeature in $Module ($AggregateName)"

# 1. Application Command
$cmdScript = Join-Path $PSScriptRoot '..\..\create-application-command\scripts\New-ApplicationCommand.ps1'
if (Test-Path $cmdScript) {
    & $cmdScript -Module $Module -CommandName "${pascalFeature}Command" -RepositoryInterface "I${AggregateName}Repository" -EntityName $AggregateName
}

# 2. Presentation DTO
$dtoScript = Join-Path $PSScriptRoot '..\..\create-presentation-dto\scripts\New-PresentationDto.ps1'
if (Test-Path $dtoScript) {
    & $dtoScript -Module $Module -DtoName "${pascalFeature}Dto"
}

Write-Host "SUCCESS: Scaffolded vertical slice for feature $pascalFeature."
