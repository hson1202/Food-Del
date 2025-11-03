# Check và add các categories cần thiết cho 9 món có options
$BASE_URL = "http://localhost:4000"

Write-Host "=== CHECKING CATEGORIES ===" -ForegroundColor Cyan
Write-Host ""

# 1. Lấy danh sách categories hiện có
Write-Host "Fetching existing categories..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/category" -Method Get
    $existingCategories = $response.data
    
    Write-Host "✓ Found $($existingCategories.Count) categories:" -ForegroundColor Green
    $existingCategories | ForEach-Object {
        Write-Host "  - $($_.name)" -ForegroundColor White
    }
}
catch {
    Write-Host "✗ Failed to fetch categories: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "=== CHECKING REQUIRED CATEGORIES ===" -ForegroundColor Cyan
Write-Host ""

# Categories cần thiết cho 9 món
$requiredCategories = @(
    @{
        name = "Bento"
        nameVI = "Bento"
        nameEN = "Bento Box"
        nameSK = "Bento"
        description = "Bento box meals"
        sortOrder = 18
    },
    @{
        name = "Napoje"
        nameVI = "Đồ uống"
        nameEN = "Beverages"
        nameSK = "Nápoje"
        description = "Beverages and drinks"
        sortOrder = 19
    },
    @{
        name = "Predjedla"
        nameVI = "Khai vị"
        nameEN = "Appetizers"
        nameSK = "Predjedlá"
        description = "Appetizers and starters"
        sortOrder = 17
    },
    @{
        name = "Polievky"
        nameVI = "Súp"
        nameEN = "Soups"
        nameSK = "Polievky"
        description = "Soups"
        sortOrder = 16
    }
)

$missingCategories = @()

foreach ($reqCat in $requiredCategories) {
    $exists = $existingCategories | Where-Object { $_.name -eq $reqCat.name }
    
    if ($exists) {
        Write-Host "✓ Category '$($reqCat.name)' exists (ID: $($exists._id))" -ForegroundColor Green
    }
    else {
        Write-Host "✗ Category '$($reqCat.name)' is MISSING" -ForegroundColor Red
        $missingCategories += $reqCat
    }
}

Write-Host ""

if ($missingCategories.Count -eq 0) {
    Write-Host "=== ALL REQUIRED CATEGORIES EXIST ===" -ForegroundColor Green
    Write-Host "You can now add the 9 items with options!" -ForegroundColor Cyan
    exit
}

Write-Host "=== ADDING MISSING CATEGORIES ===" -ForegroundColor Yellow
Write-Host "Found $($missingCategories.Count) missing categories. Adding now..." -ForegroundColor Yellow
Write-Host ""

foreach ($cat in $missingCategories) {
    try {
        Write-Host "Adding '$($cat.name)'..." -ForegroundColor Cyan
        
        $form = @{
            name = $cat.name
            description = $cat.description
            sortOrder = $cat.sortOrder
        }
        
        # Add multilingual fields if they exist
        if ($cat.nameVI) { $form.nameVI = $cat.nameVI }
        if ($cat.nameEN) { $form.nameEN = $cat.nameEN }
        if ($cat.nameSK) { $form.nameSK = $cat.nameSK }
        
        $response = Invoke-RestMethod `
            -Uri "$BASE_URL/api/category" `
            -Method Post `
            -Form $form
            
        Write-Host "  ✓ Created: $($cat.name)" -ForegroundColor Green
        Write-Host "    ID: $($response.data._id)" -ForegroundColor Gray
    }
    catch {
        Write-Host "  ✗ Failed to add '$($cat.name)': $($_.Exception.Message)" -ForegroundColor Red
        if ($_.ErrorDetails.Message) {
            Write-Host "    Details: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "=== FINAL CHECK ===" -ForegroundColor Cyan
Write-Host ""

# Fetch lại để verify
try {
    $finalResponse = Invoke-RestMethod -Uri "$BASE_URL/api/category" -Method Get
    $finalCategories = $finalResponse.data
    
    Write-Host "Total categories now: $($finalCategories.Count)" -ForegroundColor Green
    Write-Host ""
    Write-Host "All categories:" -ForegroundColor Yellow
    $finalCategories | Sort-Object sortOrder | ForEach-Object {
        $catName = $_.name
        $isRequired = $requiredCategories | Where-Object { $_.name -eq $catName }
        if ($isRequired) {
            Write-Host "  ✓ $($_.name) (sortOrder: $($_.sortOrder)) [REQUIRED]" -ForegroundColor Green
        }
        else {
            Write-Host "    $($_.name) (sortOrder: $($_.sortOrder))" -ForegroundColor White
        }
    }
}
catch {
    Write-Host "✗ Failed to fetch final categories" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== COMPLETED ===" -ForegroundColor Green
Write-Host "You can now run: .\add-9-items-with-options-FIXED.ps1" -ForegroundColor Cyan

