[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$Module
)

$ErrorActionPreference = 'Stop'
$contextScript = Join-Path $PSScriptRoot '..\..\eduvia-module-workflow\scripts\Get-EduviaContext.ps1'
$context = (& $contextScript -Module $Module -Artifact 'module') | ConvertFrom-Json
$utilsScript = Join-Path $PSScriptRoot '..\..\eduvia-module-workflow\scripts\Eduvia-Utils.ps1'
. $utilsScript

$moduleDir = $context.moduleDir
$moduleName = $context.moduleName
$pascalName = $context.pascalName

Write-Host "Scaffolding module: $moduleName ($pascalName) in $moduleDir"

$subdirs = @(
    'domain\model',
    'domain\entities',
    'domain\value-objects',
    'domain\events',
    'domain\errors',
    'domain\repository',
    'domain\ports',
    'application\commands',
    'application\queries',
    'infrastructure\persistence\repository',
    'infrastructure\persistence\mappers',
    'infrastructure\messaging\listeners',
    'infrastructure\messaging\events',
    'infrastructure\messaging\scheduler',
    'infrastructure\services',
    'presentation\controllers',
    'presentation\dto',
    'presentation\services'
)

foreach ($sub in $subdirs) {
    Ensure-Directory -Path (Join-Path $moduleDir $sub)
}

# Domain barrels
Add-ExportToIndex -IndexPath (Join-Path $moduleDir 'domain\model\index.ts') '// Aggregate Roots'
Add-ExportToIndex -IndexPath (Join-Path $moduleDir 'domain\entities\index.ts') '// Child Entities'
Add-ExportToIndex -IndexPath (Join-Path $moduleDir 'domain\value-objects\index.ts') '// Value Objects & Typed IDs'
Add-ExportToIndex -IndexPath (Join-Path $moduleDir 'domain\events\index.ts') '// Domain Events'
Add-ExportToIndex -IndexPath (Join-Path $moduleDir 'domain\errors\index.ts') '// Domain Errors'
Add-ExportToIndex -IndexPath (Join-Path $moduleDir 'domain\repository\index.ts') '// Repository Ports'
Add-ExportToIndex -IndexPath (Join-Path $moduleDir 'domain\ports\index.ts') '// Domain Ports'

$domainIndex = Join-Path $moduleDir 'domain\index.ts'
Add-ExportToIndex -IndexPath $domainIndex "export * from './model';"
Add-ExportToIndex -IndexPath $domainIndex "export * from './entities';"
Add-ExportToIndex -IndexPath $domainIndex "export * from './value-objects';"
Add-ExportToIndex -IndexPath $domainIndex "export * from './events';"
Add-ExportToIndex -IndexPath $domainIndex "export * from './errors';"
Add-ExportToIndex -IndexPath $domainIndex "export * from './repository';"
Add-ExportToIndex -IndexPath $domainIndex "export * from './ports';"

# Application barrels
Add-ExportToIndex -IndexPath (Join-Path $moduleDir 'application\commands\index.ts') '// Commands'
Add-ExportToIndex -IndexPath (Join-Path $moduleDir 'application\queries\index.ts') '// Queries'
$appIndex = Join-Path $moduleDir 'application\index.ts'
Add-ExportToIndex -IndexPath $appIndex "export * from './commands';"
Add-ExportToIndex -IndexPath $appIndex "export * from './queries';"

# Infrastructure barrels
Add-ExportToIndex -IndexPath (Join-Path $moduleDir 'infrastructure\persistence\repository\index.ts') '// Repositories'
Add-ExportToIndex -IndexPath (Join-Path $moduleDir 'infrastructure\persistence\mappers\index.ts') '// Mappers'
Add-ExportToIndex -IndexPath (Join-Path $moduleDir 'infrastructure\messaging\events\index.ts') '// Incoming Events'
Add-ExportToIndex -IndexPath (Join-Path $moduleDir 'infrastructure\messaging\listeners\index.ts') '// BullMQ Listeners'
Add-ExportToIndex -IndexPath (Join-Path $moduleDir 'infrastructure\services\index.ts') '// Service Adapters'

$infraMsgIndex = Join-Path $moduleDir 'infrastructure\messaging\index.ts'
Add-ExportToIndex -IndexPath $infraMsgIndex "export * from './events';"
Add-ExportToIndex -IndexPath $infraMsgIndex "export * from './listeners';"

$infraIndex = Join-Path $moduleDir 'infrastructure\index.ts'
Add-ExportToIndex -IndexPath $infraIndex "export * from './persistence/repository';"
Add-ExportToIndex -IndexPath $infraIndex "export * from './persistence/mappers';"
Add-ExportToIndex -IndexPath $infraIndex "export * from './messaging';"
Add-ExportToIndex -IndexPath $infraIndex "export * from './services';"

# Presentation barrels
Add-ExportToIndex -IndexPath (Join-Path $moduleDir 'presentation\controllers\index.ts') '// Controllers'
Add-ExportToIndex -IndexPath (Join-Path $moduleDir 'presentation\dto\index.ts') '// Presentation DTOs'
Add-ExportToIndex -IndexPath (Join-Path $moduleDir 'presentation\services\index.ts') '// Presentation Services'

$presIndex = Join-Path $moduleDir 'presentation\index.ts'
Add-ExportToIndex -IndexPath $presIndex "export * from './controllers';"
Add-ExportToIndex -IndexPath $presIndex "export * from './dto';"
Add-ExportToIndex -IndexPath $presIndex "export * from './services';"

# Module class
$moduleFile = Join-Path $moduleDir "$moduleName.module.ts"
if (-not (Test-Path $moduleFile)) {
    $modContent = @"
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BullModule } from '@nestjs/bullmq';
import { PrismaService, RedisService, AuthGuard } from '@modules/shared';

const CommandHandlers: any[] = [];
const QueryHandlers: any[] = [];
const EventProcessors: any[] = [];
const Mappers: any[] = [];
const PortBindings: any[] = [];
const Services: any[] = [];

@Module({
  imports: [
    CqrsModule,
    BullModule.registerQueue({ name: '$moduleName-events' }),
  ],
  controllers: [],
  providers: [
    PrismaService,
    RedisService,
    AuthGuard,
    ...Services,
    ...Mappers,
    ...PortBindings,
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventProcessors,
  ],
  exports: [
    // Export ONLY shared query port tokens and adapters implementing shared ports
  ],
})
export class ${pascalName}Module {}
"@
    [System.IO.File]::WriteAllText($moduleFile, $modContent, [System.Text.UTF8Encoding]::new($false))
    Write-Host "CREATED: $moduleFile"
}

# Root barrel
$rootIndex = Join-Path $moduleDir 'index.ts'
if (-not (Test-Path $rootIndex)) {
    $rootContent = @"
export * from './domain';
export * from './application';
export * from './infrastructure';
export * from './presentation';
export { ${pascalName}Module } from './$moduleName.module';
"@
    [System.IO.File]::WriteAllText($rootIndex, $rootContent, [System.Text.UTF8Encoding]::new($false))
    Write-Host "CREATED: $rootIndex"
}

# Prisma schema
Ensure-Directory -Path $context.prismaSchemaDir
$prismaFile = Join-Path $context.prismaSchemaDir "$moduleName.prisma"
if (-not (Test-Path $prismaFile)) {
    $prismaContent = @"
// Prisma schema for $pascalName module
// All IDs use @id @default(uuid()) @map("_id")
// Tables use @@map("snake_case_table_name")
"@
    [System.IO.File]::WriteAllText($prismaFile, $prismaContent, [System.Text.UTF8Encoding]::new($false))
    Write-Host "CREATED: $prismaFile"
}

# Sync module aliases
$syncScript = Join-Path $context.repoRoot 'scripts\sync-module-aliases.cjs'
if (Test-Path $syncScript) {
    node "$syncScript"
}

Write-Host "SUCCESS: Scaffolded $moduleName module structure."
