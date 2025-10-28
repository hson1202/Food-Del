# Get Categories from Localhost
$uri = "http://localhost:4000/api/category"

Write-Host "`n📋 Fetching Categories from http://localhost:4000...`n" -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri $uri -Method Get
    
    Write-Host "✅ SUCCESS! Total categories: $($response.data.Count)`n" -ForegroundColor Green
    
    # Display formatted JSON
    $response | ConvertTo-Json -Depth 10 | Out-File -FilePath "categories.json" -Encoding UTF8
    
    Write-Host "📄 Saved to: categories.json`n" -ForegroundColor Yellow
    
    # Display summary
    Write-Host "📊 CATEGORIES SUMMARY:" -ForegroundColor Yellow
    Write-Host "====================" -ForegroundColor Yellow
    
    foreach ($category in $response.data) {
        Write-Host "ID: $($category._id)" -ForegroundColor White
        Write-Host "Name: $($category.name)" -ForegroundColor Cyan
        Write-Host "Description: $($category.description)" -ForegroundColor Gray
        Write-Host "Image: $($category.image)" -ForegroundColor DarkGray
        Write-Host "---" -ForegroundColor DarkGray
    }
    
    Write-Host "`n📄 Full JSON saved to: categories.json" -ForegroundColor Green
    
} catch {
    Write-Host "`n❌ Error: $_" -ForegroundColor Red
    Write-Host "Make sure backend is running on localhost:4000" -ForegroundColor Yellow
}

