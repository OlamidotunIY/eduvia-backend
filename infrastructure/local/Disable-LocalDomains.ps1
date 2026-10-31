#Requires -RunAsAdministrator
[CmdletBinding()]
param()

$hostsPath = Join-Path $env:SystemRoot 'System32\drivers\etc\hosts'
$marker = '# eduvia-local'
$current = Get-Content -LiteralPath $hostsPath
$withoutEduvia = $current | Where-Object { $_ -notmatch [regex]::Escape($marker) }
Set-Content -LiteralPath $hostsPath -Value $withoutEduvia -Encoding ascii
Clear-DnsClientCache

Write-Host 'Eduvia local domain overrides removed.'
