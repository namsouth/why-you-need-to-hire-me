using AuthSystem.Core.Interfaces;
using AuthSystem.Infrastructure.Data;
using AuthSystem.Infrastructure.Services;
using AuthSystem.Shared.Configuration;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configuration - using shared configuration objects
builder.Configuration.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true);

// Bind configuration sections
var databaseConfig = new DatabaseConfig();
builder.Configuration.GetSection("Database").Bind(databaseConfig);
builder.Services.AddSingleton(databaseConfig);

var jwtConfig = new JwtConfig();
builder.Configuration.GetSection("Jwt").Bind(jwtConfig);
builder.Services.AddSingleton(jwtConfig);

// Database Configuration - using shared config
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite(databaseConfig.SqlitePath));

// Services
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<KeyManagementService>();

// Logging
builder.Services.AddLogging();

var app = builder.Build();

// Initialize database and seed data
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    context.Database.EnsureCreated();
    
    // Initialize with a default key if none exists
    var keyService = scope.ServiceProvider.GetRequiredService<KeyManagementService>();
    if (!context.KeyManagements.Any())
    {
        await keyService.GenerateNewKeyAsync("default-key");
    }

    // Seed roles if none exist
    if (!context.Roles.Any())
    {
        context.Roles.AddRange(
            new AuthSystem.Core.Entities.Role { Uuid = Guid.NewGuid(), RoleName = "Admin" },
            new AuthSystem.Core.Entities.Role { Uuid = Guid.NewGuid(), RoleName = "User" },
            new AuthSystem.Core.Entities.Role { Uuid = Guid.NewGuid(), RoleName = "Manager" }
        );
        await context.SaveChangesAsync();
    }
}

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();