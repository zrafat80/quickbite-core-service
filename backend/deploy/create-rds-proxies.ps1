<#
Creates or reuses the five QuickBite PostgreSQL RDS Proxies.

Safe provisioning only:
  .\deploy\create-rds-proxies.ps1

After proxies and targets are healthy, switch ECS DB host secrets and restart:
  .\deploy\create-rds-proxies.ps1 -ApplySecretHostUpdates -RedeployEcsServices

The script never updates app DB host secrets unless -ApplySecretHostUpdates is set.
The script never restarts ECS services unless -RedeployEcsServices is set.
#>

param(
  [string]$Profile = "",
  [string]$Region = "",
  [string]$Cluster = "",
  [string]$CoreService = "",
  [string]$OrderService = "",
  [string]$EcsSecurityGroupId = "",
  [string]$ProxySecurityGroupName = "",
  [string]$ProxyRoleName = "",
  [int]$MaxConnectionsPercent = 80,
  [int]$MaxIdleConnectionsPercent = 20,
  [int]$ConnectionBorrowTimeout = 120,
  [ValidateSet("", "POSTGRES_SCRAM_SHA_256", "POSTGRES_MD5")]
  [string]$PostgresClientPasswordAuthType = "",
  [string]$ConfigPath = "",
  [switch]$ApplySecretHostUpdates,
  [switch]$RedeployEcsServices,
  [switch]$Wait
)

$ErrorActionPreference = "Stop"

$DeployDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $ConfigPath) {
  $ConfigPath = Join-Path $DeployDir "rds-proxies.json"
}
if (-not (Test-Path $ConfigPath)) {
  throw "Missing RDS proxy config: $ConfigPath"
}

$Config = Get-Content $ConfigPath -Raw | ConvertFrom-Json
$Defaults = $Config.defaults

if (-not $Profile) { $Profile = [string]$Defaults.profile }
if (-not $Region) { $Region = [string]$Defaults.region }
if (-not $Cluster) { $Cluster = [string]$Defaults.cluster }
if (-not $CoreService) { $CoreService = [string]$Defaults.coreService }
if (-not $OrderService) { $OrderService = [string]$Defaults.orderService }
if (-not $EcsSecurityGroupId) { $EcsSecurityGroupId = [string]$Defaults.ecsSecurityGroupId }
if (-not $ProxySecurityGroupName) { $ProxySecurityGroupName = [string]$Defaults.proxySecurityGroupName }
if (-not $ProxyRoleName) { $ProxyRoleName = [string]$Defaults.proxyRoleName }

if ($RedeployEcsServices -and -not $ApplySecretHostUpdates) {
  throw "-RedeployEcsServices requires -ApplySecretHostUpdates so restarted tasks do not keep old DB hosts."
}

if ($MaxIdleConnectionsPercent -gt $MaxConnectionsPercent) {
  throw "MaxIdleConnectionsPercent must be less than or equal to MaxConnectionsPercent."
}

function Invoke-AwsText {
  param([string[]]$AwsArgs)

  $finalArgs = @($AwsArgs + @("--profile", $Profile, "--region", $Region, "--no-cli-pager"))
  $out = & aws @finalArgs
  if ($LASTEXITCODE -ne 0) {
    throw "aws $($finalArgs -join ' ') failed"
  }
  return (($out | Out-String).Trim())
}

function Invoke-AwsJson {
  param([string[]]$AwsArgs)

  $text = Invoke-AwsText $AwsArgs
  if ([string]::IsNullOrWhiteSpace($text) -or $text -eq "None" -or $text -eq "null") {
    return $null
  }
  return $text | ConvertFrom-Json
}

function Try-AwsText {
  param([string[]]$AwsArgs)

  $oldPreference = $ErrorActionPreference
  $ErrorActionPreference = "SilentlyContinue"
  $finalArgs = @($AwsArgs + @("--profile", $Profile, "--region", $Region, "--no-cli-pager"))
  $out = & aws @finalArgs 2>$null
  $exitCode = $LASTEXITCODE
  $ErrorActionPreference = $oldPreference

  if ($exitCode -ne 0) {
    return $null
  }
  return (($out | Out-String).Trim())
}

function Invoke-AwsCapture {
  param([string[]]$AwsArgs)

  $oldPreference = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  $finalArgs = @($AwsArgs + @("--profile", $Profile, "--region", $Region, "--no-cli-pager"))
  $out = & aws @finalArgs 2>&1
  $exitCode = $LASTEXITCODE
  $ErrorActionPreference = $oldPreference

  return [pscustomobject]@{
    ExitCode = $exitCode
    Output = (($out | Out-String).Trim())
    Args = $finalArgs
  }
}

function New-TempJsonFile {
  param(
    $Value,
    [switch]$AsArray
  )

  $path = Join-Path ([System.IO.Path]::GetTempPath()) ("quickbite-" + [System.Guid]::NewGuid().ToString("N") + ".json")
  if ($AsArray) {
    $json = ConvertTo-Json -InputObject @($Value) -Depth 50 -Compress
  } else {
    $json = $Value | ConvertTo-Json -Depth 50 -Compress
  }
  [System.IO.File]::WriteAllText($path, $json, [System.Text.UTF8Encoding]::new($false))
  return $path
}

function Remove-TempFile {
  param([string]$Path)
  if ($Path -and (Test-Path $Path)) {
    Remove-Item -LiteralPath $Path -Force
  }
}

function Get-PropertyValue {
  param(
    $Object,
    [string]$Name,
    [switch]$AllowEmpty
  )

  $prop = $Object.PSObject.Properties[$Name]
  if ($null -eq $prop) {
    throw "Secret JSON is missing required key '$Name'."
  }
  $value = [string]$prop.Value
  if (-not $AllowEmpty -and [string]::IsNullOrWhiteSpace($value)) {
    throw "Secret JSON key '$Name' is empty."
  }
  return $value
}

function Set-PropertyValue {
  param(
    $Object,
    [string]$Name,
    [string]$Value
  )

  $prop = $Object.PSObject.Properties[$Name]
  if ($null -eq $prop) {
    $Object | Add-Member -NotePropertyName $Name -NotePropertyValue $Value
  } else {
    $prop.Value = $Value
  }
}

function Read-SecretObject {
  param([string]$SecretId)

  $secretString = Invoke-AwsText @(
    "secretsmanager", "get-secret-value",
    "--secret-id", $SecretId,
    "--query", "SecretString",
    "--output", "text"
  )
  if ([string]::IsNullOrWhiteSpace($secretString) -or $secretString -eq "None") {
    throw "Secret '$SecretId' has no SecretString."
  }
  return $secretString | ConvertFrom-Json
}

function Write-SecretObject {
  param(
    [string]$SecretId,
    $SecretObject
  )

  $path = New-TempJsonFile $SecretObject
  try {
    Invoke-AwsText @(
      "secretsmanager", "put-secret-value",
      "--secret-id", $SecretId,
      "--secret-string", "file://$path",
      "--query", "ARN",
      "--output", "text"
    ) | Out-Null
  } finally {
    Remove-TempFile $path
  }
}

function Get-SecurityGroupVpc {
  param([string]$SecurityGroupId)

  $vpcId = Invoke-AwsText @(
    "ec2", "describe-security-groups",
    "--group-ids", $SecurityGroupId,
    "--query", "SecurityGroups[0].VpcId",
    "--output", "text"
  )
  if (-not $vpcId -or $vpcId -eq "None") {
    throw "Could not resolve VPC for security group '$SecurityGroupId'."
  }
  return $vpcId
}

function Ensure-ProxySecurityGroup {
  param([string]$VpcId)

  $sgId = Try-AwsText @(
    "ec2", "describe-security-groups",
    "--filters", "Name=vpc-id,Values=$VpcId", "Name=group-name,Values=$ProxySecurityGroupName",
    "--query", "SecurityGroups[0].GroupId",
    "--output", "text"
  )
  if ($sgId -and $sgId -ne "None") {
    Write-Host "Using security group $ProxySecurityGroupName ($sgId)"
    return $sgId
  }

  Write-Host "Creating security group $ProxySecurityGroupName in $VpcId..."
  $sgId = Invoke-AwsText @(
    "ec2", "create-security-group",
    "--group-name", $ProxySecurityGroupName,
    "--description", "QuickBite RDS Proxy access",
    "--vpc-id", $VpcId,
    "--query", "GroupId",
    "--output", "text"
  )

  Invoke-AwsText @(
    "ec2", "create-tags",
    "--resources", $sgId,
    "--tags", "Key=Name,Value=$ProxySecurityGroupName", "Key=App,Value=QuickBite", "Key=ManagedBy,Value=create-rds-proxies.ps1"
  ) | Out-Null

  return $sgId
}

function Ensure-IngressFromSecurityGroup {
  param(
    [string]$GroupId,
    [string]$SourceGroupId,
    [int]$Port
  )

  $result = Invoke-AwsCapture @(
    "ec2", "authorize-security-group-ingress",
    "--group-id", $GroupId,
    "--protocol", "tcp",
    "--port", "$Port",
    "--source-group", $SourceGroupId
  )
  if ($result.ExitCode -eq 0) {
    return
  }
  if ($result.Output -match "InvalidPermission.Duplicate") {
    return
  }
  throw $result.Output
}

function Ensure-EgressToSecurityGroup {
  param(
    [string]$GroupId,
    [string]$DestinationGroupId,
    [int]$Port
  )

  $permission = "IpProtocol=tcp,FromPort=$Port,ToPort=$Port,UserIdGroupPairs=[{GroupId=$DestinationGroupId}]"
  $result = Invoke-AwsCapture @(
    "ec2", "authorize-security-group-egress",
    "--group-id", $GroupId,
    "--ip-permissions", $permission
  )
  if ($result.ExitCode -eq 0) {
    return
  }
  if ($result.Output -match "InvalidPermission.Duplicate") {
    return
  }
  throw $result.Output
}

function Ensure-ProxyRole {
  param([string]$RoleName)

  $roleArn = Try-AwsText @(
    "iam", "get-role",
    "--role-name", $RoleName,
    "--query", "Role.Arn",
    "--output", "text"
  )

  if (-not $roleArn -or $roleArn -eq "None") {
    Write-Host "Creating IAM role $RoleName..."
    $trust = [ordered]@{
      Version = "2012-10-17"
      Statement = @(
        [ordered]@{
          Effect = "Allow"
          Principal = [ordered]@{
            Service = "rds.amazonaws.com"
          }
          Action = "sts:AssumeRole"
        }
      )
    }
    $trustPath = New-TempJsonFile $trust
    try {
      $roleArn = Invoke-AwsText @(
        "iam", "create-role",
        "--role-name", $RoleName,
        "--assume-role-policy-document", "file://$trustPath",
        "--query", "Role.Arn",
        "--output", "text"
      )
    } finally {
      Remove-TempFile $trustPath
    }
  } else {
    Write-Host "Using IAM role $RoleName"
  }

  $accountId = Invoke-AwsText @(
    "sts", "get-caller-identity",
    "--query", "Account",
    "--output", "text"
  )

  $policy = [ordered]@{
    Version = "2012-10-17"
    Statement = @(
      [ordered]@{
        Effect = "Allow"
        Action = @(
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        )
        Resource = "arn:aws:secretsmanager:${Region}:${accountId}:secret:rds-proxy/*"
      },
      [ordered]@{
        Effect = "Allow"
        Action = "kms:Decrypt"
        Resource = "*"
      }
    )
  }

  $policyPath = New-TempJsonFile $policy
  try {
    Invoke-AwsText @(
      "iam", "put-role-policy",
      "--role-name", $RoleName,
      "--policy-name", "QuickBiteRdsProxySecretsAccess",
      "--policy-document", "file://$policyPath"
    ) | Out-Null
  } finally {
    Remove-TempFile $policyPath
  }

  return $roleArn
}

function Get-RdsInstance {
  param([string]$DbInstanceIdentifier)

  $instance = Invoke-AwsJson @(
    "rds", "describe-db-instances",
    "--db-instance-identifier", $DbInstanceIdentifier,
    "--query", "DBInstances[0]",
    "--output", "json"
  )
  if ($null -eq $instance) {
    throw "RDS instance '$DbInstanceIdentifier' was not found."
  }
  if ([string]$instance.Engine -ne "postgres") {
    throw "RDS instance '$DbInstanceIdentifier' engine is '$($instance.Engine)', expected 'postgres'."
  }
  return $instance
}

function Ensure-ProxyAuthSecret {
  param(
    $ProxyConfig,
    $RdsInstance
  )

  $appSecret = Read-SecretObject ([string]$ProxyConfig.appSecretId)
  $username = Get-PropertyValue $appSecret ([string]$ProxyConfig.usernameKey)
  $password = Get-PropertyValue $appSecret ([string]$ProxyConfig.passwordKey)
  $dbName = Get-PropertyValue $appSecret ([string]$ProxyConfig.databaseKey)

  $payload = [ordered]@{
    username = $username
    password = $password
    engine = "postgres"
    host = [string]$RdsInstance.Endpoint.Address
    port = [int]$RdsInstance.Endpoint.Port
    dbname = $dbName
  }

  $authSecretName = [string]$ProxyConfig.authSecretName
  $existingArn = Try-AwsText @(
    "secretsmanager", "describe-secret",
    "--secret-id", $authSecretName,
    "--query", "ARN",
    "--output", "text"
  )

  $payloadPath = New-TempJsonFile $payload
  try {
    if ($existingArn -and $existingArn -ne "None") {
      Write-Host "Updating proxy auth secret $authSecretName"
      Invoke-AwsText @(
        "secretsmanager", "put-secret-value",
        "--secret-id", $authSecretName,
        "--secret-string", "file://$payloadPath",
        "--query", "ARN",
        "--output", "text"
      ) | Out-Null
      return $existingArn
    }

    Write-Host "Creating proxy auth secret $authSecretName"
    return Invoke-AwsText @(
      "secretsmanager", "create-secret",
      "--name", $authSecretName,
      "--description", "RDS Proxy auth for $($ProxyConfig.dbInstanceIdentifier)",
      "--secret-string", "file://$payloadPath",
      "--query", "ARN",
      "--output", "text"
    )
  } finally {
    Remove-TempFile $payloadPath
  }
}

function Get-DbProxy {
  param([string]$ProxyName)

  $text = Try-AwsText @(
    "rds", "describe-db-proxies",
    "--db-proxy-name", $ProxyName,
    "--query", "DBProxies[0]",
    "--output", "json"
  )
  if ([string]::IsNullOrWhiteSpace($text) -or $text -eq "None" -or $text -eq "null") {
    return $null
  }
  return $text | ConvertFrom-Json
}

function Ensure-DbProxy {
  param(
    [string]$ProxyName,
    [string]$AuthSecretArn,
    [string]$RoleArn,
    [string[]]$SubnetIds,
    [string]$ProxySecurityGroupId
  )

  $existing = Get-DbProxy $ProxyName
  if ($null -ne $existing) {
    Write-Host "Using RDS Proxy $ProxyName"
    return [string]$existing.Endpoint
  }

  Write-Host "Creating RDS Proxy $ProxyName..."
  $authEntry = [ordered]@{
    Description = "QuickBite RDS Proxy auth for $ProxyName"
    AuthScheme = "SECRETS"
    SecretArn = $AuthSecretArn
    IAMAuth = "DISABLED"
  }
  if ($PostgresClientPasswordAuthType) {
    $authEntry["ClientPasswordAuthType"] = $PostgresClientPasswordAuthType
  }

  $authPath = New-TempJsonFile $authEntry -AsArray
  try {
    $args = @(
      "rds", "create-db-proxy",
      "--db-proxy-name", $ProxyName,
      "--engine-family", "POSTGRESQL",
      "--auth", "file://$authPath",
      "--role-arn", $RoleArn,
      "--vpc-security-group-ids", $ProxySecurityGroupId,
      "--require-tls",
      "--idle-client-timeout", "1800",
      "--tags", "Key=App,Value=QuickBite", "Key=ManagedBy,Value=create-rds-proxies.ps1",
      "--query", "DBProxy.Endpoint",
      "--output", "text",
      "--vpc-subnet-ids"
    ) + $SubnetIds

    return Invoke-AwsText $args
  } finally {
    Remove-TempFile $authPath
  }
}

function Ensure-ProxyTarget {
  param(
    [string]$ProxyName,
    [string]$DbInstanceIdentifier
  )

  Write-Host "Registering target $DbInstanceIdentifier with proxy $ProxyName..."
  $result = Invoke-AwsCapture @(
    "rds", "register-db-proxy-targets",
    "--db-proxy-name", $ProxyName,
    "--target-group-name", "default",
    "--db-instance-identifiers", $DbInstanceIdentifier
  )
  if ($result.ExitCode -eq 0) {
    return
  }
  if ($result.Output -match "already|Already|DBProxyTargetAlreadyRegistered") {
    return
  }
  throw $result.Output
}

function Configure-ProxyTargetGroup {
  param([string]$ProxyName)

  $poolConfig = "MaxConnectionsPercent=$MaxConnectionsPercent,MaxIdleConnectionsPercent=$MaxIdleConnectionsPercent,ConnectionBorrowTimeout=$ConnectionBorrowTimeout"
  Invoke-AwsText @(
    "rds", "modify-db-proxy-target-group",
    "--db-proxy-name", $ProxyName,
    "--target-group-name", "default",
    "--connection-pool-config", $poolConfig,
    "--query", "DBProxyTargetGroup.TargetGroupName",
    "--output", "text"
  ) | Out-Null
}

function Wait-DbProxyAvailable {
  param(
    [string]$ProxyName,
    [int]$TimeoutSeconds = 1800
  )

  $deadline = [DateTime]::UtcNow.AddSeconds($TimeoutSeconds)
  while ([DateTime]::UtcNow -lt $deadline) {
    $proxy = Get-DbProxy $ProxyName
    $status = if ($null -eq $proxy) { "missing" } else { [string]$proxy.Status }
    Write-Host "Proxy $ProxyName status: $status"
    if ($status -eq "available") {
      return
    }
    Start-Sleep -Seconds 15
  }
  throw "Timed out waiting for proxy '$ProxyName' to become available."
}

function Wait-ProxyTargetsAvailable {
  param(
    [string]$ProxyName,
    [int]$TimeoutSeconds = 1800
  )

  $deadline = [DateTime]::UtcNow.AddSeconds($TimeoutSeconds)
  while ([DateTime]::UtcNow -lt $deadline) {
    $targets = Invoke-AwsJson @(
      "rds", "describe-db-proxy-targets",
      "--db-proxy-name", $ProxyName,
      "--target-group-name", "default",
      "--output", "json"
    )
    $states = @($targets.Targets | ForEach-Object { [string]$_.TargetHealth.State })
    $stateText = if ($states.Count -gt 0) { $states -join "," } else { "none" }
    Write-Host "Proxy $ProxyName target states: $stateText"

    if ($states.Count -gt 0 -and (@($states | Where-Object { $_ -ne "AVAILABLE" }).Count -eq 0)) {
      return
    }
    Start-Sleep -Seconds 15
  }
  throw "Timed out waiting for proxy '$ProxyName' targets to become available."
}

function Add-SecretHostUpdate {
  param(
    [hashtable]$UpdatesBySecret,
    [string]$SecretId,
    [string]$HostKey,
    [string]$Endpoint
  )

  if (-not $UpdatesBySecret.ContainsKey($SecretId)) {
    $UpdatesBySecret[$SecretId] = [ordered]@{}
  }
  $UpdatesBySecret[$SecretId][$HostKey] = $Endpoint
}

function Apply-SecretHostUpdates {
  param([hashtable]$UpdatesBySecret)

  foreach ($secretId in $UpdatesBySecret.Keys) {
    Write-Host "Updating DB host keys in secret $secretId..."
    $secret = Read-SecretObject $secretId
    foreach ($key in $UpdatesBySecret[$secretId].Keys) {
      Set-PropertyValue $secret $key ([string]$UpdatesBySecret[$secretId][$key])
      Write-Host "  $key = $($UpdatesBySecret[$secretId][$key])"
    }
    Write-SecretObject $secretId $secret
  }
}

function Restart-EcsService {
  param([string]$ServiceName)

  if (-not $ServiceName) {
    return
  }
  Write-Host "Forcing new ECS deployment for $ServiceName..."
  Invoke-AwsText @(
    "ecs", "update-service",
    "--cluster", $Cluster,
    "--service", $ServiceName,
    "--force-new-deployment",
    "--query", "service.serviceArn",
    "--output", "text"
  ) | Out-Null
}

$ecsVpcId = Get-SecurityGroupVpc $EcsSecurityGroupId
$roleArn = Ensure-ProxyRole $ProxyRoleName
$proxySgByVpc = @{}
$hostUpdatesBySecret = @{}
$summary = @()

foreach ($proxyConfig in @($Config.proxies)) {
  $logicalName = [string]$proxyConfig.logicalName
  $proxyName = [string]$proxyConfig.proxyName
  $dbInstanceIdentifier = [string]$proxyConfig.dbInstanceIdentifier

  Write-Host ""
  Write-Host "== $logicalName ($dbInstanceIdentifier -> $proxyName) =="

  $rds = Get-RdsInstance $dbInstanceIdentifier
  $vpcId = [string]$rds.DBSubnetGroup.VpcId
  $port = [int]$rds.Endpoint.Port
  if ($vpcId -ne $ecsVpcId) {
    throw "RDS instance '$dbInstanceIdentifier' is in VPC '$vpcId', but ECS SG '$EcsSecurityGroupId' is in VPC '$ecsVpcId'."
  }

  $subnetIds = @($rds.DBSubnetGroup.Subnets | ForEach-Object { [string]$_.SubnetIdentifier })
  if ($subnetIds.Count -lt 2) {
    throw "RDS instance '$dbInstanceIdentifier' subnet group has fewer than 2 subnets. RDS Proxy requires multiple subnets."
  }

  if (-not $proxySgByVpc.ContainsKey($vpcId)) {
    $proxySgByVpc[$vpcId] = Ensure-ProxySecurityGroup $vpcId
  }
  $proxySgId = [string]$proxySgByVpc[$vpcId]

  Ensure-IngressFromSecurityGroup $proxySgId $EcsSecurityGroupId $port

  foreach ($rdsSg in @($rds.VpcSecurityGroups | ForEach-Object { [string]$_.VpcSecurityGroupId })) {
    Ensure-IngressFromSecurityGroup $rdsSg $proxySgId $port
    Ensure-EgressToSecurityGroup $proxySgId $rdsSg $port
  }

  $authSecretArn = Ensure-ProxyAuthSecret $proxyConfig $rds
  $endpoint = Ensure-DbProxy $proxyName $authSecretArn $roleArn $subnetIds $proxySgId
  Ensure-ProxyTarget $proxyName $dbInstanceIdentifier
  Configure-ProxyTargetGroup $proxyName

  if ($Wait -or $ApplySecretHostUpdates) {
    Wait-DbProxyAvailable $proxyName
    Wait-ProxyTargetsAvailable $proxyName
    $proxy = Get-DbProxy $proxyName
    $endpoint = [string]$proxy.Endpoint
  }

  Add-SecretHostUpdate $hostUpdatesBySecret ([string]$proxyConfig.appSecretId) ([string]$proxyConfig.hostKey) $endpoint

  $summary += [pscustomobject]@{
    Name = $logicalName
    Proxy = $proxyName
    Target = $dbInstanceIdentifier
    Endpoint = $endpoint
    HostSecret = "$($proxyConfig.appSecretId).$($proxyConfig.hostKey)"
  }
}

Write-Host ""
Write-Host "RDS Proxy endpoints:"
$summary | Format-Table -AutoSize | Out-String | Write-Host

if ($ApplySecretHostUpdates) {
  Apply-SecretHostUpdates $hostUpdatesBySecret
} else {
  Write-Host "Secret host values were not changed. Re-run with -ApplySecretHostUpdates after verification."
}

if ($RedeployEcsServices) {
  Restart-EcsService $CoreService
  Restart-EcsService $OrderService
} else {
  Write-Host "ECS services were not redeployed. Re-run with -ApplySecretHostUpdates -RedeployEcsServices to switch running tasks."
}
