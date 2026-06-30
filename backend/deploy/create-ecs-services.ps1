param(
  [string]$Profile = "quickbite",
  [string]$Region = "eu-north-1",
  [string]$Cluster = "quickbite-1",
  [string]$VpcName = "quickbite-vpc",
  [string]$AlbName = "quickbite-alb",
  [string]$AlbSecurityGroupName = "alb-sg",
  [string]$EcsSecurityGroupName = "ecs-sg",
  [ValidateSet("ENABLED", "DISABLED")]
  [string]$AssignPublicIp = "DISABLED",
  [switch]$RegisterTaskDefs
)

$ErrorActionPreference = "Stop"

$BackendDir = Split-Path -Parent $PSScriptRoot
$TaskDefDir = Join-Path $PSScriptRoot "taskdefs"

function Invoke-AwsText {
  param([string[]]$AwsArgs)
  $out = & aws @AwsArgs
  if ($LASTEXITCODE -ne 0) {
    throw "aws $($AwsArgs -join ' ') failed"
  }
  return (($out | Out-String).Trim())
}

function Invoke-AwsJson {
  param([string[]]$AwsArgs)
  $text = Invoke-AwsText $AwsArgs
  if ([string]::IsNullOrWhiteSpace($text)) {
    return $null
  }
  return $text | ConvertFrom-Json
}

function Try-AwsText {
  param([string[]]$AwsArgs)

  # Temporarily turn off the strict crash rules just for this check
  $oldPreference = $ErrorActionPreference
  $ErrorActionPreference = "SilentlyContinue"

  $out = & aws @AwsArgs 2>$null

  # Turn the strict rules back on immediately
  $ErrorActionPreference = $oldPreference

  if ($LASTEXITCODE -ne 0) {
    return $null
  }
  return (($out | Out-String).Trim())
}

function Invoke-AwsCapture {
  param([string[]]$AwsArgs)
  $oldPreference = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  $out = & aws @AwsArgs 2>&1
  $exitCode = $LASTEXITCODE
  $ErrorActionPreference = $oldPreference
  return [pscustomobject]@{
    ExitCode = $exitCode
    Output = (($out | Out-String).Trim())
  }
}
function Get-TagValue {
  param($Resource, [string]$Key)
  $tag = @($Resource.Tags | Where-Object { $_.Key -eq $Key } | Select-Object -First 1)
  if ($tag.Count -eq 0) {
    return ""
  }
  return [string]$tag[0].Value
}

function Register-TaskDef {
  param([string]$FileName)
  Write-Host "Registering $FileName..."
  return Invoke-AwsText @(
    "ecs", "register-task-definition",
    "--profile", $Profile,
    "--region", $Region,
    "--cli-input-json", "file://deploy/taskdefs/$FileName",
    "--query", "taskDefinition.taskDefinitionArn",
    "--output", "text"
  )
}

function Get-LatestTaskDef {
  param([string]$Family)
  Write-Host "Using latest existing task definition for $Family..."
  $arnOutput = Invoke-AwsText @(
    "ecs", "list-task-definitions",
    "--profile", $Profile,
    "--region", $Region,
    "--family-prefix", $Family,
    "--status", "ACTIVE",
    "--sort", "DESC",
    "--max-items", "1",
    "--query", "taskDefinitionArns[0]",
    "--output", "text"
  )

  # AWS CLI quirk: It appends "None" on a new line as a pagination token.
  # We split the output by newline and strictly grab only the first line (the actual ARN).
  $arn = ($arnOutput -split "`n")[0].Trim()

  if (-not $arn -or $arn -eq "None") {
    throw "No active task definition found for family '$Family'. Register it first or run with -RegisterTaskDefs."
  }
  return $arn
}

function Resolve-TaskDef {
  param(
    [string]$Family,
    [string]$FileName
  )
  if ($RegisterTaskDefs) {
    return Register-TaskDef $FileName
  }
  return Get-LatestTaskDef $Family
}

function Ensure-TargetGroup {
  param(
    [string]$Name,
    [string]$VpcId,
    [string]$HealthPath
  )

  $existing = Try-AwsText @(
    "elbv2", "describe-target-groups",
    "--profile", $Profile,
    "--region", $Region,
    "--names", $Name,
    "--query", "TargetGroups[0].TargetGroupArn",
    "--output", "text"
  )
  if ($existing -and $existing -ne "None") {
    Write-Host "Using target group $Name"
    return $existing
  }

  Write-Host "Creating target group $Name..."
  return Invoke-AwsText @(
    "elbv2", "create-target-group",
    "--profile", $Profile,
    "--region", $Region,
    "--name", $Name,
    "--protocol", "HTTP",
    "--port", "3000",
    "--vpc-id", $VpcId,
    "--target-type", "ip",
    "--health-check-protocol", "HTTP",
    "--health-check-path", $HealthPath,
    "--matcher", "HttpCode=200-399",
    "--query", "TargetGroups[0].TargetGroupArn",
    "--output", "text"
  )
}

function Ensure-Alb {
  param(
    [string]$Name,
    [string[]]$PublicSubnetIds,
    [string]$AlbSgId
  )

  $existing = Try-AwsText @(
    "elbv2", "describe-load-balancers",
    "--profile", $Profile,
    "--region", $Region,
    "--names", $Name,
    "--query", "LoadBalancers[0].LoadBalancerArn",
    "--output", "text"
  )
  if ($existing -and $existing -ne "None") {
    Write-Host "Using ALB $Name"
    return $existing
  }

  Write-Host "Creating ALB $Name..."
  $args = @(
    "elbv2", "create-load-balancer",
    "--profile", $Profile,
    "--region", $Region,
    "--name", $Name,
    "--type", "application",
    "--scheme", "internet-facing",
    "--security-groups", $AlbSgId,
    "--query", "LoadBalancers[0].LoadBalancerArn",
    "--output", "text",
    "--subnets"
  ) + $PublicSubnetIds

  $arn = Invoke-AwsText $args
  & aws elbv2 wait load-balancer-available --profile $Profile --region $Region --load-balancer-arns $arn
  if ($LASTEXITCODE -ne 0) {
    throw "ALB did not become available"
  }
  return $arn
}

function Ensure-HttpListener {
  param(
    [string]$AlbArn,
    [string]$DefaultTargetGroupArn
  )

  $listeners = Invoke-AwsJson @(
    "elbv2", "describe-listeners",
    "--profile", $Profile,
    "--region", $Region,
    "--load-balancer-arn", $AlbArn,
    "--output", "json"
  )

  $listener = @($listeners.Listeners | Where-Object { $_.Port -eq 80 } | Select-Object -First 1)
  if ($listener.Count -gt 0) {
    Write-Host "Using HTTP listener :80"
    return $listener[0].ListenerArn
  }

  Write-Host "Creating HTTP listener :80..."
  return Invoke-AwsText @(
    "elbv2", "create-listener",
    "--profile", $Profile,
    "--region", $Region,
    "--load-balancer-arn", $AlbArn,
    "--protocol", "HTTP",
    "--port", "80",
    "--default-actions", "Type=forward,TargetGroupArn=$DefaultTargetGroupArn",
    "--query", "Listeners[0].ListenerArn",
    "--output", "text"
  )
}

function Ensure-ListenerRule {
  param(
    [string]$ListenerArn,
    [string]$TargetGroupArn,
    [int]$Priority,
    [string[]]$PathValues
  )

  $rules = Invoke-AwsJson @(
    "elbv2", "describe-rules",
    "--profile", $Profile,
    "--region", $Region,
    "--listener-arn", $ListenerArn,
    "--output", "json"
  )

  $firstPath = $PathValues[0]
  $existing = @(
    $rules.Rules | Where-Object {
      $conditionValues = @()
      foreach ($condition in @($_.Conditions | Where-Object { $_.Field -eq "path-pattern" })) {
        if ($condition.Values) {
          $conditionValues += @($condition.Values)
        }
        if ($condition.PathPatternConfig -and $condition.PathPatternConfig.Values) {
          $conditionValues += @($condition.PathPatternConfig.Values)
        }
      }
      ($_.Actions | Where-Object { $_.TargetGroupArn -eq $TargetGroupArn }) -and
      ($conditionValues -contains $firstPath)
    } | Select-Object -First 1
  )
  if ($existing.Count -gt 0) {
    Write-Host "Using listener rule for $firstPath"
    return
  }

  $safeName = ($PathValues[0] -replace "[^A-Za-z0-9_-]", "_").Trim("_")
  $inputLeaf = "rule-input-$Priority-$safeName.json"
  $inputPath = Join-Path $PSScriptRoot $inputLeaf
  $inputCliPath = "file://deploy/$inputLeaf"

  $priorityToTry = $Priority
  while ($true) {
    Write-Host "Creating listener rule priority $priorityToTry for $($PathValues -join ', ')..."
    $inputJson = [ordered]@{
      ListenerArn = $ListenerArn
      Priority = $priorityToTry
      Conditions = @(
        [ordered]@{
          Field = "path-pattern"
          PathPatternConfig = [ordered]@{
            Values = $PathValues
          }
        }
      )
      Actions = @(
        [ordered]@{
          Type = "forward"
          TargetGroupArn = $TargetGroupArn
        }
      )
    } | ConvertTo-Json -Depth 20 -Compress
    [System.IO.File]::WriteAllText($inputPath, $inputJson, [System.Text.UTF8Encoding]::new($false))

    $result = Invoke-AwsCapture @(
      "elbv2", "create-rule",
      "--profile", $Profile,
      "--region", $Region,
      "--cli-input-json", $inputCliPath,
      "--query", "Rules[0].RuleArn",
      "--output", "text"
    )
    if ($result.ExitCode -eq 0) {
      return
    }
    if ($result.Output -notmatch "PriorityInUse") {
      throw $result.Output
    }
    $priorityToTry++
  }
}

function Ensure-EcsCluster {
  param([string]$ClusterName)
  Write-Host "Ensuring ECS cluster '$ClusterName' exists..."
  Invoke-AwsText @(
    "ecs", "create-cluster",
    "--profile", $Profile,
    "--region", $Region,
    "--cluster-name", $ClusterName,
    "--query", "cluster.clusterName",
    "--output", "text"
  ) | Out-Null
}

function Ensure-EcsService {
  param(
    [string]$ServiceName,
    [string]$TaskDefinitionArn,
    [int]$DesiredCount,
    [string[]]$PrivateSubnetIds,
    [string]$EcsSgId,
    [string]$ContainerName,
    [string]$TargetGroupArn = ""
  )

  $network = "awsvpcConfiguration={subnets=[$($PrivateSubnetIds -join ',')],securityGroups=[$EcsSgId],assignPublicIp=$AssignPublicIp}"
  $desc = Invoke-AwsJson @(
    "ecs", "describe-services",
    "--profile", $Profile,
    "--region", $Region,
    "--cluster", $Cluster,
    "--services", $ServiceName,
    "--output", "json"
  )
  $exists = @($desc.Services | Where-Object { $_.serviceName -eq $ServiceName -and $_.status -ne "INACTIVE" }).Count -gt 0

  if ($TargetGroupArn) {
    $lb = "targetGroupArn=$TargetGroupArn,containerName=$ContainerName,containerPort=3000"
    if ($exists) {
      Write-Host "Updating ECS service $ServiceName..."
      Invoke-AwsText @(
        "ecs", "update-service",
        "--profile", $Profile,
        "--region", $Region,
        "--cluster", $Cluster,
        "--service", $ServiceName,
        "--task-definition", $TaskDefinitionArn,
        "--desired-count", "$DesiredCount",
        "--network-configuration", $network,
        "--load-balancers", $lb,
        "--health-check-grace-period-seconds", "120",
        "--force-new-deployment",
        "--query", "service.serviceArn",
        "--output", "text"
      ) | Out-Null
    } else {
      Write-Host "Creating ECS service $ServiceName..."
      Invoke-AwsText @(
        "ecs", "create-service",
        "--profile", $Profile,
        "--region", $Region,
        "--cluster", $Cluster,
        "--service-name", $ServiceName,
        "--task-definition", $TaskDefinitionArn,
        "--desired-count", "$DesiredCount",
        "--launch-type", "FARGATE",
        "--network-configuration", $network,
        "--load-balancers", $lb,
        "--health-check-grace-period-seconds", "120",
        "--query", "service.serviceArn",
        "--output", "text"
      ) | Out-Null
    }
  } else {
    if ($exists) {
      Write-Host "Updating ECS worker service $ServiceName..."
      Invoke-AwsText @(
        "ecs", "update-service",
        "--profile", $Profile,
        "--region", $Region,
        "--cluster", $Cluster,
        "--service", $ServiceName,
        "--task-definition", $TaskDefinitionArn,
        "--desired-count", "$DesiredCount",
        "--network-configuration", $network,
        "--force-new-deployment",
        "--query", "service.serviceArn",
        "--output", "text"
      ) | Out-Null
    } else {
      Write-Host "Creating ECS worker service $ServiceName..."
      Invoke-AwsText @(
        "ecs", "create-service",
        "--profile", $Profile,
        "--region", $Region,
        "--cluster", $Cluster,
        "--service-name", $ServiceName,
        "--task-definition", $TaskDefinitionArn,
        "--desired-count", "$DesiredCount",
        "--launch-type", "FARGATE",
        "--network-configuration", $network,
        "--query", "service.serviceArn",
        "--output", "text"
      ) | Out-Null
    }
  }
}

function Configure-ApiAutoscaling {
  param([string]$ServiceName)
  $resourceId = "service/$Cluster/$ServiceName"
  Write-Host "Configuring autoscaling for $ServiceName..."
  Invoke-AwsText @(
    "application-autoscaling", "register-scalable-target",
    "--profile", $Profile,
    "--region", $Region,
    "--service-namespace", "ecs",
    "--resource-id", $resourceId,
    "--scalable-dimension", "ecs:service:DesiredCount",
    "--min-capacity", "2",
    "--max-capacity", "6"
  ) | Out-Null

  Invoke-AwsText @(
    "application-autoscaling", "put-scaling-policy",
    "--profile", $Profile,
    "--region", $Region,
    "--service-namespace", "ecs",
    "--resource-id", $resourceId,
    "--scalable-dimension", "ecs:service:DesiredCount",
    "--policy-name", "$ServiceName-cpu-60",
    "--policy-type", "TargetTrackingScaling",
    "--target-tracking-scaling-policy-configuration", "PredefinedMetricSpecification={PredefinedMetricType=ECSServiceAverageCPUUtilization},TargetValue=60.0,ScaleOutCooldown=60,ScaleInCooldown=120",
    "--query", "PolicyARN",
    "--output", "text"
  ) | Out-Null
}

Push-Location $BackendDir
try {
  if (-not (Test-Path $TaskDefDir)) {
    throw "Missing task definition directory: $TaskDefDir"
  }

  Write-Host "Discovering VPC and networking..."
  $VpcId = Invoke-AwsText @(
    "ec2", "describe-vpcs",
    "--profile", $Profile,
    "--region", $Region,
    "--filters", "Name=tag:Name,Values=$VpcName",
    "--query", "Vpcs[0].VpcId",
    "--output", "text"
  )
  if (-not $VpcId -or $VpcId -eq "None") {
    throw "VPC named '$VpcName' not found."
  }

  $AlbSgId = Invoke-AwsText @(
    "ec2", "describe-security-groups",
    "--profile", $Profile,
    "--region", $Region,
    "--filters", "Name=vpc-id,Values=$VpcId", "Name=group-name,Values=$AlbSecurityGroupName",
    "--query", "SecurityGroups[0].GroupId",
    "--output", "text"
  )
  if (-not $AlbSgId -or $AlbSgId -eq "None") {
    throw "Security group '$AlbSecurityGroupName' not found in VPC $VpcId."
  }

  $EcsSgId = Invoke-AwsText @(
    "ec2", "describe-security-groups",
    "--profile", $Profile,
    "--region", $Region,
    "--filters", "Name=vpc-id,Values=$VpcId", "Name=group-name,Values=$EcsSecurityGroupName",
    "--query", "SecurityGroups[0].GroupId",
    "--output", "text"
  )
  if (-not $EcsSgId -or $EcsSgId -eq "None") {
    throw "Security group '$EcsSecurityGroupName' not found in VPC $VpcId."
  }

  $subnetResponse = Invoke-AwsJson @(
    "ec2", "describe-subnets",
    "--profile", $Profile,
    "--region", $Region,
    "--filters", "Name=vpc-id,Values=$VpcId",
    "--output", "json"
  )
  $privateSubnets = @(
    $subnetResponse.Subnets |
      Where-Object { (Get-TagValue $_ "Name").ToLowerInvariant().Contains("private") } |
      Sort-Object AvailabilityZone |
      Select-Object -ExpandProperty SubnetId
  )
  $publicSubnets = @(
    $subnetResponse.Subnets |
      Where-Object { (Get-TagValue $_ "Name").ToLowerInvariant().Contains("public") } |
      Sort-Object AvailabilityZone |
      Select-Object -ExpandProperty SubnetId
  )

  if ($privateSubnets.Count -lt 2) {
    throw "Expected at least 2 private subnets tagged with 'private'. Found: $($privateSubnets -join ', ')"
  }
  if ($publicSubnets.Count -lt 2) {
    throw "Expected at least 2 public subnets tagged with 'public'. Found: $($publicSubnets -join ', ')"
  }
  $privateSubnets = @($privateSubnets | Select-Object -First 2)
  $publicSubnets = @($publicSubnets | Select-Object -First 2)

  $coreTask = Resolve-TaskDef "core-service" "core-service-taskdef.json"
  $orderTask = Resolve-TaskDef "order-service" "order-service-taskdef.json"
  $analyticsTask = Resolve-TaskDef "analytics-service" "analytics-service-taskdef.json"
  $coreWorkerTask = Resolve-TaskDef "core-worker" "core-worker-taskdef.json"

  $coreTg = Ensure-TargetGroup "quickbite-core-service" $VpcId "/api/health"
  $orderTg = Ensure-TargetGroup "quickbite-order-service" $VpcId "/api/health"
  $analyticsTg = Ensure-TargetGroup "quickbite-analytics-service" $VpcId "/health"

  $albArn = Ensure-Alb $AlbName $publicSubnets $AlbSgId
  $listenerArn = Ensure-HttpListener $albArn $coreTg
  Ensure-ListenerRule $listenerArn $analyticsTg 10 @("/api/v1*")
  Ensure-ListenerRule $listenerArn $orderTg 20 @("/api/orders*", "/api/customer/orders*", "/api/agents/*", "/api/payments/*", "/api/admin/orders/*")
  Ensure-ListenerRule $listenerArn $orderTg 21 @("/api/restaurants/*/orders*", "/api/restaurants/*/balance", "/api/restaurants/*/payouts*")
  Ensure-ListenerRule $listenerArn $orderTg 22 @("/api/restaurants/*/payments/*", "/api/restaurants/*/branches/*/orders*")
  Ensure-ListenerRule $listenerArn $orderTg 23 @("/ws*")

  # NEW: Make sure the cluster exists before creating services inside it!
  Ensure-EcsCluster $Cluster

  Ensure-EcsService "core-service" $coreTask 2 $privateSubnets $EcsSgId "core-service" $coreTg
  Ensure-EcsService "order-service" $orderTask 2 $privateSubnets $EcsSgId "order-service" $orderTg
  Ensure-EcsService "analytics-service" $analyticsTask 2 $privateSubnets $EcsSgId "analytics-service" $analyticsTg
  Ensure-EcsService "core-worker" $coreWorkerTask 1 $privateSubnets $EcsSgId "core-worker"

  Configure-ApiAutoscaling "core-service"
  Configure-ApiAutoscaling "order-service"
  Configure-ApiAutoscaling "analytics-service"

  $albDns = Invoke-AwsText @(
    "elbv2", "describe-load-balancers",
    "--profile", $Profile,
    "--region", $Region,
    "--load-balancer-arns", $albArn,
    "--query", "LoadBalancers[0].DNSName",
    "--output", "text"
  )

  Write-Host ""
  Write-Host "Created/updated Phase 9 services."
  Write-Host "ALB DNS: http://$albDns"
  Write-Host "Skipped order-worker: this repo has no dist/worker.js entrypoint."
} finally {
  Pop-Location
}