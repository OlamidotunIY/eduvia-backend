#Requires -RunAsAdministrator
[CmdletBinding()]
param()

$hostsPath = Join-Path $env:SystemRoot 'System32\drivers\etc\hosts'
$marker = '# eduvia-local'
$entries = @(
    "127.0.0.1 api.eduvia.name.ng $marker",
    "127.0.0.1 app.eduvia.name.ng $marker"
)

$current = Get-Content -LiteralPath $hostsPath
$withoutEduvia = $current | Where-Object { $_ -notmatch [regex]::Escape($marker) }
Set-Content -LiteralPath $hostsPath -Value @($withoutEduvia; $entries) -Encoding ascii
Clear-DnsClientCache

Write-Host 'Eduvia local domains now resolve to 127.0.0.1.'
Write-Warning 'These hosts entries override the production sites on this computer until Disable-LocalDomains.ps1 is run.'
