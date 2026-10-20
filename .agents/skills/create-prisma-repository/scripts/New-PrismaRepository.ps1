[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$Module,
    [Parameter(Mandatory = $true)][ValidatePattern('^Prisma[A-Z][A-Za-z0-9]*Repository$')][string]$RepositoryName,
    [Parameter(Mandatory = $true)][string]$DomainEntity,
    [Parameter(Mandatory = $true)][string]$PrismaModel,
    [string]$IdType = '',
    [string]$InterfaceName = ''
)

$ErrorActionPreference = 'Stop'
$contextScript = Join-Path $PSScriptRoot '..\..\eduvia-module-workflow\scripts\Get-EduviaContext.ps1'
$context = (& $contextScript -Module $Module -Artifact 'prisma-repository') | ConvertFrom-Json
$utilsScript = Join-Path $PSScriptRoot '..\..\eduvia-module-workflow\scripts\Eduvia-Utils.ps1'
. $utilsScript

$targetScript = Join-Path $PSScriptRoot '..\..\create-repository-adapter\scripts\New-RepositoryAdapter.ps1'
if (-not $InterfaceName) {
    $InterfaceName = "I${DomainEntity}Repository"
}

& $targetScript -Module $Module -AdapterName $RepositoryName -InterfaceName $InterfaceName -DomainEntity $DomainEntity -PrismaModel $PrismaModel -IdType $IdType
