$file = "src/app/core/services/dashboard.service.ts"
$content = Get-Content $file -Raw
$content = $content -replace 'Observable\s*<\s*', 'Observable<'
$content = $content -replace '\s*>\s*([{;])', '> $1'
$content | Set-Content $file -Encoding UTF8
Write-Host "Fixed Observable types in $file"
