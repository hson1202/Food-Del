# ============================================================
# add-soup-option.ps1
# Thêm option "Polievka" (+0,40€) vào các món ăn chỉ định
#
# CÁCH DÙNG:
#   1. Điền token admin vào $TOKEN bên dưới
#   2. Điền SKU của các món cần thêm vào $TARGET_SKUS
#   3. Chạy: .\add-soup-option.ps1
# ============================================================

# ---- CẤU HÌNH ----
$BASE_URL = "http://localhost:4000"
$TOKEN    = "YOUR_ADMIN_TOKEN_HERE"   # <-- thay bằng token thật

# Danh sách SKU các món cần thêm option súp
# Ví dụ: "M001", "M002", "M003"
$TARGET_SKUS = @(
    # "M001",   # Ví dụ: Pad Thai
    # "M002",   # Ví dụ: Bun Cha
    # "M003"    # Ví dụ: Cơm gà
)

# ---- ĐỊNH NGHĨA OPTION SÚP ----
$soupOption = @{
    name             = "Polievka"
    nameSK           = "Polievka"
    nameVI           = "Súp"
    nameEN           = "Soup"
    type             = "select"
    pricingMode      = "add"
    defaultChoiceCode = "none"
    choices          = @(
        @{
            code    = "none"
            label   = "Bez polievky"
            labelSK = "Bez polievky"
            labelVI = "Không thêm súp"
            labelEN = "No soup"
            price   = 0.00
            image   = ""
        },
        @{
            code    = "ostro"
            label   = "Ostrokyslá polievka"
            labelSK = "Ostrokyslá polievka"
            labelVI = "Súp Chua Cay"
            labelEN = "Hot & Sour Soup"
            price   = 0.40
            image   = ""
        },
        @{
            code    = "miso"
            label   = "Miso Shiro polievka"
            labelSK = "Miso Shiro polievka"
            labelVI = "Súp Miso"
            labelEN = "Miso Shiro Soup"
            price   = 0.40
            image   = ""
        }
    )
}

# ---- KIỂM TRA ----
if ($TARGET_SKUS.Count -eq 0) {
    Write-Host ""
    Write-Host "DỪNG: Chưa điền SKU vào `$TARGET_SKUS." -ForegroundColor Yellow
    Write-Host "Mở file này và điền SKU của các món muốn thêm option súp vào." -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

if ($TOKEN -eq "YOUR_ADMIN_TOKEN_HERE") {
    Write-Host ""
    Write-Host "DỪNG: Chưa điền token admin vào `$TOKEN." -ForegroundColor Yellow
    Write-Host "Vào Admin panel -> F12 -> Network -> copy giá trị header 'token'." -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

# ---- LẤY DANH SÁCH TẤT CẢ MÓN ĂN ----
Write-Host ""
Write-Host "Đang lấy danh sách món ăn từ API..." -ForegroundColor Cyan
try {
    $listResponse = Invoke-RestMethod `
        -Uri "$BASE_URL/api/food/list?noPagination=true" `
        -Method Get `
        -Headers @{ "token" = $TOKEN }
    $allFoods = $listResponse.data
    Write-Host "Tìm thấy $($allFoods.Count) món trong database." -ForegroundColor Green
}
catch {
    Write-Host "Lỗi khi lấy danh sách món: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# ---- XỬ LÝ TỪNG SKU ----
$successCount = 0
$failCount    = 0

foreach ($sku in $TARGET_SKUS) {
    Write-Host ""
    Write-Host "--- Đang xử lý SKU: $sku ---" -ForegroundColor Cyan

    # Tìm món theo SKU
    $food = $allFoods | Where-Object { $_.sku -eq $sku } | Select-Object -First 1
    if (-not $food) {
        Write-Host "  SKIP: Không tìm thấy món với SKU '$sku' trong database." -ForegroundColor Yellow
        $failCount++
        continue
    }

    Write-Host "  Tìm thấy: $($food.name) (ID: $($food._id))" -ForegroundColor White

    # Gộp options: giữ nguyên options hiện tại + thêm soupOption (nếu chưa có)
    $existingOptions = @()
    if ($food.options -and $food.options.Count -gt 0) {
        $existingOptions = @($food.options)
        # Kiểm tra đã có option "Polievka" chưa
        $alreadyHasSoup = $existingOptions | Where-Object { $_.name -eq "Polievka" -or $_.name -eq "Soup" }
        if ($alreadyHasSoup) {
            Write-Host "  SKIP: Món này đã có option Polievka rồi." -ForegroundColor Yellow
            continue
        }
    }

    $newOptions = $existingOptions + @($soupOption)

    # Stringify options thành JSON string (API yêu cầu dạng string)
    $optionsJson = $newOptions | ConvertTo-Json -Depth 10 -Compress

    # Tính giá: nếu món có options kiểu override thì price có thể là 0 hoặc null
    # -> dùng lại giá hiện tại, fallback về 0 nếu null
    $priceVal = if ($food.price -ne $null) { "$($food.price)" } else { "0" }

    # Build form data (chỉ gửi các trường bắt buộc + options)
    $form = @{
        sku         = $food.sku
        name        = $food.name
        price       = $priceVal
        category    = $food.category
        quantity    = "$($food.quantity)"
        options     = $optionsJson
    }

    # Gửi request PUT /api/food/edit/:id
    try {
        $response = Invoke-RestMethod `
            -Uri "$BASE_URL/api/food/edit/$($food._id)" `
            -Method Put `
            -Headers @{ "token" = $TOKEN } `
            -Form $form

        if ($response.success) {
            Write-Host "  OK: Option Polievka da duoc them vao '$($food.name)'" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host "  LOI: $($response.message)" -ForegroundColor Red
            $failCount++
        }
    }
    catch {
        Write-Host "  LOI request: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.ErrorDetails.Message) {
            try {
                $errDetail = $_.ErrorDetails.Message | ConvertFrom-Json
                Write-Host "  Chi tiet: $($errDetail.message)" -ForegroundColor Red
            } catch {}
        }
        $failCount++
    }
}

# ---- KẾT QUẢ ----
Write-Host ""
Write-Host "=============================" -ForegroundColor Cyan
Write-Host "Thanh cong: $successCount mon" -ForegroundColor Green
Write-Host "That bai / Skip: $failCount mon" -ForegroundColor $(if ($failCount -gt 0) { "Red" } else { "Green" })
Write-Host "=============================" -ForegroundColor Cyan
Write-Host ""
