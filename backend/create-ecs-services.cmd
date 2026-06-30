@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy\create-ecs-services.ps1"
