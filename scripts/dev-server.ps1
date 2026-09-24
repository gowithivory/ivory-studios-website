# Ivory Studios — zero-dependency local dev server (no Node required).
# Serves the site with clean URLs (/about -> about.html), mirroring the
# production Vercel behaviour (cleanUrls: true).
#
#   powershell -ExecutionPolicy Bypass -File scripts\dev-server.ps1        # port 3005
#   powershell -ExecutionPolicy Bypass -File scripts\dev-server.ps1 8080   # custom port
param([int]$Port = 3005)

$root = Split-Path -Parent $PSScriptRoot
$mime = @{
  ".html" = "text/html; charset=utf-8"
  ".css"  = "text/css; charset=utf-8"
  ".js"   = "application/javascript; charset=utf-8"
  ".mjs"  = "application/javascript; charset=utf-8"
  ".svg"  = "image/svg+xml"
  ".png"  = "image/png"
  ".jpg"  = "image/jpeg"
  ".jpeg" = "image/jpeg"
  ".webp" = "image/webp"
  ".webmanifest" = "application/manifest+json"
  ".json" = "application/json"
  ".xml"  = "application/xml; charset=utf-8"
  ".txt"  = "text/plain; charset=utf-8"
  ".ico"  = "image/x-icon"
  ".woff" = "font/woff"
  ".woff2" = "font/woff2"
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Output "Ivory Studios -> http://localhost:$Port/  (serving $root, Ctrl+C to stop)"

while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  try {
    $path = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath)
    if ($path -eq "/") { $path = "/index.html" }
    $fs = Join-Path $root ($path -replace '/', '\')
    if (-not (Test-Path -LiteralPath $fs -PathType Leaf)) {
      if (Test-Path -LiteralPath ($fs + ".html") -PathType Leaf) { $fs = $fs + ".html" }
    }
    $full = [IO.Path]::GetFullPath($fs)
    if (-not $full.StartsWith($root, [StringComparison]::OrdinalIgnoreCase)) {
      $ctx.Response.StatusCode = 403
    } elseif (Test-Path -LiteralPath $full -PathType Leaf) {
      $ext = [IO.Path]::GetExtension($full).ToLower()
      $ct = $mime[$ext]; if (-not $ct) { $ct = "application/octet-stream" }
      $bytes = [IO.File]::ReadAllBytes($full)
      $ctx.Response.ContentType = $ct
      $ctx.Response.Headers.Add("Cache-Control", "no-cache")
      $ctx.Response.ContentLength64 = $bytes.Length
      $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $ctx.Response.StatusCode = 404
      $b = [Text.Encoding]::UTF8.GetBytes("404 - " + $path)
      $ctx.Response.OutputStream.Write($b, 0, $b.Length)
    }
  } catch {
    try { $ctx.Response.StatusCode = 500 } catch {}
  } finally {
    try { $ctx.Response.Close() } catch {}
  }
}
