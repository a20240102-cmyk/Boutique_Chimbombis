@echo off
echo ==========================================
echo    INICIANDO BOUTIQUE CHIMBOMBIS
echo ==========================================
echo.
echo 1. Arrancando servidor (Node.js)...
start "SERVIDOR BOUTIQUE" cmd /k "node server.js"
echo.
echo 2. Abriendo tunel a Internet (Ngrok)...
start "PUENTE INTERNET" cmd /k "ngrok http 3000"
echo.
echo ==========================================
echo INSTRUCCIONES:
echo 1. Ve a la ventana negra que dice "PUENTE INTERNET".
echo 2. Copia la direccion que termina en ".ngrok-free.app" (Forwarding).
echo 3. Abre el archivo 'app.js' y pegala donde dice 'baseUrl'.
echo 4. Guarda 'app.js' y recarga tu pagina web.
echo ==========================================
pause
