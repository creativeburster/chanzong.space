@echo off
chcp 65001 >nul
title 禅宗知识库 - 自动化登录平台

echo ========================================================
echo   禅宗知识库 (chanzong.space) 自动化专属纯净浏览器
echo ========================================================
echo.
echo 正在为您在屏幕中央弹出知乎登录窗口...
echo.

start "" "msedge.exe" --user-data-dir="%~dp0tools\backlinks\.browser_profile" --new-window "https://www.zhihu.com/signin"

echo [OK] 浏览器窗口已成功在桌面弹出！
echo.
echo 请在弹出的知乎窗口中完成扫码或验证码登录。
echo 登录完成后，直接关闭该浏览器窗口即可（Cookies 会自动永久保存）。
echo.
pause

