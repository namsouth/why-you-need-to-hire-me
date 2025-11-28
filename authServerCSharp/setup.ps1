# Create solution and projects
dotnet new sln -n AuthSystem

dotnet new webapi -n AuthSystem.API
dotnet new classlib -n AuthSystem.Core
dotnet new classlib -n AuthSystem.Infrastructure
dotnet new classlib -n AuthSystem.Shared

# Add projects to solution
dotnet sln add AuthSystem.API/AuthSystem.API.csproj
dotnet sln add AuthSystem.Core/AuthSystem.Core.csproj
dotnet sln add AuthSystem.Infrastructure/AuthSystem.Infrastructure.csproj
dotnet sln add AuthSystem.Shared/AuthSystem.Shared.csproj

# Add references
dotnet add AuthSystem.API/AuthSystem.API.csproj reference AuthSystem.Core/AuthSystem.Core.csproj
dotnet add AuthSystem.API/AuthSystem.API.csproj reference AuthSystem.Infrastructure/AuthSystem.Infrastructure.csproj
dotnet add AuthSystem.API/AuthSystem.API.csproj reference AuthSystem.Shared/AuthSystem.Shared.csproj
dotnet add AuthSystem.Infrastructure/AuthSystem.Infrastructure.csproj reference AuthSystem.Core/AuthSystem.Core.csproj
dotnet add AuthSystem.Infrastructure/AuthSystem.Infrastructure.csproj reference AuthSystem.Shared/AuthSystem.Shared.csproj
dotnet add AuthSystem.Core/AuthSystem.Core.csproj reference AuthSystem.Shared/AuthSystem.Shared.csproj

# Add packages to API
dotnet add AuthSystem.API/AuthSystem.API.csproj package Microsoft.EntityFrameworkCore.Sqlite
dotnet add AuthSystem.API/AuthSystem.API.csproj package Microsoft.EntityFrameworkCore.Design
dotnet add AuthSystem.API/AuthSystem.API.csproj package System.IdentityModel.Tokens.Jwt
dotnet add AuthSystem.API/AuthSystem.API.csproj package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add AuthSystem.API/AuthSystem.API.csproj package Microsoft.Extensions.Configuration

# Add packages to Infrastructure
dotnet add AuthSystem.Infrastructure/AuthSystem.Infrastructure.csproj package Microsoft.EntityFrameworkCore.Sqlite
dotnet add AuthSystem.Infrastructure/AuthSystem.Infrastructure.csproj package System.IdentityModel.Tokens.Jwt

Write-Host "Project structure created successfully!"
Write-Host "Run 'dotnet run --project AuthSystem.API' to start the application"