[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$Module,
    [Parameter(Mandatory = $true)][ValidatePattern('^[A-Z][A-Za-z0-9]*CacheAdapter$')][string]$AdapterName
)

$ErrorActionPreference = 'Stop'
$contextScript = Join-Path $PSScriptRoot '..\..\eduvia-module-workflow\scripts\Get-EduviaContext.ps1'
$context = (& $contextScript -Module $Module -Artifact 'cache-adapter') | ConvertFrom-Json
$utilsScript = Join-Path $PSScriptRoot '..\..\eduvia-module-workflow\scripts\Eduvia-Utils.ps1'
. $utilsScript

$targetDir = Join-Path $context.infraDir 'services'
Ensure-Directory -Path $targetDir
$indexFile = Join-Path $targetDir 'index.ts'

$baseName = $AdapterName -replace 'Adapter$', ''
$kebabBase = To-KebabCase -String $baseName
$targetFile = Join-Path $targetDir "$kebabBase.adapter.ts"

if (Test-Path $targetFile) { throw "Refusing to overwrite cache adapter: $targetFile" }

$content = @"
import { Injectable } from '@nestjs/common';
import { RedisService } from '@modules/shared';

@Injectable()
export class $AdapterName {
  constructor(private readonly redis: RedisService) {}

  async get<T>(key: string): Promise<T | null> {
    const raw = await this.redis.getClient().get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    const client = this.redis.getClient();
    const str = JSON.stringify(value);
    if (ttlSeconds) {
      await client.set(key, str, 'EX', ttlSeconds);
    } else {
      await client.set(key, str);
    }
  }

  async del(key: string): Promise<void> {
    await this.redis.getClient().del(key);
  }
}
"@

Set-Content -LiteralPath $targetFile -Value $content.Trim() -Encoding utf8NoBOM
Add-ExportToIndex -IndexPath $indexFile "export * from './$kebabBase.adapter';"
Write-Host "CREATED CACHE ADAPTER: $targetFile"
