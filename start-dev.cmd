@echo off
chcp 65001 >nul
set "PATH=C:\node;%PATH%"
cd /d "%~dp0"
title 网站预览 - 关闭窗口即停止
echo.
echo   正在启动本地预览，浏览器会自动打开 http://localhost:5173
echo   停止服务：按 Ctrl + C，或直接关闭本窗口。
echo.
call npm run dev -- --open
echo.
echo   服务已停止。
pause
