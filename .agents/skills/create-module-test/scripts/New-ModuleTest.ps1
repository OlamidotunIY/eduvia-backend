[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$Module,
    [Parameter(Mandatory = $true)][string]$TargetName,
    [ValidateSet('Aggregate', 'ValueObject', 'Command', 'Query')]
    [string]$TestType = 'Aggregate'
)

$ErrorActionPreference = 'Stop'
$contextScript = Join-Path $PSScriptRoot '..\..\eduvia-module-workflow\scripts\Get-EduviaContext.ps1'
$context = (& $contextScript -Module $Module -Artifact 'module-test') | ConvertFrom-Json
$utilsScript = Join-Path $PSScriptRoot '..\..\eduvia-module-workflow\scripts\Eduvia-Utils.ps1'
. $utilsScript

$kebabTarget = To-KebabCase -String $TargetName
$testDir = Join-Path $context.moduleDir 'test'
Ensure-Directory -Path $testDir
$testFile = Join-Path $testDir "$kebabTarget.spec.ts"

if (Test-Path $testFile) { throw "Refusing to overwrite test: $testFile" }

if ($TestType -eq 'Aggregate') {
    $content = @"
import { $TargetName } from '../domain/model/$TargetName';
import { ${TargetName}Id } from '../domain/value-objects/${kebabTarget}-id.vo';

describe('$TargetName Aggregate', () => {
  it('should successfully create an aggregate instance and emit creation event', () => {
    const id = ${TargetName}Id.create();
    // TODO: supply required creation parameters
    // const entity = $TargetName.create({ id, ... });
    // expect(entity).toBeDefined();
    // const events = entity.pullDomainEvents();
    // expect(events.length).toBeGreaterThan(0);
  });

  it('should reconstitute from persistence without emitting domain events', () => {
    const id = ${TargetName}Id.create();
    // const entity = $TargetName.reconstitute({ id, ... });
    // expect(entity.pullDomainEvents()).toHaveLength(0);
  });
});
"@
} elseif ($TestType -eq 'ValueObject') {
    $content = @"
import { $TargetName } from '../domain/value-objects/$kebabTarget.vo';

describe('$TargetName Value Object', () => {
  it('should enforce equality by value', () => {
    // const vo1 = $TargetName.create({ ... });
    // const vo2 = $TargetName.create({ ... });
    // expect(vo1.equals(vo2)).toBe(true);
  });
});
"@
} else {
    $content = @"
describe('$TargetName Handler', () => {
  it('should execute successfully against mocked repository', async () => {
    // const mockRepo = { save: jest.fn().mockResolvedValue(undefined) };
    // const handler = new ${TargetName}Handler(mockRepo as any);
    // const result = await handler.execute(new ${TargetName}Command({ ... }));
    // expect(mockRepo.save).toHaveBeenCalledTimes(1);
  });
});
"@
}

Set-Content -LiteralPath $testFile -Value $content.Trim() -Encoding utf8NoBOM
Write-Host "CREATED TEST SUITE: $testFile"
