# Add remaining menu items - S section (Sashimi, Soups, etc.)
$BASE_URL = "http://localhost:4000"
$TOKEN = "YOUR_ADMIN_TOKEN_HERE"

# BENTO (continued B006-B015)
$bentoItems = @(
    @{
        sku = "B006"
        name = "Tori Bento"
        nameVI = "Bento Gà"
        nameEN = "Chicken Bento"
        nameSK = "Tori Bento"
        description = "Chrumkavé kuracie mäso, zelenina, šalát, ryža, teriyaki omáčka, mango omáčka, sezam. Maki: losos (3ks), avokádo (3ks), California sesame (4ks)"
        price = "10.50"
        category = "Bento"
        quantity = "100"
        allergens = "1, 4, 6, 11"
    },
    @{
        sku = "B007"
        name = "Kamo Bento"
        nameVI = "Bento Vịt"
        nameEN = "Duck Bento"
        nameSK = "Kamo Bento"
        description = "Chrumkavá kačica, zelenina, šalát, ryža, teriyaki omáčka, mango omáčka, sezam. Maki: losos (3ks), avokádo (3ks), California sesame (4ks)"
        price = "10.90"
        category = "Bento"
        quantity = "100"
        allergens = "1, 4, 6, 11"
    },
    @{
        sku = "B008"
        name = "Sake Bento"
        nameVI = "Bento Cá Hồi"
        nameEN = "Salmon Bento"
        nameSK = "Sake Bento"
        description = "Grilovaný losos, zelenina, šalát, ryža, teriyaki omáčka, mango omáčka, sezam. Maki: losos (3ks), avokádo (3ks), California sesame (4ks)"
        price = "11.90"
        category = "Bento"
        quantity = "100"
        allergens = "4, 6, 11"
    },
    @{
        sku = "B009"
        name = "Gyuniku Bento"
        nameVI = "Bento Bò"
        nameEN = "Beef Bento"
        nameSK = "Gyuniku Bento"
        description = "Hovädzie mäso, zelenina, šalát, ryža, teriyaki omáčka, mango omáčka, sezam. Maki: losos (3ks), avokádo (3ks), California sesame (4ks)"
        price = "10.90"
        category = "Bento"
        quantity = "100"
        allergens = "6, 11"
    },
    @{
        sku = "B010"
        name = "Tofu Bento"
        nameVI = "Bento Đậu Phụ"
        nameEN = "Tofu Bento"
        nameSK = "Tofu Bento"
        description = "Tofu, zelenina, šalát, ryža, teriyaki omáčka, mango omáčka, sezam. Maki: uhorka (3ks), avokádo (3ks), California sesame vege (4ks)"
        price = "9.50"
        category = "Bento"
        quantity = "100"
        allergens = "6, 11"
    },
    @{
        sku = "B011"
        name = "Tori Soba Bento"
        nameVI = "Bento Gà Soba"
        nameEN = "Chicken Soba Bento"
        nameSK = "Tori Soba Bento"
        description = "Opekané rezance, kuracie mäso, zelenina, šalát, ryža, teriyaki omáčka, mango omáčka, sezam. Maki: losos (3ks), avokádo (3ks), California sesame (4ks)"
        price = "9.50"
        category = "Bento"
        quantity = "100"
        allergens = "1, 4, 6, 11"
    },
    @{
        sku = "B012"
        name = "Nigiri Maki Bento"
        nameVI = "Bento Nigiri Maki"
        nameEN = "Nigiri Maki Bento"
        nameSK = "Nigiri Maki Bento"
        description = "Wakame šalát, Nigiri: losos (1ks), tuniak (1ks), kreveta (1ks), Maki: losos (3ks), avokádo (3ks), California sesame (4ks)"
        price = "11.90"
        category = "Bento"
        quantity = "100"
        allergens = "2, 4, 6, 11"
    },
    @{
        sku = "B013"
        name = "Sashimi Bento"
        nameVI = "Bento Sashimi"
        nameEN = "Sashimi Bento"
        nameSK = "Sashimi Bento"
        description = "Wakame šalát, Nigiri: losos (1ks), tuniak (1ks), kreveta (1ks), Maki: losos (3ks), avokádo (3ks), Sashimi: losos (2ks), tuniak (2ks), kreveta (2ks)"
        price = "12.90"
        category = "Bento"
        quantity = "100"
        allergens = "A: 2, 4, 6, 11"
    },
    @{
        sku = "B014"
        name = "Vege Bento"
        nameVI = "Bento Chay"
        nameEN = "Vegetarian Bento"
        nameSK = "Vege Bento"
        description = "Wakame šalát, Nigiri: inagi tofu (1ks), avokádo (1ks), mango (1ks), Maki: uhorka (3ks), avokádo (3ks), California sesame vege (4ks)"
        price = "8.90"
        category = "Bento"
        quantity = "100"
        allergens = "A: 6, 11"
    },
    @{
        sku = "B015"
        name = "Salmon Bento"
        nameVI = "Bento Cá Hồi Premium"
        nameEN = "Premium Salmon Bento"
        nameSK = "Salmon Bento"
        description = "Wakame šalát, Nigiri: losos (3ks), Maki: losos (6ks), Sashimi: losos (5ks)"
        price = "13.90"
        category = "Bento"
        quantity = "100"
        allergens = "A: 4, 6"
    }
)

# NÁPOJE - Simple drinks (N001-N007, N011-N013)
$napojeSimple = @(
    @{
        sku = "N001"
        name = "Cola"
        nameVI = "Coca Cola"
        nameEN = "Cola"
        nameSK = "Cola"
        description = "Coca Cola"
        price = "2.00"
        category = "Drinks"
        quantity = "100"
    },
    @{
        sku = "N002"
        name = "Cola Zero"
        nameVI = "Coca Cola Zero"
        nameEN = "Cola Zero"
        nameSK = "Cola Zero"
        description = "Coca Cola Zero"
        price = "2.00"
        category = "Drinks"
        quantity = "100"
    },
    @{
        sku = "N003"
        name = "Fanta"
        nameVI = "Fanta"
        nameEN = "Fanta"
        nameSK = "Fanta"
        description = "Fanta"
        price = "2.00"
        category = "Drinks"
        quantity = "100"
    },
    @{
        sku = "N004"
        name = "Sprite"
        nameVI = "Sprite"
        nameEN = "Sprite"
        nameSK = "Sprite"
        description = "Sprite"
        price = "2.00"
        category = "Drinks"
        quantity = "100"
    },
    @{
        sku = "N005"
        name = "Monster"
        nameVI = "Monster Energy"
        nameEN = "Monster"
        nameSK = "Monster"
        description = "Monster Energy Drink"
        price = "2.20"
        category = "Drinks"
        quantity = "100"
    },
    @{
        sku = "N006"
        name = "Kinley"
        nameVI = "Kinley"
        nameEN = "Kinley"
        nameSK = "Kinley"
        description = "Kinley Tonic Water"
        price = "2.00"
        category = "Drinks"
        quantity = "100"
    },
    @{
        sku = "N007"
        name = "Number 1"
        nameVI = "Number 1"
        nameEN = "Number 1"
        nameSK = "Number 1"
        description = "Number 1 Energy Drink"
        price = "2.50"
        category = "Drinks"
        quantity = "100"
    },
    @{
        sku = "N011"
        name = "Minerálka neperlivá"
        nameVI = "Nước khoáng không có ga"
        nameEN = "Still Mineral Water"
        nameSK = "Minerálka neperlivá"
        description = "Still mineral water"
        price = "1.50"
        category = "Drinks"
        quantity = "100"
    },
    @{
        sku = "N012"
        name = "Minerálka jemne perlivá"
        nameVI = "Nước khoáng có ít ga"
        nameEN = "Lightly Sparkling Water"
        nameSK = "Minerálka jemne perlivá"
        description = "Lightly sparkling mineral water"
        price = "1.50"
        category = "Drinks"
        quantity = "100"
    },
    @{
        sku = "N013"
        name = "Minerálka perlivá"
        nameVI = "Nước khoáng có ga"
        nameEN = "Sparkling Mineral Water"
        nameSK = "Minerálka perlivá"
        description = "Sparkling mineral water"
        price = "1.50"
        category = "Drinks"
        quantity = "100"
    }
)

# PREDJEDLÁ - Appetizers
$predjedlaSimple = @(
    @{
        sku = "P001"
        name = "Gyoza 150g (6ks)"
        nameVI = "Gyoza 150g (6 viên)"
        nameEN = "Gyoza 150g (6pcs)"
        nameSK = "Gyoza 150g (6ks)"
        description = "Knedličky plnené kuracím mäsom alebo zeleninou s hubami, podávané so sladkou chilli omáčkou"
        price = "5.80"
        category = "Starters"
        quantity = "100"
        allergens = "1, 3, 6, 11"
    },
    @{
        sku = "P002"
        name = "Edamame Fazule"
        nameVI = "Đậu Edamame"
        nameEN = "Edamame Beans"
        nameSK = "Edamame Fazule"
        description = "Sójové dietne lúpané bôby"
        price = "4.50"
        category = "Starters"
        quantity = "100"
        allergens = "6"
    },
    @{
        sku = "P005"
        name = "Tempura Krevety (150g)"
        nameVI = "Tôm Tempura (150g)"
        nameEN = "Tempura Shrimp (150g)"
        nameSK = "Tempura Krevety (150g)"
        description = "Tempura fried shrimp"
        price = "6.50"
        category = "Starters"
        quantity = "100"
        allergens = "1, 2, 3, 7"
    }
)

# POLIEVKY - Simple soups
$polievkySimple = @(
    @{
        sku = "PO001"
        name = "Ostrokyslá Polievka (0,3l)"
        nameVI = "Súp Chua Cay (0,3l)"
        nameEN = "Hot and Sour Soup (0.3l)"
        nameSK = "Ostrokyslá Polievka (0,3l)"
        description = "Kurací vývar, kuracie mäso, vajce, huby, zelenina, čili, ocot"
        price = "1.50"
        category = "Soups"
        quantity = "100"
        allergens = "1, 3, 6"
    },
    @{
        sku = "PO002"
        name = "Lososová Polievka (0,3l)"
        nameVI = "Súp Cá Hồi (0,3l)"
        nameEN = "Salmon Soup (0.3l)"
        nameSK = "Lososová Polievka (0,3l)"
        description = "Pikantný lososový vývar, lososové kúsky, zelenina, kôpor"
        price = "2.50"
        category = "Soups"
        quantity = "100"
        allergens = "4, 6"
    },
    @{
        sku = "PO003"
        name = "Hanojský Vývar (0,3l)"
        nameVI = "Phở Hà Nội (0,3l)"
        nameEN = "Hanoi Broth (0.3l)"
        nameSK = "Hanojský Vývar (0,3l)"
        description = "Hanojský vývar, kuracie mäso, rýžové rezance, cibuľka"
        price = "1.50"
        category = "Soups"
        quantity = "100"
        allergens = "9"
    },
    @{
        sku = "PO004"
        name = "Miso Shiro (0,3l)"
        nameVI = "Súp Miso (0,3l)"
        nameEN = "Miso Soup (0.3l)"
        nameSK = "Miso Shiro (0,3l)"
        description = "Vegetariánsky vývar s hodvábnym tofu a riasami"
        price = "2.50"
        category = "Soups"
        quantity = "100"
        allergens = "6"
    },
    @{
        sku = "PO007"
        name = "Gyoza Soup (0,3l)"
        nameVI = "Súp Gyoza (0,3l)"
        nameEN = "Gyoza Soup (0.3l)"
        nameSK = "Gyoza Soup (0,3l)"
        description = "Silný vývar s udon rezancami a gyoza taštičkami"
        price = "3.90"
        category = "Soups"
        quantity = "100"
    }
)

Write-Host "=== ADDING MENU ITEMS - S SECTION ===" -ForegroundColor Cyan

# Function to add simple item
function Add-SimpleItem {
    param($item)
    
    try {
        $form = @{
            sku = $item.sku
            name = $item.name
            nameVI = $item.nameVI
            nameEN = $item.nameEN
            nameSK = $item.nameSK
            description = $item.description
            price = $item.price
            category = $item.category
            quantity = $item.quantity
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
        return $false
    }
}

# Add Bento items
Write-Host "`n--- BENTO (continued B006-B015) ---" -ForegroundColor Yellow
$bentoItems | ForEach-Object { Add-SimpleItem $_ }

# Add simple Napoje
Write-Host "`n--- NÁPOJE (Simple Drinks) ---" -ForegroundColor Yellow
$napojeSimple | ForEach-Object { Add-SimpleItem $_ }

# Add Predjedla (simple ones)
Write-Host "`n--- PREDJEDLÁ (Simple) ---" -ForegroundColor Yellow
$predjedlaSimple | ForEach-Object { Add-SimpleItem $_ }

# Add Polievky (simple ones)
Write-Host "`n--- POLIEVKY (Simple) ---" -ForegroundColor Yellow
$polievkySimple | ForEach-Object { Add-SimpleItem $_ }

Write-Host "`n=== ADDING ITEMS WITH OPTIONS ===" -ForegroundColor Cyan

# NÁPOJE with options
Write-Host "`n--- NÁPOJE (with flavor options) ---" -ForegroundColor Yellow

# N008 - Foco
try {
    $options = @(
        @{
            name = "Flavor"
            nameVI = "Hương vị"
            nameEN = "Flavor"
            nameSK = "Príchuť"
            type = "select"
            defaultChoiceCode = "lychee"
            pricingMode = "override"
            choices = @(
                @{ code = "lychee"; label = "Lychee"; labelVI = "Vải"; labelEN = "Lychee"; labelSK = "Liči"; price = 2.50; image = "" },
                @{ code = "mango"; label = "Mango"; labelVI = "Xoài"; labelEN = "Mango"; labelSK = "Mango"; price = 2.50; image = "" },
                @{ code = "coconut"; label = "Coconut"; labelVI = "Dừa"; labelEN = "Coconut"; labelSK = "Kokos"; price = 2.50; image = "" }
            )
        }
    ) | ConvertTo-Json -Depth 10 -Compress
    
    $form = @{
        sku = "N008"
        name = "Foco"
        nameVI = "Nước Foco"
        nameEN = "Foco Juice"
        nameSK = "Foco"
        description = "Foco exotic juice drink"
        price = "2.50"
        category = "Drinks"
        quantity = "100"
        options = $options
    }
    
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/food/add" -Method Post -Headers @{ "token" = $TOKEN } -Form $form
    Write-Host "✓ Added: N008 - Foco" -ForegroundColor Green
}
catch { Write-Host "✗ Failed: N008 - $($_.Exception.Message)" -ForegroundColor Red }

# N009 - Vinut
try {
    $options = @(
        @{
            name = "Flavor"
            nameVI = "Hương vị"
            nameEN = "Flavor"
            nameSK = "Príchuť"
            type = "select"
            defaultChoiceCode = "lychee"
            pricingMode = "override"
            choices = @(
                @{ code = "lychee"; label = "Lychee"; labelVI = "Vải"; labelEN = "Lychee"; labelSK = "Liči"; price = 2.50; image = "" },
                @{ code = "strawberry"; label = "Strawberry"; labelVI = "Dâu tây"; labelEN = "Strawberry"; labelSK = "Jahoda"; price = 2.50; image = "" },
                @{ code = "coconut"; label = "Coconut"; labelVI = "Dừa"; labelEN = "Coconut"; labelSK = "Kokos"; price = 2.50; image = "" }
            )
        }
    ) | ConvertTo-Json -Depth 10 -Compress
    
    $form = @{
        sku = "N009"
        name = "Vinut"
        nameVI = "Nước Vinut"
        nameEN = "Vinut Juice"
        nameSK = "Vinut"
        description = "Vinut juice drink"
        price = "2.50"
        category = "Drinks"
        quantity = "100"
        options = $options
    }
    
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/food/add" -Method Post -Headers @{ "token" = $TOKEN } -Form $form
    Write-Host "✓ Added: N009 - Vinut" -ForegroundColor Green
}
catch { Write-Host "✗ Failed: N009 - $($_.Exception.Message)" -ForegroundColor Red }

# N010 - Aloe Vera
try {
    $options = @(
        @{
            name = "Flavor"
            nameVI = "Hương vị"
            nameEN = "Flavor"
            nameSK = "Príchuť"
            type = "select"
            defaultChoiceCode = "strawberry"
            pricingMode = "override"
            choices = @(
                @{ code = "strawberry"; label = "Strawberry"; labelVI = "Dâu tây"; labelEN = "Strawberry"; labelSK = "Jahoda"; price = 2.50; image = "" },
                @{ code = "mango"; label = "Mango"; labelVI = "Xoài"; labelEN = "Mango"; labelSK = "Mango"; price = 2.50; image = "" }
            )
        }
    ) | ConvertTo-Json -Depth 10 -Compress
    
    $form = @{
        sku = "N010"
        name = "Aloe Vera"
        nameVI = "Nước Lô Hội"
        nameEN = "Aloe Vera Drink"
        nameSK = "Aloe Vera"
        description = "Aloe Vera drink"
        price = "2.50"
        category = "Drinks"
        quantity = "100"
        options = $options
    }
    
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/food/add" -Method Post -Headers @{ "token" = $TOKEN } -Form $form
    Write-Host "✓ Added: N010 - Aloe Vera" -ForegroundColor Green
}
catch { Write-Host "✗ Failed: N010 - $($_.Exception.Message)" -ForegroundColor Red }

# N014 - Fuzetea
try {
    $options = @(
        @{
            name = "Flavor"
            nameVI = "Hương vị"
            nameEN = "Flavor"
            nameSK = "Príchuť"
            type = "select"
            defaultChoiceCode = "lemon"
            pricingMode = "override"
            choices = @(
                @{ code = "lemon"; label = "Lemon"; labelVI = "Chanh"; labelEN = "Lemon"; labelSK = "Citrón"; price = 2.00; image = "" },
                @{ code = "strawberry"; label = "Strawberry"; labelVI = "Dâu tây"; labelEN = "Strawberry"; labelSK = "Jahoda"; price = 2.00; image = "" },
                @{ code = "peach"; label = "Peach"; labelVI = "Đào"; labelEN = "Peach"; labelSK = "Broskyňa"; price = 2.00; image = "" }
            )
        }
    ) | ConvertTo-Json -Depth 10 -Compress
    
    $form = @{
        sku = "N014"
        name = "Fuzetea"
        nameVI = "Trà Fuzetea"
        nameEN = "Fuzetea"
        nameSK = "Fuzetea"
        description = "Fuzetea ice tea"
        price = "2.00"
        category = "Drinks"
        quantity = "100"
        options = $options
    }
    
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/food/add" -Method Post -Headers @{ "token" = $TOKEN } -Form $form
    Write-Host "✓ Added: N014 - Fuzetea" -ForegroundColor Green
}
catch { Write-Host "✗ Failed: N014 - $($_.Exception.Message)" -ForegroundColor Red }

# N015 - Cappy
try {
    $options = @(
        @{
            name = "Flavor"
            nameVI = "Hương vị"
            nameEN = "Flavor"
            nameSK = "Príchuť"
            type = "select"
            defaultChoiceCode = "orange"
            pricingMode = "override"
            choices = @(
                @{ code = "orange"; label = "Orange"; labelVI = "Cam"; labelEN = "Orange"; labelSK = "Pomaranč"; price = 1.80; image = "" },
                @{ code = "strawberry"; label = "Strawberry"; labelVI = "Dâu tây"; labelEN = "Strawberry"; labelSK = "Jahoda"; price = 1.80; image = "" },
                @{ code = "apple"; label = "Apple"; labelVI = "Táo"; labelEN = "Apple"; labelSK = "Jablko"; price = 1.80; image = "" },
                @{ code = "multivitamin"; label = "Multivitamin"; labelVI = "Đa vitamin"; labelEN = "Multivitamin"; labelSK = "Multivitamín"; price = 1.80; image = "" }
            )
        }
    ) | ConvertTo-Json -Depth 10 -Compress
    
    $form = @{
        sku = "N015"
        name = "Cappy"
        nameVI = "Nước ép Cappy"
        nameEN = "Cappy Juice"
        nameSK = "Cappy"
        description = "Cappy fruit juice"
        price = "1.80"
        category = "Drinks"
        quantity = "100"
        options = $options
    }
    
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/food/add" -Method Post -Headers @{ "token" = $TOKEN } -Form $form
    Write-Host "✓ Added: N015 - Cappy" -ForegroundColor Green
}
catch { Write-Host "✗ Failed: N015 - $($_.Exception.Message)" -ForegroundColor Red }

# PREDJEDLÁ with options
Write-Host "`n--- PREDJEDLÁ (with options) ---" -ForegroundColor Yellow

# P003 - Nem Cuon
try {
    $options = @(
        @{
            name = "Filling"
            nameVI = "Nhân"
            nameEN = "Filling"
            nameSK = "Náplň"
            type = "select"
            defaultChoiceCode = "chicken"
            pricingMode = "override"
            choices = @(
                @{ code = "chicken"; label = "with Chicken"; labelVI = "với thịt gà"; labelEN = "with Chicken"; labelSK = "s kuracím mäsom"; price = 4.50; image = "" },
                @{ code = "shrimp"; label = "with Shrimp"; labelVI = "với tôm"; labelEN = "with Shrimp"; labelSK = "s krevetami"; price = 5.00; image = "" },
                @{ code = "vegetarian"; label = "Vegetarian"; labelVI = "chay"; labelEN = "Vegetarian"; labelSK = "vegetariánske"; price = 4.50; image = "" }
            )
        }
    ) | ConvertTo-Json -Depth 10 -Compress
    
    $form = @{
        sku = "P003"
        name = "Nem Cuon - Čerstvé Letné Závitky (2ks)"
        nameVI = "Nem Cuốn - Gỏi Cuốn Tươi (2 cuốn)"
        nameEN = "Fresh Spring Rolls (2pcs)"
        nameSK = "Nem Cuon - Čerstvé Letné Závitky (2ks)"
        description = "Rýžové rezance, šalát, vietnamské bylinky, krevety, kuracie mäso, zelenina obalovaná v rýžovom papieri, podávané s arašidovou omáčkou"
        price = "4.50"
        category = "Starters"
        quantity = "100"
        allergens = "2, 4, 5, 6"
        options = $options
    }
    
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/food/add" -Method Post -Headers @{ "token" = $TOKEN } -Form $form
    Write-Host "✓ Added: P003 - Nem Cuon" -ForegroundColor Green
}
catch { Write-Host "✗ Failed: P003 - $($_.Exception.Message)" -ForegroundColor Red }

# P004 - Nem Vyprážané
try {
    $options = @(
        @{
            name = "Filling"
            nameVI = "Nhân"
            nameEN = "Filling"
            nameSK = "Náplň"
            type = "select"
            defaultChoiceCode = "pork"
            pricingMode = "override"
            choices = @(
                @{ code = "pork"; label = "with Pork"; labelVI = "với thịt heo"; labelEN = "with Pork"; labelSK = "s bravčovým mäsom"; price = 5.00; image = "" },
                @{ code = "vegetarian"; label = "Vegetarian"; labelVI = "chay"; labelEN = "Vegetarian"; labelSK = "vegetariánske"; price = 5.00; image = "" }
            )
        }
    ) | ConvertTo-Json -Depth 10 -Compress
    
    $form = @{
        sku = "P004"
        name = "Nem - Vyprážané Závitky (210g)"
        nameVI = "Nem - Chả Giò Chiên (210g)"
        nameEN = "Fried Spring Rolls (210g)"
        nameSK = "Nem - Vyprážané Závitky (210g)"
        description = "Vajce, zelenina, huby, sklenené rezance obalované v rýžovom papieri"
        price = "5.00"
        category = "Starters"
        quantity = "100"
        allergens = "3, 4, 6"
        options = $options
    }
    
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/food/add" -Method Post -Headers @{ "token" = $TOKEN } -Form $form
    Write-Host "✓ Added: P004 - Nem Vyprážané" -ForegroundColor Green
}
catch { Write-Host "✗ Failed: P004 - $($_.Exception.Message)" -ForegroundColor Red }

# POLIEVKY with options
Write-Host "`n--- POLIEVKY (with protein options) ---" -ForegroundColor Yellow

# PO005 - Tom Kha Gai
try {
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
                @{ code = "chicken"; label = "with Chicken"; labelVI = "với thịt gà"; labelEN = "with Chicken"; labelSK = "s kuracím mäsom"; price = 3.00; image = "" },
                @{ code = "shrimp"; label = "with Shrimp"; labelVI = "với tôm"; labelEN = "with Shrimp"; labelSK = "s krevetami"; price = 3.50; image = "" },
                @{ code = "tofu"; label = "with Tofu"; labelVI = "với đậu phụ"; labelEN = "with Tofu"; labelSK = "s tofu"; price = 3.00; image = "" }
            )
        }
    ) | ConvertTo-Json -Depth 10 -Compress
    
    $form = @{
        sku = "PO005"
        name = "Tom Kha Gai (0,3l)"
        nameVI = "Tom Kha Gà (0,3l)"
        nameEN = "Tom Kha Gai (0.3l)"
        nameSK = "Tom Kha Gai (0,3l)"
        description = "Thajská pikantná polievka, citrónová tráva, kokosové mlieko"
        price = "3.00"
        category = "Soups"
        quantity = "100"
        allergens = "2, 4, 6"
        options = $options
    }
    
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/food/add" -Method Post -Headers @{ "token" = $TOKEN } -Form $form
    Write-Host "✓ Added: PO005 - Tom Kha Gai" -ForegroundColor Green
}
catch { Write-Host "✗ Failed: PO005 - $($_.Exception.Message)" -ForegroundColor Red }

# PO006 - Tom Yum
try {
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
                @{ code = "chicken"; label = "with Chicken"; labelVI = "với thịt gà"; labelEN = "with Chicken"; labelSK = "s kuracím mäsom"; price = 3.00; image = "" },
                @{ code = "shrimp"; label = "with Shrimp"; labelVI = "với tôm"; labelEN = "with Shrimp"; labelSK = "s krevetami"; price = 3.50; image = "" },
                @{ code = "tofu"; label = "with Tofu"; labelVI = "với đậu phụ"; labelEN = "with Tofu"; labelSK = "s tofu"; price = 3.00; image = "" }
            )
        }
    ) | ConvertTo-Json -Depth 10 -Compress
    
    $form = @{
        sku = "PO006"
        name = "Tom Yum (0,3l)"
        nameVI = "Tom Yum (0,3l)"
        nameEN = "Tom Yum (0.3l)"
        nameSK = "Tom Yum (0,3l)"
        description = "Mlieko, jemne pikantné, zelenina"
        price = "3.00"
        category = "Soups"
        quantity = "100"
        allergens = "2, 4, 6"
        options = $options
    }
    
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/food/add" -Method Post -Headers @{ "token" = $TOKEN } -Form $form
    Write-Host "✓ Added: PO006 - Tom Yum" -ForegroundColor Green
}
catch { Write-Host "✗ Failed: PO006 - $($_.Exception.Message)" -ForegroundColor Red }

Write-Host "`n=== COMPLETED S SECTION ===" -ForegroundColor Green
Write-Host "Total items added:" -ForegroundColor Cyan
Write-Host "  - Bento (B006-B015): 10 items" -ForegroundColor White
Write-Host "  - Nápoje (N001-N015): 15 items" -ForegroundColor White
Write-Host "  - Predjedlá (P001-P005): 5 items" -ForegroundColor White
Write-Host "  - Polievky (PO001-PO007): 7 items" -ForegroundColor White
Write-Host "  TOTAL: 37 items" -ForegroundColor Yellow

