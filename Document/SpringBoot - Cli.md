```powershell
# 🎯 Run this inside your EXISTING project folder (PowerShell 5+)

$dependencies = "web,devtools"   # ← customize (e.g., "web,data-jpa,security")
$buildTool  = "maven"            # or "gradle"
$javaVersion = "21"
$bootVersion = "3.4.0"

# Download & extract in-place
Invoke-WebRequest `
  -Uri "https://start.spring.io/starter.zip" `
  -OutFile "$env:TEMP\sb.zip" `
  -Body @{
    dependencies = $dependencies
    type         = "$buildTool-project"
    bootVersion  = $bootVersion
    javaVersion  = $javaVersion
    packaging    = "jar"
    groupId      = "com.hire-me"
    artifactId   = "hire-me"
    name         = "hire-me"
    description  = "Why you need to hire me project"
  }

Expand-Archive -Path "$env:TEMP\sb.zip" -DestinationPath "." -Force
Remove-Item "$env:TEMP\sb.zip"

Write-Host "✅ Spring Boot $bootVersion (Java $javaVersion) initialized." -ForegroundColor Green
Write-Host "Run: .\mvnw.cmd spring-boot:run" -ForegroundColor Cyan
```

##### build package
```powershell
.\mvnw.cmd clean package 
```


```powershell

# Build first (if needed), then run latest JAR
.\mvnw.cmd clean package -q
$jar = Get-ChildItem target\*.jar -File | Sort-Object LastWriteTime -Descending | Select-Object -First 1
if ($jar) {
    Write-Host "▶ Running $($jar.Name)..." -ForegroundColor Cyan
    java -jar $jar.FullName --spring.main.web-application-type=none --help
} else {
    Write-Error "Build succeeded but no JAR found."
}
```