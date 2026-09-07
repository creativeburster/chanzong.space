@echo off
chcp 65001 >nul
echo 正在启动浏览器，请在弹出的窗口中登录各大平台...
start msedge.exe --user-data-dir="%~dp0.browser_profile" "https://www.zhihu.com/signin" "https://vocus.cc/login"
echo 浏览器已启动！登录完成后关闭窗口即可。
