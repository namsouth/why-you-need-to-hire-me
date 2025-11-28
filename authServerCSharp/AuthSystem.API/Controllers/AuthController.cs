using AuthSystem.Core.Interfaces;
using AuthSystem.Shared.DTOs;
using AuthSystem.Shared.Exceptions;
using Microsoft.AspNetCore.Mvc;

namespace AuthSystem.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly ITokenService _tokenService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IUserService userService, ITokenService tokenService, ILogger<AuthController> logger)
        {
            _userService = userService;
            _tokenService = tokenService;
            _logger = logger;
        }

        [HttpPost("register")]
        public async Task<ActionResult<ApiResponse<object>>> Register([FromBody] RegisterRequest request)
        {
            try
            {
                var user = await _userService.RegisterAsync(
                    request.Username, 
                    request.Password, 
                    request.Fullname, 
                    "system");
                
                _logger.LogInformation("User registered successfully: {Username}", request.Username);
                return ApiResponse<object>.SuccessResult(
                    new { UserId = user.Uuid }, 
                    "User registered successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during user registration for {Username}", request.Username);
                return BadRequest(ApiResponse.ErrorResult(ex.Message));
            }
        }

        [HttpPost("login")]
        public async Task<ActionResult<ApiResponse<object>>> Login([FromBody] LoginRequest request)
        {
            try
            {
                var result = await _userService.LoginAsync(request.Username, request.Password);
                
                _logger.LogInformation("User logged in successfully: {Username}", request.Username);
                return ApiResponse<object>.SuccessResult(result, "Login successful");
            }
            catch (InvalidCredentialsException)
            {
                _logger.LogWarning("Failed login attempt for {Username}", request.Username);
                return Unauthorized(ApiResponse.ErrorResult("Invalid credentials"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during login for {Username}", request.Username);
                return BadRequest(ApiResponse.ErrorResult(ex.Message));
            }
        }

        [HttpPost("refresh")]
        public async Task<ActionResult<ApiResponse<object>>> Refresh([FromBody] RefreshTokenRequest request)
        {
            try
            {
                var newToken = await _tokenService.RefreshTokenAsync(request.RefreshToken);
                
                _logger.LogInformation("Token refreshed successfully");
                return ApiResponse<object>.SuccessResult(
                    new { AccessToken = newToken }, 
                    "Token refreshed successfully");
            }
            catch (TokenValidationException ex)
            {
                _logger.LogWarning("Token refresh failed: {Message}", ex.Message);
                return Unauthorized(ApiResponse.ErrorResult(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during token refresh");
                return BadRequest(ApiResponse.ErrorResult(ex.Message));
            }
        }

        [HttpPost("logout")]
        public async Task<ActionResult<ApiResponse>> Logout([FromBody] RefreshTokenRequest request)
        {
            try
            {
                await _tokenService.RevokeTokenAsync(request.RefreshToken);
                
                _logger.LogInformation("User logged out successfully");
                return ApiResponse.SuccessResult("Logged out successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during logout");
                return BadRequest(ApiResponse.ErrorResult(ex.Message));
            }
        }

        [HttpPost("change-password")]
        public async Task<ActionResult<ApiResponse>> ChangePassword(
            [FromBody] ChangePasswordRequest request, 
            [FromHeader] Guid userId)
        {
            try
            {
                var success = await _userService.ChangePasswordAsync(
                    userId, request.CurrentPassword, request.NewPassword);

                if (!success)
                    return BadRequest(ApiResponse.ErrorResult("Current password is incorrect"));

                _logger.LogInformation("Password changed successfully for user {UserId}", userId);
                return ApiResponse.SuccessResult("Password changed successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error changing password for user {UserId}", userId);
                return BadRequest(ApiResponse.ErrorResult(ex.Message));
            }
        }
    }
}