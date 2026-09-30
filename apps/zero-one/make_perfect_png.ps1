Add-Type -AssemblyName System.Drawing

$src = [System.Drawing.Bitmap]::FromFile("public/logo.jpg")

$cropLeft = 67
$cropTop = 57
$cropSize = 366

# Create a 366x366 bitmap
$dst = New-Object System.Drawing.Bitmap($cropSize, $cropSize, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

# Center in cropped coordinates
$centerX = 250.0 - $cropLeft  # 183.0
$centerY = 240.0 - $cropTop   # 183.0
$radius = 181.0

for ($y = 0; $y -lt $cropSize; $y++) {
    for ($x = 0; $x -lt $cropSize; $x++) {
        $srcX = $x + $cropLeft
        $srcY = $y + $cropTop
        
        $pixel = $src.GetPixel($srcX, $srcY)
        
        $dx = $x - $centerX
        $dy = $y - $centerY
        $dist = [math]::Sqrt($dx * $dx + $dy * $dy)
        
        if ($dist > ($radius + 0.5)) {
            # Outside circle - fully transparent
            $dst.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        } elseif ($dist > ($radius - 1.0)) {
            # Edge antialiasing
            $alpha = [int]([math]::Round((($radius + 0.5 - $dist) / 1.5) * 255))
            if ($alpha -lt 0) { $alpha = 0 }
            if ($alpha -gt 255) { $alpha = 255 }
            $dst.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $pixel.R, $pixel.G, $pixel.B))
        } else {
            # Inside circle - fully opaque
            $dst.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, $pixel.R, $pixel.G, $pixel.B))
        }
    }
}

$dst.Save("public/logo.png", [System.Drawing.Imaging.ImageFormat]::Png)
$dst.Dispose()
$src.Dispose()

Write-Host "Generated ultra-clean public/logo.png"
