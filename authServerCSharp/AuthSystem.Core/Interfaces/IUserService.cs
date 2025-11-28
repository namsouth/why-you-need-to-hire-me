using AuthSystem.Core.Entities;
using AuthSystem.Core.Models;

namespace AuthSystem.Core.Interfaces
{
    public interface IUserService
    {
        Task<User> RegisterAsync(string username, string password, string fullname, string createdBy);
        Task<JwtTokenResult> LoginAsync(string username, string password);
        Task<bool> ChangePasswordAsync(Guid userId, string currentPassword, string newPassword);
        Task AssignRoleAsync(Guid userId, Guid roleId, DateTime? expireTime = null);
        Task RemoveRoleAsync(Guid userId, Guid roleId);
        Task<List<string>> GetUserRolesAsync(Guid userId);
    }
}