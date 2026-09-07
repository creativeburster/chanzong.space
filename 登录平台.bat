@echo off
chcp 65001 >nul
title 禅宗知识库 - 自动化专属纯净浏览器

echo ========================================================
echo   禅宗知识库 (chanzong.space) 自动化专属纯净浏览器窗口
echo ========================================================
echo.
echo 正在为您打开与 ZCode 完全一致的 Playwright 纯净 Chromium 窗口...
echo (无任何日常插件、无账号同步、专用于多平台外链自动化)
echo.

set "PROFILE_DIR=%~dp0tools\backlinks\.browser_profile"
set "CHROME_BIN=C:\Users\willp\AppData\Local\ms-playwright\chromium-1228\chrome-win64\chrome.exe"

if exist "%CHROME_BIN%" (
    start "" "%CHROME_BIN%" --user-data-dir="%PROFILE_DIR%" "https://www.zhihu.com/signin" "https://vocus.cc/login"
) else (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --user-data-dir="%PROFILE_DIR%" "https://www.zhihu.com/signin" "https://vocus.cc/login"
)

echo [OK] 专属纯净浏览器窗口已打开！
echo.
echo 请在窗口中完成各平台（知乎、方格子 Vocus 等）的首次登录。
echo 登录完成后，直接关闭浏览器即可。
echo.
pause
