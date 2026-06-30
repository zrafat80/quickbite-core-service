@echo off
setlocal

aws iam update-assume-role-policy --profile quickbite --role-name github_deployment --policy-document file://deploy/github-deployment-trust-policy.json
if errorlevel 1 exit /b %errorlevel%

aws iam put-role-policy --profile quickbite --role-name github_deployment --policy-name QuickBiteGithubDeployment --policy-document file://deploy/github-deployment-permissions-policy.json
if errorlevel 1 exit /b %errorlevel%

echo github_deployment role is ready for GitHub Actions.
