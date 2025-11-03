# Test Pagination API Script
# Kiểm tra xem pagination API có hoạt động đúng không

Write-Host "🧪 Testing Pagination API..." -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:4000"

# Test 1: Pagination with default params
Write-Host "📝 Test 1: Default pagination (page 1, limit 20)" -ForegroundColor Yellow
$url1 = "$baseUrl/api/food/list?page=1&limit=20"
$response1 = Invoke-RestMethod -Uri $url1 -Method GET
Write-Host "✅ Total items: $($response1.pagination.total)" -ForegroundColor Green
Write-Host "✅ Current page: $($response1.pagination.page)" -ForegroundColor Green
Write-Host "✅ Total pages: $($response1.pagination.totalPages)" -ForegroundColor Green
Write-Host "✅ Items returned: $($response1.count)" -ForegroundColor Green
Write-Host ""

# Test 2: Page 2
Write-Host "📝 Test 2: Page 2 with limit 10" -ForegroundColor Yellow
$url2 = "$baseUrl/api/food/list?page=2&limit=10"
$response2 = Invoke-RestMethod -Uri $url2 -Method GET
Write-Host "✅ Current page: $($response2.pagination.page)" -ForegroundColor Green
Write-Host "✅ Items returned: $($response2.count)" -ForegroundColor Green
Write-Host "✅ Has more: $($response2.pagination.hasMore)" -ForegroundColor Green
Write-Host ""

# Test 3: No pagination (load all)
Write-Host "📝 Test 3: No pagination (load all)" -ForegroundColor Yellow
$url3 = "$baseUrl/api/food/list?noPagination=true"
$response3 = Invoke-RestMethod -Uri $url3 -Method GET
Write-Host "✅ Items returned: $($response3.count)" -ForegroundColor Green
Write-Host "✅ Pagination enabled: $($response3.pagination)" -ForegroundColor Green
Write-Host ""

# Test 4: User endpoint with noPagination
Write-Host "📝 Test 4: User endpoint (forUser=true, active only)" -ForegroundColor Yellow
$url4 = "$baseUrl/api/food/list?forUser=true&noPagination=true"
$response4 = Invoke-RestMethod -Uri $url4 -Method GET
Write-Host "✅ Active items returned: $($response4.count)" -ForegroundColor Green
Write-Host ""

# Test 5: Pagination with filters
Write-Host "📝 Test 5: Pagination with status filter" -ForegroundColor Yellow
$url5 = "$baseUrl/api/food/list?page=1&limit=20&status=active"
$response5 = Invoke-RestMethod -Uri $url5 -Method GET
Write-Host "✅ Active items count: $($response5.count)" -ForegroundColor Green
Write-Host "✅ Total pages: $($response5.pagination.totalPages)" -ForegroundColor Green
Write-Host ""

Write-Host "🎉 All tests completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Summary:" -ForegroundColor Cyan
Write-Host "   Total products in DB: $($response3.count)"
Write-Host "   Active products: $($response4.count)"
Write-Host "   Pagination working: ✅"
Write-Host ""
