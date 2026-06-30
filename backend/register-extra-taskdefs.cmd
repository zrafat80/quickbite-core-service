@echo off
setlocal
set PROFILE=quickbite
set REGION=eu-north-1

pushd "%~dp0deploy" >nul

for %%F in (
  taskdefs\core-service-taskdef.json
  taskdefs\order-service-taskdef.json
  taskdefs\analytics-service-taskdef.json
  taskdefs\core-worker-taskdef.json
  taskdefs\core-migrate-taskdef.json
  taskdefs\order-migrate-taskdef.json
) do (
  echo Registering %%F
  aws ecs register-task-definition --profile %PROFILE% --region %REGION% --cli-input-json file://%%F --query "taskDefinition.taskDefinitionArn" --output text
  if errorlevel 1 (
    popd >nul
    exit /b 1
  )
)

popd >nul
endlocal
