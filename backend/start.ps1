Write-Host "PostgreSQL tekshirilmoqda..." -ForegroundColor Green
$pgService = Get-Service -Name "postgresql-x64-18" -ErrorAction SilentlyContinue
if ($pgService -and $pgService.Status -eq "Running") {
    Write-Host "Native PostgreSQL 18 allaqachon 5432 da ishlayapti (docker shart emas)" -ForegroundColor Green
} else {
    Write-Host "PostgreSQL service topilmadi, docker bilan urinib ko'riladi..." -ForegroundColor Yellow
    docker compose -f ../docker-compose.yml --profile docker-db up -d postgres 2>$null
}
Write-Host "Starting FastAPI on http://localhost:4000" -ForegroundColor Green
Write-Host "Docs: http://localhost:4000/docs" -ForegroundColor Cyan
Write-Host "DB: postgresql://postgres:Faxa2000@localhost:5432/ielts_master" -ForegroundColor Gray
..\.venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 4000 --reload
