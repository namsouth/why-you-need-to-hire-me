using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using AuthSystem.Core.Entities;
using AuthSystem.Core.Interfaces;
using AuthSystem.Core.Models;
using AuthSystem.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace AuthSystem.Infrastructure.Services
{
    public class TokenService : ITokenService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public TokenService(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<JwtTokenResult> GenerateTokenAsync(User user, List<string> roles)
        {
            var keyManagement = await GetActiveKeyAsync();
            var privateKey = Convert.FromBase64String(keyManagement.PrivateKey);
            
            using var rsa = RSA.Create();
            rsa.ImportRSAPrivateKey(privateKey, out _);

            var signingCredentials = new SigningCredentials(
                new RsaSecurityKey(rsa),
                SecurityAlgorithms.RsaSha256)
            {
                CryptoProviderFactory = new CryptoProviderFactory { CacheSignatureProviders = false }
            };

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Uuid.ToString()),
                new Claim(JwtRegisteredClaimNames.UniqueName, user.Username),
                new Claim(JwtRegisteredClaimNames.Name, user.Fullname),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            // Add roles to claims
            claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

            var tokenExpiry = DateTime.UtcNow.AddMinutes(Convert.ToDouble(
                _configuration["Jwt:ExpireMinutes"] ?? "60"));

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: tokenExpiry,
                signingCredentials: signingCredentials
            );

            var accessToken = new JwtSecurityTokenHandler().WriteToken(token);
            var refreshToken = GenerateRefreshToken();

            // Save login session
            var loginSession = new LoginSession
            {
                UserId = user.Uuid,
                RefreshToken = refreshToken,
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddDays(7),
                IsRevoked = false
            };

            _context.LoginSessions.Add(loginSession);
            await _context.SaveChangesAsync();

            return new JwtTokenResult
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                ExpiresAt = tokenExpiry
            };
        }

        public async Task<bool> ValidateTokenAsync(string token)
        {
            try
            {
                var keyManagement = await GetActiveKeyAsync();
                var publicKey = Convert.FromBase64String(keyManagement.PublicKey);
                
                using var rsa = RSA.Create();
                rsa.ImportRSAPublicKey(publicKey, out _);

                var validationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = _configuration["Jwt:Issuer"],
                    ValidAudience = _configuration["Jwt:Audience"],
                    IssuerSigningKey = new RsaSecurityKey(rsa)
                };

                var tokenHandler = new JwtSecurityTokenHandler();
                tokenHandler.ValidateToken(token, validationParameters, out _);
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<string> RefreshTokenAsync(string refreshToken)
        {
            var session = await _context.LoginSessions
                .Include(ls => ls.User)
                .FirstOrDefaultAsync(ls => ls.RefreshToken == refreshToken && 
                                         !ls.IsRevoked && 
                                         ls.ExpiresAt > DateTime.UtcNow);

            if (session == null)
                throw new UnauthorizedAccessException("Invalid refresh token");

            // Get user roles
            var roles = await _context.UserRoleMaps
                .Where(urm => urm.UserId == session.UserId && 
                            (urm.ExpireTime == null || urm.ExpireTime > DateTime.UtcNow))
                .Join(_context.Roles,
                    urm => urm.RoleId,
                    r => r.Uuid,
                    (urm, r) => r.RoleName)
                .ToListAsync();

            var tokenResult = await GenerateTokenAsync(session.User, roles);

            // Revoke old session
            session.IsRevoked = true;
            await _context.SaveChangesAsync();

            return tokenResult.AccessToken;
        }

        public async Task RevokeTokenAsync(string refreshToken)
        {
            var session = await _context.LoginSessions
                .FirstOrDefaultAsync(ls => ls.RefreshToken == refreshToken);

            if (session != null)
            {
                session.IsRevoked = true;
                await _context.SaveChangesAsync();
            }
        }

        private string GenerateRefreshToken()
        {
            var randomNumber = new byte[64];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }

        private async Task<KeyManagement> GetActiveKeyAsync()
        {
            var key = await _context.KeyManagements
                .FirstOrDefaultAsync(k => k.ExpireDate > DateTime.UtcNow);

            if (key == null)
                throw new InvalidOperationException("No active key found");

            return key;
        }
    }
}