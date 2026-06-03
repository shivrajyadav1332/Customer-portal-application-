$files = Get-ChildItem -Path 'src/app/features/dashboard/smart-gate-widgets' -Filter '*.component.ts' -Recurse
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $content = $content -replace "from '\.\.\/\.\.\/\.\.\/core", "from '../../../../core"
    $content | Set-Content $file.FullName -Encoding UTF8
    Write-Host "Fixed: $($file.Name)"
}
Write-Host "All import paths fixed"
