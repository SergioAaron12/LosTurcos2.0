Add-Type -AssemblyName System.Drawing

$sourcePath = "c:\La_ruta_del_oriente\public\asset\android-chrome-512x512.png"
if (!(Test-Path $sourcePath)) {
    $sourcePath = "c:\La_ruta_del_oriente\public\asset\logo-icon.png"
}

$resDir = "C:\laruta\android\app\src\main\res"

Write-Host "Generando iconos nativos de Android desde: $sourcePath"

$srcImg = [System.Drawing.Image]::FromFile($sourcePath)

$densities = @(
    @{ Name = "mipmap-mdpi"; Size = 48; FgSize = 108; SafeSize = 76 },
    @{ Name = "mipmap-hdpi"; Size = 72; FgSize = 162; SafeSize = 114 },
    @{ Name = "mipmap-xhdpi"; Size = 96; FgSize = 216; SafeSize = 152 },
    @{ Name = "mipmap-xxhdpi"; Size = 144; FgSize = 324; SafeSize = 228 },
    @{ Name = "mipmap-xxxhdpi"; Size = 192; FgSize = 432; SafeSize = 304 }
)

function Resize-And-Save {
    param(
        [System.Drawing.Image]$Image,
        [int]$CanvasWidth,
        [int]$CanvasHeight,
        [int]$DrawWidth,
        [int]$DrawHeight,
        [string]$OutputPath
    )

    $bmp = New-Object System.Drawing.Bitmap $CanvasWidth, $CanvasHeight
    $graphics = [System.Drawing.Graphics]::FromImage($bmp)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.Clear([System.Drawing.Color]::Transparent)

    $offsetX = [math]::Round(($CanvasWidth - $DrawWidth) / 2)
    $offsetY = [math]::Round(($CanvasHeight - $DrawHeight) / 2)

    $graphics.DrawImage($Image, $offsetX, $offsetY, $DrawWidth, $DrawHeight)
    $graphics.Dispose()

    $bmp.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
}

foreach ($d in $densities) {
    $folder = Join-Path $resDir $d.Name
    if (!(Test-Path $folder)) {
        New-Item -ItemType Directory -Path $folder -Force | Out-Null
    }

    # 1. ic_launcher.png
    $launcherPath = Join-Path $folder "ic_launcher.png"
    Resize-And-Save -Image $srcImg -CanvasWidth $d.Size -CanvasHeight $d.Size -DrawWidth $d.Size -DrawHeight $d.Size -OutputPath $launcherPath
    Write-Host "  -> Creado: $launcherPath"

    # 2. ic_launcher_round.png
    $roundPath = Join-Path $folder "ic_launcher_round.png"
    Resize-And-Save -Image $srcImg -CanvasWidth $d.Size -CanvasHeight $d.Size -DrawWidth $d.Size -DrawHeight $d.Size -OutputPath $roundPath
    Write-Host "  -> Creado: $roundPath"

    # 3. ic_launcher_foreground.png (para adaptive icons)
    $fgPath = Join-Path $folder "ic_launcher_foreground.png"
    Resize-And-Save -Image $srcImg -CanvasWidth $d.FgSize -CanvasHeight $d.FgSize -DrawWidth $d.SafeSize -DrawHeight $d.SafeSize -OutputPath $fgPath
    Write-Host "  -> Creado: $fgPath"
}

$srcImg.Dispose()

$colorPath = Join-Path $resDir "values\ic_launcher_background.xml"
$colorContent = "<?xml version=""1.0"" encoding=""utf-8""?>`n<resources>`n    <color name=""ic_launcher_background"">#0b0c10</color>`n</resources>"
[System.IO.File]::WriteAllText($colorPath, $colorContent, [System.Text.Encoding]::UTF8)
Write-Host "Color de fondo de launcher actualizado a #0b0c10 en $colorPath"

Write-Host "¡Iconos generados exitosamente!"
