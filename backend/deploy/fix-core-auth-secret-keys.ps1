param(
  [string]$Profile = "quickbite",
  [string]$Region = "eu-north-1",
  [string]$SecretId = "core/auth",
  [string]$Cluster = "quickbite-1",
  [string]$OrderService = "order-service",
  [switch]$RedeployOrderService
)

$ErrorActionPreference = "Stop"

function Invoke-AwsText {
  param([string[]]$AwsArgs)

  $finalArgs = @($AwsArgs + @("--profile", $Profile, "--region", $Region, "--no-cli-pager"))
  $out = & aws @finalArgs
  if ($LASTEXITCODE -ne 0) {
    throw "aws $($finalArgs -join ' ') failed"
  }
  return (($out | Out-String).Trim())
}

Write-Host "Reading secret $SecretId..."
$raw = Invoke-AwsText @(
  "secretsmanager", "get-secret-value",
  "--secret-id", $SecretId,
  "--query", "SecretString",
  "--output", "text"
)

if ([string]::IsNullOrWhiteSpace($raw) -or $raw -eq "None") {
  throw "Secret $SecretId has no SecretString."
}

$wasArrayJson = $raw.TrimStart().StartsWith("[")
$parsed = $raw | ConvertFrom-Json
if ($parsed -is [array]) {
  if ($parsed.Count -ne 1) {
    throw "Secret $SecretId parsed as an array with $($parsed.Count) items. Expected one object."
  }
  $auth = $parsed[0]
} else {
  $auth = $parsed
}

$keysBefore = @($auth.PSObject.Properties.Name)

$accessSecret = if ($keysBefore -contains "JWT_ACCESS_SECRET") {
  $auth.JWT_ACCESS_SECRET
} else {
  $auth.ACCESS_SECRET
}

$refreshSecret = if ($keysBefore -contains "JWT_REFRESH_SECRET") {
  $auth.JWT_REFRESH_SECRET
} else {
  $auth.REFRESH_SECRET
}

if (-not $accessSecret) {
  throw "Secret $SecretId lacks ACCESS_SECRET and JWT_ACCESS_SECRET."
}

if (-not $refreshSecret) {
  throw "Secret $SecretId lacks REFRESH_SECRET and JWT_REFRESH_SECRET."
}

$auth | Add-Member -NotePropertyName "ACCESS_SECRET" -NotePropertyValue $accessSecret -Force
$auth | Add-Member -NotePropertyName "REFRESH_SECRET" -NotePropertyValue $refreshSecret -Force
$auth | Add-Member -NotePropertyName "JWT_ACCESS_SECRET" -NotePropertyValue $accessSecret -Force
$auth | Add-Member -NotePropertyName "JWT_REFRESH_SECRET" -NotePropertyValue $refreshSecret -Force

$keysAfter = @($auth.PSObject.Properties.Name)
$needsUpdate =
  $wasArrayJson -or
  ($parsed -is [array]) -or
  ($keysBefore -notcontains "ACCESS_SECRET") -or
  ($keysBefore -notcontains "REFRESH_SECRET") -or
  ($keysBefore -notcontains "JWT_ACCESS_SECRET") -or
  ($keysBefore -notcontains "JWT_REFRESH_SECRET")

if (-not $needsUpdate) {
  Write-Host "Secret already contains ACCESS_SECRET, REFRESH_SECRET, JWT_ACCESS_SECRET, and JWT_REFRESH_SECRET. No secret update needed."
} else {
  $tmp = Join-Path ([System.IO.Path]::GetTempPath()) ("quickbite-core-auth-" + [System.Guid]::NewGuid().ToString("N") + ".json")
  try {
    $auth | ConvertTo-Json -Compress | Set-Content -LiteralPath $tmp -Encoding utf8
    Invoke-AwsText @(
      "secretsmanager", "put-secret-value",
      "--secret-id", $SecretId,
      "--secret-string", "file://$tmp",
      "--query", "ARN",
      "--output", "text"
    ) | Out-Null
    Write-Host "Updated $SecretId. Keys now include: $($keysAfter -join ', ')"
  } finally {
    if (Test-Path -LiteralPath $tmp) {
      Remove-Item -LiteralPath $tmp -Force
    }
  }
}

if ($RedeployOrderService) {
  Write-Host "Forcing new ECS deployment for $OrderService..."
  Invoke-AwsText @(
    "ecs", "update-service",
    "--cluster", $Cluster,
    "--service", $OrderService,
    "--force-new-deployment",
    "--query", "service.serviceArn",
    "--output", "text"
  ) | Out-Null
  Write-Host "Redeploy requested for $OrderService."
} else {
  Write-Host "Order service was not redeployed. Re-run with -RedeployOrderService if needed."
}
