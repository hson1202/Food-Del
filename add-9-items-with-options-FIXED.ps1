# Add 9 items with options - FIXED VERSION
# Fix: label field phải dùng Slovak làm default (không phải English)

$BASE_URL = "http://localhost:4000"
$TOKEN = "YOUR_ADMIN_TOKEN_HERE"  # Thay bằng token của anh

Write-Host "=== ADDING 9 ITEMS WITH OPTIONS (FIXED) ===" -ForegroundColor Cyan
Write-Host "Fix: label field now uses Slovak as default" -ForegroundColor Yellow
Write-Host ""

# Function to add item with options
function Add-ItemWithOptions {
    param(
        [hashtable]$item,
        [string]$optionsJson
    )
    
    try {
        $form = @{
            sku = $item.sku
            name = $item.name
            nameSK = $item.nameSK
            nameVI = $item.nameVI
            nameEN = $item.nameEN
            description = $item.description
            category = $item.category
            price = $item.price
            quantity = $item.quantity
            options = $optionsJson
        }
        
        if ($item.allergens) {
            $form.allergens = $item.allergens
        }
        
        $response = Invoke-RestMethod `
            -Uri "$BASE_URL/api/food/add" `
            -Method Post `
            -Headers @{ "token" = $TOKEN } `
            -Form $form
            
        Write-Host "✓ Added: $($item.sku) - $($item.name)" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "✗ Failed: $($item.sku) - $($_.Exception.Message)" -ForegroundColor Red
        if ($_.ErrorDetails.Message) {
            Write-Host "  Details: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
        }
        return $false
    }
}

# 1. FOCO (N008)
Write-Host "1/9 Adding Foco..." -ForegroundColor Cyan
$focoOptions = '[{"name":"Príchuť","nameSK":"Príchuť","nameVI":"Hương vị","nameEN":"Flavor","type":"select","pricingMode":"override","defaultChoiceCode":"lychee","choices":[{"code":"lychee","label":"Liči","labelSK":"Liči","labelVI":"Vải","labelEN":"Lychee","price":2.50},{"code":"mango","label":"Mango","labelSK":"Mango","labelVI":"Xoài","labelEN":"Mango","price":2.50},{"code":"coconut","label":"Kokos","labelSK":"Kokos","labelVI":"Dừa","labelEN":"Coconut","price":2.50}]}]'
Add-ItemWithOptions -item @{
    sku = "N008"
    name = "Foco"
    nameSK = "Foco"
    nameVI = "Nước Foco"
    nameEN = "Foco Juice"
    description = "Foco exotic juice drink"
    category = "Drinks"
    price = "2.50"
    quantity = "100"
} -optionsJson $focoOptions

# 2. VINUT (N009)
Write-Host "2/9 Adding Vinut..." -ForegroundColor Cyan
$vinutOptions = '[{"name":"Príchuť","nameSK":"Príchuť","nameVI":"Hương vị","nameEN":"Flavor","type":"select","pricingMode":"override","defaultChoiceCode":"lychee","choices":[{"code":"lychee","label":"Liči","labelSK":"Liči","labelVI":"Vải","labelEN":"Lychee","price":2.50},{"code":"strawberry","label":"Jahoda","labelSK":"Jahoda","labelVI":"Dâu tây","labelEN":"Strawberry","price":2.50},{"code":"coconut","label":"Kokos","labelSK":"Kokos","labelVI":"Dừa","labelEN":"Coconut","price":2.50}]}]'
Add-ItemWithOptions -item @{
    sku = "N009"
    name = "Vinut"
    nameSK = "Vinut"
    nameVI = "Nước Vinut"
    nameEN = "Vinut Juice"
    description = "Vinut juice drink"
    category = "Drinks"
    price = "2.50"
    quantity = "100"
} -optionsJson $vinutOptions

# 3. ALOE VERA (N010)
Write-Host "3/9 Adding Aloe Vera..." -ForegroundColor Cyan
$aloeOptions = '[{"name":"Príchuť","nameSK":"Príchuť","nameVI":"Hương vị","nameEN":"Flavor","type":"select","pricingMode":"override","defaultChoiceCode":"strawberry","choices":[{"code":"strawberry","label":"Jahoda","labelSK":"Jahoda","labelVI":"Dâu tây","labelEN":"Strawberry","price":2.50},{"code":"mango","label":"Mango","labelSK":"Mango","labelVI":"Xoài","labelEN":"Mango","price":2.50}]}]'
Add-ItemWithOptions -item @{
    sku = "N010"
    name = "Aloe Vera"
    nameSK = "Aloe Vera"
    nameVI = "Nước Lô Hội"
    nameEN = "Aloe Vera Drink"
    description = "Aloe Vera drink"
    category = "Drinks"
    price = "2.50"
    quantity = "100"
} -optionsJson $aloeOptions

# 4. FUZETEA (N014)
Write-Host "4/9 Adding Fuzetea..." -ForegroundColor Cyan
$fuzeteaOptions = '[{"name":"Príchuť","nameSK":"Príchuť","nameVI":"Hương vị","nameEN":"Flavor","type":"select","pricingMode":"override","defaultChoiceCode":"lemon","choices":[{"code":"lemon","label":"Citrón","labelSK":"Citrón","labelVI":"Chanh","labelEN":"Lemon","price":2.00},{"code":"strawberry","label":"Jahoda","labelSK":"Jahoda","labelVI":"Dâu tây","labelEN":"Strawberry","price":2.00},{"code":"peach","label":"Broskyňa","labelSK":"Broskyňa","labelVI":"Đào","labelEN":"Peach","price":2.00}]}]'
Add-ItemWithOptions -item @{
    sku = "N014"
    name = "Fuzetea"
    nameSK = "Fuzetea"
    nameVI = "Trà Fuzetea"
    nameEN = "Fuzetea"
    description = "Fuzetea ice tea"
    category = "Drinks"
    price = "2.00"
    quantity = "100"
} -optionsJson $fuzeteaOptions

# 5. CAPPY (N015)
Write-Host "5/9 Adding Cappy..." -ForegroundColor Cyan
$cappyOptions = '[{"name":"Príchuť","nameSK":"Príchuť","nameVI":"Hương vị","nameEN":"Flavor","type":"select","pricingMode":"override","defaultChoiceCode":"orange","choices":[{"code":"orange","label":"Pomaranč","labelSK":"Pomaranč","labelVI":"Cam","labelEN":"Orange","price":1.80},{"code":"strawberry","label":"Jahoda","labelSK":"Jahoda","labelVI":"Dâu tây","labelEN":"Strawberry","price":1.80},{"code":"apple","label":"Jablko","labelSK":"Jablko","labelVI":"Táo","labelEN":"Apple","price":1.80},{"code":"multivitamin","label":"Multivitamín","labelSK":"Multivitamín","labelVI":"Đa vitamin","labelEN":"Multivitamin","price":1.80}]}]'
Add-ItemWithOptions -item @{
    sku = "N015"
    name = "Cappy"
    nameSK = "Cappy"
    nameVI = "Nước ép Cappy"
    nameEN = "Cappy Juice"
    description = "Cappy fruit juice"
    category = "Drinks"
    price = "1.80"
    quantity = "100"
} -optionsJson $cappyOptions

# 6. NEM CUON (P003)
Write-Host "6/9 Adding Nem Cuon..." -ForegroundColor Cyan
$nemCuonOptions = '[{"name":"Náplň","nameSK":"Náplň","nameVI":"Nhân","nameEN":"Filling","type":"select","pricingMode":"override","defaultChoiceCode":"chicken","choices":[{"code":"chicken","label":"s kuracím mäsom","labelSK":"s kuracím mäsom","labelVI":"với thịt gà","labelEN":"with chicken","price":4.50},{"code":"shrimp","label":"s krevetami","labelSK":"s krevetami","labelVI":"với tôm","labelEN":"with shrimp","price":5.00},{"code":"vegetarian","label":"vegetariánske","labelSK":"vegetariánske","labelVI":"chay","labelEN":"vegetarian","price":4.50}]}]'
Add-ItemWithOptions -item @{
    sku = "P003"
    name = "Nem Cuon - Čerstvé Letné Závitky (2ks)"
    nameSK = "Nem Cuon - Čerstvé Letné Závitky (2ks)"
    nameVI = "Nem Cuốn - Gỏi Cuốn Tươi (2 cuốn)"
    nameEN = "Fresh Spring Rolls (2pcs)"
    description = "Rýžové rezance, šalát, vietnamské bylinky, krevety, kuracie mäso, zelenina obalovaná v rýžovom papieri, podávané s arašidovou omáčkou"
    category = "Starters"
    price = "4.50"
    quantity = "100"
    allergens = "2, 4, 5, 6"
} -optionsJson $nemCuonOptions

# 7. NEM VYPRÁŽANÉ (P004)
Write-Host "7/9 Adding Nem Vyprážané..." -ForegroundColor Cyan
$nemFriedOptions = '[{"name":"Náplň","nameSK":"Náplň","nameVI":"Nhân","nameEN":"Filling","type":"select","pricingMode":"override","defaultChoiceCode":"pork","choices":[{"code":"pork","label":"s bravčovým mäsom","labelSK":"s bravčovým mäsom","labelVI":"với thịt heo","labelEN":"with pork","price":5.00},{"code":"vegetarian","label":"vegetariánske","labelSK":"vegetariánske","labelVI":"chay","labelEN":"vegetarian","price":5.00}]}]'
Add-ItemWithOptions -item @{
    sku = "P004"
    name = "Nem - Vyprážané Závitky (210g)"
    nameSK = "Nem - Vyprážané Závitky (210g)"
    nameVI = "Nem - Chả Giò Chiên (210g)"
    nameEN = "Fried Spring Rolls (210g)"
    description = "Vajce, zelenina, huby, sklenené rezance obalované v rýžovom papieri"
    category = "Starters"
    price = "5.00"
    quantity = "100"
    allergens = "3, 4, 6"
} -optionsJson $nemFriedOptions

# 8. TOM KHA GAI (PO005)
Write-Host "8/9 Adding Tom Kha Gai..." -ForegroundColor Cyan
$tomKhaOptions = '[{"name":"Mäso","nameSK":"Mäso","nameVI":"Loại thịt","nameEN":"Protein","type":"select","pricingMode":"override","defaultChoiceCode":"chicken","choices":[{"code":"chicken","label":"s kuracím mäsom","labelSK":"s kuracím mäsom","labelVI":"với thịt gà","labelEN":"with chicken","price":3.00},{"code":"shrimp","label":"s krevetami","labelSK":"s krevetami","labelVI":"với tôm","labelEN":"with shrimp","price":3.50},{"code":"tofu","label":"s tofu","labelSK":"s tofu","labelVI":"với đậu phụ","labelEN":"with tofu","price":3.00}]}]'
Add-ItemWithOptions -item @{
    sku = "PO005"
    name = "Tom Kha Gai (0,3l)"
    nameSK = "Tom Kha Gai (0,3l)"
    nameVI = "Tom Kha Gà (0,3l)"
    nameEN = "Tom Kha Gai (0.3l)"
    description = "Thajská pikantná polievka, citrónová tráva, kokosové mlieko"
    category = "Soups"
    price = "3.00"
    quantity = "100"
    allergens = "2, 4, 6"
} -optionsJson $tomKhaOptions

# 9. TOM YUM (PO006)
Write-Host "9/9 Adding Tom Yum..." -ForegroundColor Cyan
$tomYumOptions = '[{"name":"Mäso","nameSK":"Mäso","nameVI":"Loại thịt","nameEN":"Protein","type":"select","pricingMode":"override","defaultChoiceCode":"chicken","choices":[{"code":"chicken","label":"s kuracím mäsom","labelSK":"s kuracím mäsom","labelVI":"với thịt gà","labelEN":"with chicken","price":3.00},{"code":"shrimp","label":"s krevetami","labelSK":"s krevetami","labelVI":"với tôm","labelEN":"with shrimp","price":3.50},{"code":"tofu","label":"s tofu","labelSK":"s tofu","labelVI":"với đậu phụ","labelEN":"with tofu","price":3.00}]}]'
Add-ItemWithOptions -item @{
    sku = "PO006"
    name = "Tom Yum (0,3l)"
    nameSK = "Tom Yum (0,3l)"
    nameVI = "Tom Yum (0,3l)"
    nameEN = "Tom Yum (0.3l)"
    description = "Mlieko, jemne pikantné, zelenina"
    category = "Soups"
    price = "3.00"
    quantity = "100"
    allergens = "2, 4, 6"
} -optionsJson $tomYumOptions

Write-Host ""
Write-Host "=== COMPLETED ===" -ForegroundColor Green
Write-Host "Successfully added 9 items with options (FIXED version)" -ForegroundColor Cyan

