@echo off
chcp 65001 >nul
title Google Flow 视频生成 - 人机协同

echo ========================================================
echo   禅宗知识库 (chanzong.space) x Google Flow (Veo) 视频工作流
echo ========================================================
echo.
echo 正在为您在桌面启动专属浏览器并直达 Google Flow...
echo.

start "" "msedge.exe" --remote-debugging-port=9222 --user-data-dir="%~dp0tools\backlinks\.browser_profile" --new-window "https://labs.google/flow"

echo [OK] 浏览器窗口已在桌面弹出！
echo.
echo --------------------------------------------------------
echo 操作指引：
echo 1. 请在弹出的窗口中登录您的 Google 账号（拥有 AI Pro / Flow 积分）。
echo 2. 登录成功进入 Flow 主界面后，【请保持该窗口打开，不要关闭】。
echo 3. 回到本对话中告诉我一声“我登录好了”或“已登录”。
echo 4. 我会立即通过后台穿透连接该窗口，自动帮您输入 Prompt、调用 Veo 模型生成视频并下载到本地！
echo --------------------------------------------------------
echo.
pause
