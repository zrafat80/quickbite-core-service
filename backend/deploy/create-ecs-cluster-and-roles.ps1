param(
  [string]$Profile = "quickbite",
  [string]$Region = "eu-north-1",
  [string]$Cluster = "quickbite-1",
  [string]$ExecutionRoleName = "ecsTaskExecutionRole"
)

$ErrorActionPreference = "Stop"

$DeployDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$TrustPolicyPath = Join-Path $DeployDir "ecs-task-trust-policy.json"
$SecretsPolicyPath = Join-Path $DeployDir "ecs-execution-secrets-policy.json"

$trustPolicy = [ordered]@{
  Version = "2012-10-17"
  Statement = @(
    [ordered]@{
      Effect = "Allow"
      Principal = [ordered]@{
        Service = "ecs-tasks.amazonaws.com"
      }
      Action = "sts:AssumeRole"
    }
  )
} | ConvertTo-Json -Depth 10

$secretsPolicy = [ordered]@{
  Version = "2012-10-17"
  Statement = @(
    [ordered]@{
      Effect = "Allow"
      Action = @(
        "secretsmanager:GetSecretValue",
        "kms:Decrypt"
      )
      Resource = "*"
    }
  )
} | ConvertTo-Json -Depth 10

[System.IO.File]::WriteAllText($TrustPolicyPath, $trustPolicy, [System.Text.UTF8Encoding]::new($false))
[System.IO.File]::WriteAllText($SecretsPolicyPath, $secretsPolicy, [System.Text.UTF8Encoding]::new($false))

Write-Host "Ensuring ECS cluster $Cluster..."
$clusterArn = aws ecs describe-clusters `
  --profile $Profile `
  --region $Region `
  --clusters $Cluster `
  --query "clusters[0].clusterArn" `
  --output text 2>$null

if (-not $clusterArn -or $clusterArn -eq "None") {
  $clusterArn = aws ecs create-cluster `
    --profile $Profile `
    --region $Region `
    --cluster-name $Cluster `
    --capacity-providers FARGATE FARGATE_SPOT `
    --default-capacity-provider-strategy capacityProvider=FARGATE,weight=1 `
    --settings name=containerInsights,value=enabled `
    --query "cluster.clusterArn" `
    --output text
}

Write-Host "Ensuring IAM role $ExecutionRoleName..."
$roleArn = aws iam get-role `
  --profile $Profile `
  --role-name $ExecutionRoleName `
  --query "Role.Arn" `
  --output text 2>$null

if (-not $roleArn -or $roleArn -eq "None") {
  $roleArn = aws iam create-role `
    --profile $Profile `
    --role-name $ExecutionRoleName `
    --assume-role-policy-document "file://$TrustPolicyPath" `
    --query "Role.Arn" `
    --output text
}

aws iam attach-role-policy `
  --profile $Profile `
  --role-name $ExecutionRoleName `
  --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy | Out-Null

aws iam put-role-policy `
  --profile $Profile `
  --role-name $ExecutionRoleName `
  --policy-name QuickBiteExecutionSecretsAccess `
  --policy-document "file://$SecretsPolicyPath" | Out-Null

foreach ($group in @(
  "/ecs/core-service",
  "/ecs/order-service",
  "/ecs/analytics-service",
  "/ecs/core-worker",
  "/ecs/core-migrate",
  "/ecs/order-migrate"
)) {
  Write-Host "Ensuring log group $group..."
  aws logs create-log-group `
    --profile $Profile `
    --region $Region `
    --log-group-name $group 2>$null
}

Write-Host "Cluster:        $clusterArn"
Write-Host "Execution role: $roleArn"
