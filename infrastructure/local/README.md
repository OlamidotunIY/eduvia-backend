# Local Eduvia domains

Local development uses the same origins as production:

- `https://api.eduvia.name.ng` proxies to the NestJS server on `127.0.0.1:3000`.
- `https://app.eduvia.name.ng` proxies to the React dev server on `127.0.0.1:5173`.

This deliberately overrides production DNS on the developer machine. Run these
commands from an elevated PowerShell terminal:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\infrastructure\local\Enable-LocalDomains.ps1
caddy trust
caddy run --config .\infrastructure\local\Caddyfile
```

Run NestJS and Vite in separate terminals. Configure Vite with:

```ts
server: {
  host: '127.0.0.1',
  port: 5173,
  strictPort: true,
}
```

When local development is finished, restore access to production DNS:

```powershell
.\infrastructure\local\Disable-LocalDomains.ps1
```

Caddy's local certificate authority must be trusted once per developer machine.
Never commit Caddy's generated private CA material.
