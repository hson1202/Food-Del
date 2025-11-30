# Script để tắt tất cả backend localhost đang chạy
Write-Host "🔍 Đang tìm các backend đang chạy..." -ForegroundColor Cyan

# Danh sách các port backend thường dùng
$ports = @(3000, 4000, 5000, 8000, 8080)

$killedProcesses = @()

foreach ($port in $ports) {
    # Tìm process đang dùng port
    $connections = netstat -ano | findstr ":$port" | findstr "LISTENING"
    
    if ($connections) {
        foreach ($connection in $connections) {
            # Lấy PID từ output
            $pid = ($connection -split '\s+')[-1]
            
            if ($pid -and $pid -ne "0") {
                try {
                    $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
                    if ($process) {
                        Write-Host "🛑 Đang tắt process trên port $port (PID: $pid)..." -ForegroundColor Yellow
                        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                        $killedProcesses += "Port $port (PID: $pid)"
                        Write-Host "✅ Đã tắt process trên port $port" -ForegroundColor Green
                    }
                } catch {
                    Write-Host "⚠️  Không thể tắt process PID $pid trên port $port" -ForegroundColor Red
                }
            }
        }
    }
}

# Kiểm tra lại
Write-Host "`n🔍 Kiểm tra lại các port..." -ForegroundColor Cyan
$stillRunning = $false
foreach ($port in $ports) {
    $connections = netstat -ano | findstr ":$port" | findstr "LISTENING"
    if ($connections) {
        Write-Host "⚠️  Port $port vẫn đang được sử dụng" -ForegroundColor Red
        $stillRunning = $true
    }
}

if ($killedProcesses.Count -gt 0) {
    Write-Host "`n✅ Đã tắt các process sau:" -ForegroundColor Green
    foreach ($proc in $killedProcesses) {
        Write-Host "   - $proc" -ForegroundColor Gray
    }
} elseif (-not $stillRunning) {
    Write-Host "`n✅ Không có backend nào đang chạy" -ForegroundColor Green
}

Write-Host "`n✨ Hoàn tất!" -ForegroundColor Cyan

