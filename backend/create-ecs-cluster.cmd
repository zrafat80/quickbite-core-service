@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy\create-ecs-cluster-and-roles.ps1"
