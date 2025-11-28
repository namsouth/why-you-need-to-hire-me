using System.Security.Cryptography;
using System.Text;
using AuthSystem.Core.Entities;
using AuthSystem.Core.Interfaces;
using AuthSystem.Core.Models;
using AuthSystem.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AuthSystem.Infrastructure.Services
{
    public class UserService : IUserService
    {
        private readonly ApplicationDbContext _context;
        private readonly ITokenService _tokenService;

        public UserService(ApplicationDbContext context, ITokenService tokenService)
        {
            _context = context;
            _tokenService = tokenService;
        }

        public async Task<User> RegisterAsync(string username, string password, string fullname, string createdBy)
        {
            if (await _context.Users.AnyAsync(u => u.Username == username))
                throw new InvalidOperationException("Username already exists");

            var user = new User
            {
                Username = username,
                Password = HashPassword(password),
                Fullname = fullname,
                CreatedBy = createdBy
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return user;
        }

        public async Task<JwtTokenResult> LoginAsync(string username, string password)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Username == username);

            if (user == null || !VerifyPassword(password, user.Password))
                throw new UnauthorizedAccessException("Invalid username or password");

            var roles = await GetUserRolesAsync(user.Uuid);
            return await _tokenService.GenerateTokenAsync(user, roles);
        }

        public async Task<bool> ChangePasswordAsync(Guid userId, string currentPassword, string newPassword)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null || !VerifyPassword(currentPassword, user.Password))
                return false;

            user.Password = HashPassword(newPassword);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task AssignRoleAsync(Guid userId, Guid roleId, DateTime? expireTime = null)
        {
            var existingMap = await _context.UserRoleMaps
                .FirstOrDefaultAsync(urm => urm.UserId == userId && urm.RoleId == roleId);

            if (existingMap != null)
            {
                existingMap.ExpireTime = expireTime;
            }
            else
            {
                var userRoleMap = new UserRoleMap
                {
                    UserId = userId,
                    RoleId = roleId,
                    ExpireTime = expireTime
                };
                _context.UserRoleMaps.Add(userRoleMap);
            }

            await _context.SaveChangesAsync();
        }

        public async Task RemoveRoleAsync(Guid userId, Guid roleId)
        {
            var userRoleMap = await _context.UserRoleMaps
                .FirstOrDefaultAsync(urm => urm.UserId == userId && urm.RoleId == roleId);

            if (userRoleMap != null)
            {
                _context.UserRoleMaps.Remove(userRoleMap);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<List<string>> GetUserRolesAsync(Guid userId)
        {
            return await _context.UserRoleMaps
                .Where(urm => urm.UserId == userId && 
                            (urm.ExpireTime == null || urm.ExpireTime > DateTime.UtcNow))
                .Join(_context.Roles,
                    urm => urm.RoleId,
                    r => r.Uuid,
                    (urm, r) => r.RoleName)
                .ToListAsync();
        }

        private string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var bytes = Encoding.UTF8.GetBytes(password);
            var hash = sha256.ComputeHash(bytes);
            return Convert.ToBase64String(hash);
        }

        private bool VerifyPassword(string password, string hashedPassword)
        {
            return HashPassword(password) == hashedPassword;
        }
    }
}