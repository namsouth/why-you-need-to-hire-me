using AuthSystem.Core.Models;
using AuthSystem.Core.Entities;
namespace AuthSystem.Core.Interfaces
{
    public interface ITokenService
    {
        Task<JwtTokenResult> GenerateTokenAsync(User user, List<string> roles);
        Task<bool> ValidateTokenAsync(string token);
        Task<string> RefreshTokenAsync(string refreshToken);
        Task RevokeTokenAsync(string refreshToken);
    }
}