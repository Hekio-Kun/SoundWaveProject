# ==============================================================================
# SoundWave - Sync Database from Neon Cloud to Local PostgreSQL
# ==============================================================================
$ErrorActionPreference = "Stop"

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "   SoundWave: Dong bo Database tu Neon ve Local" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan

$dumpFile = Join-Path $env:TEMP "soundwave_neon_dump.sql"
$pgBin = "C:\Program Files\PostgreSQL\18\bin"

try {
    Write-Host "`n[1/3] Dang xuat du lieu tu Neon Cloud..." -ForegroundColor Yellow
    $env:PGPASSWORD = "npg_MRTr61SHKwEL"
    & "$pgBin\pg_dump.exe" -h ep-broad-truth-b337hf2b-pooler.c-4.ap-southeast-1.aws.neon.tech `
        -U SoundWave_owner -d SoundWave -p 5432 --no-owner --no-privileges -f $dumpFile
    
    if (-not (Test-Path $dumpFile) -or (Get-Item $dumpFile).Length -lt 1024) {
        throw "Tep dump tu Neon Cloud bi trong hoac bi loi ket noi (do vuot han muc bang thong Neon)! Da tu dong huy thao tac de bao ve an toan tuyet doi cho Local DB."
    }

    Write-Host "[2/3] Dang lam sach Schema public tren Local DB (SoundWaveProject)..." -ForegroundColor Yellow
    $env:PGPASSWORD = "postgres"
    & "$pgBin\psql.exe" -h localhost -U postgres -d SoundWaveProject -p 5432 -q `
        -c "DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO postgres; GRANT ALL ON SCHEMA public TO public;"

    Write-Host "[3/3] Dang nap du lieu vao Local DB..." -ForegroundColor Yellow
    & "$pgBin\psql.exe" -h localhost -U postgres -d SoundWaveProject -p 5432 -q -f $dumpFile

    if (Test-Path $dumpFile) { Remove-Item $dumpFile -Force }

    Write-Host "`n======================================================" -ForegroundColor Green
    Write-Host "   DONG BO HOAN TAT 100% THANH CONG!" -ForegroundColor Green
    Write-Host "   Mo DBeaver ket noi Local va nhan F5 de xem du lieu." -ForegroundColor Green
    Write-Host "======================================================`n" -ForegroundColor Green
} catch {
    Write-Host "`n[LOI] Dong bo that bai: $($_.Exception.Message)" -ForegroundColor Red
}
