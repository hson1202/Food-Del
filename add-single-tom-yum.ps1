# Add single Tom Yum item - Example for items with options
$BASE_URL = "http://localhost:4000"
$TOKEN = "YOUR_ADMIN_TOKEN_HERE"  # Thay bằng token của anh

# PO006 - Tom Yum
try {
    # Tạo options object và stringify nó
    $options = @(
        @{
            name = "Protein"
            nameVI = "Loại thịt"
            nameEN = "Protein"
            nameSK = "Mäso"
            type = "select"
            defaultChoiceCode = "chicken"
            pricingMode = "override"
            choices = @(
                @{ 
                    code = "chicken"
                    label = "with Chicken"
                    labelVI = "với thịt gà"
                    labelEN = "with Chicken"
                    labelSK = "s kuracím mäsom"
                    price = 3.00
                    image = ""
                },
                @{ 
                    code = "shrimp"
                    label = "with Shrimp"
                    labelVI = "với tôm"
                    labelEN = "with Shrimp"
                    labelSK = "s krevetami"
                    price = 3.50
                    image = ""
                },
                @{ 
                    code = "tofu"
                    label = "with Tofu"
                    labelVI = "với đậu phụ"
                    labelEN = "with Tofu"
                    labelSK = "s tofu"
                    price = 3.00
                    image = ""
                }
            )
        }
    ) | ConvertTo-Json -Depth 10 -Compress  # <-- Stringify tại đây
    
    # In ra để xem stringified options
    Write-Host "Stringified options:" -ForegroundColor Cyan
    Write-Host $options -ForegroundColor Gray
    Write-Host ""
    
    # Tạo form data
    $form = @{
        sku = "PO006"
        name = "Tom Yum (0,3l)"
        nameVI = "Tom Yum (0,3l)"
        nameEN = "Tom Yum (0.3l)"
        nameSK = "Tom Yum (0,3l)"
        description = "Mlieko, jemne pikantné, zelenina"
        price = "3.00"
        category = "Polievky"
        quantity = "100"
        allergens = "2, 4, 6"
        options = $options  # <-- Đã stringify rồi
    }
    
    # Gửi request
    $response = Invoke-RestMethod `
        -Uri "$BASE_URL/api/food/add" `
        -Method Post `
        -Headers @{ "token" = $TOKEN } `
        -Form $form
        
    Write-Host "✓ Successfully added: PO006 - Tom Yum" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 5
}
catch {
    Write-Host "✗ Failed to add Tom Yum" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    # In chi tiết lỗi
    if ($_.ErrorDetails.Message) {
        Write-Host "Details:" -ForegroundColor Yellow
        $_.ErrorDetails.Message | ConvertFrom-Json | ConvertTo-Json -Depth 5
    }
}

