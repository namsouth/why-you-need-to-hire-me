using System.Security.Cryptography;
using AuthSystem.Core.Entities;
using AuthSystem.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AuthSystem.Infrastructure.Services
{
    public class KeyManagementService
    {
        private readonly ApplicationDbContext _context;

        public KeyManagementService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<KeyManagement> GenerateNewKeyAsync(string keyCode, int validDays = 365)
        {
            using var rsa = RSA.Create(2048);
            
            var privateKey = rsa.ExportRSAPrivateKey();
            var publicKey = rsa.ExportRSAPublicKey();

            var keyManagement = new KeyManagement
            {
                KeyCode = keyCode,
                PrivateKey = Convert.ToBase64String(privateKey),
                PublicKey = Convert.ToBase64String(publicKey),
                CreatedDate = DateTime.UtcNow,
                ExpireDate = DateTime.UtcNow.AddDays(validDays)
            };

            _context.KeyManagements.Add(keyManagement);
            await _context.SaveChangesAsync();

            return keyManagement;
        }

        public async Task<bool> ValidateIpAccessAsync(string keyCode, string ipAddress)
        {
            var key = await _context.KeyManagements
                .FirstOrDefaultAsync(k => k.KeyCode == keyCode && k.ExpireDate > DateTime.UtcNow);

            if (key == null) return false;

            // Check blacklist
            if (!string.IsNullOrEmpty(key.IpBlackList) && 
                key.IpBlackList.Split(',').Any(ip => ip.Trim() == ipAddress))
                return false;

            // Check whitelist
            if (!string.IsNullOrEmpty(key.IpWhiteList) && 
                !key.IpWhiteList.Split(',').Any(ip => ip.Trim() == ipAddress))
                return false;

            return true;
        }
    }
}