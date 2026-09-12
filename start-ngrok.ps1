Write-Host "=== IELTS ngrok (public link) ===" -ForegroundColor Green
Write-Host "Frontend 5173 + Backend 4000 ni public qilamiz..." -ForegroundColor Gray

# 1. Backend va Frontend ishlayotganini tekshirish
$be = netstat -ano | findstr :4000
$fe = netstat -ano | findstr :5173
if (-not $be) { Write-Host "Backend 4000 ishlamayapti! Avval .\.venv\Scripts\python.exe -m uvicorn backend.app.main:app --host 0.0.0.0 --port 4000 --reload ni ishga tushiring" -ForegroundColor Red; exit 1 }
if (-not $fe) { Write-Host "Frontend 5173 ishlamayapti! npm run dev -- --host ni ishga tushiring" -ForegroundColor Red; exit 1 }

Write-Host "Ikkalasi ham ishlayapti, ngrok boshlanmoqda..." -ForegroundColor Green
Write-Host ""
Write-Host "2 ta alohida PowerShell oynada quyidagilarni ishga tushiring:" -ForegroundColor Yellow
Write-Host "  Terminal 1 (backend):  ngrok http 4000 --log stdout" -ForegroundColor Cyan
Write-Host "  Terminal 2 (frontend): ngrok http 5173 --log stdout" -ForegroundColor Cyan
Write-Host ""
Write-Host "YOKI bitta komandada (ngrok-ielts.yml orqali):" -ForegroundColor Yellow
Write-Host "  ngrok start --all --config ngrok-ielts.yml" -ForegroundColor Cyan
Write-Host ""
Write-Host "Ngrok sizga 2 ta public link beradi, masalan:" -ForegroundColor Gray
Write-Host "  Backend:  https://a1b2-...ngrok-free.app" -ForegroundColor Gray
Write-Host "  Frontend: https://c3d4-...ngrok-free.app" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Backend linkini .env ga qo'ying:" -ForegroundColor Yellow
Write-Host '  VITE_API_URL=https://a1b2-...ngrok-free.app' -ForegroundColor White
Write-Host "  Keyin frontend ni restart: Ctrl+C -> npm run dev -- --host" -ForegroundColor White
Write-Host ""
Write-Host "4. Endi istalgan deviceda frontend ngrok linki orqali kiring — akkauntlar real DB dan ishlaydi" -ForegroundColor Green
Write-Host ""
Write-Host "API ni tekshirish:" -ForegroundColor Gray
Write-Host "  https://a1b2-...ngrok-free.app/api/health  -> {ok:true}" -ForegroundColor Gray
Write-Host ""
# Avtomatik ishga tushirish (ixtiyoriy)
$choice = Read-Host "Hozir avtomatik ngrok ni ishga tushirey mi? (y/n)"
if ($choice -eq "y") {
  Start-Process powershell -ArgumentList "-NoExit", "-Command", "ngrok http 4000"
  Start-Process powershell -ArgumentList "-NoExit", "-Command", "ngrok http 5173"
  Write-Host "2 ta yangi oyna ochildi, linklarni u yerdan oling" -ForegroundColor Green
}
