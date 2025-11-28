namespace AuthSystem.Shared.Configuration
{
    public class JwtConfig
    {
        public string Issuer { get; set; } = "AuthSystem";
        public string Audience { get; set; } = "AuthSystemUsers";
        public int ExpireMinutes { get; set; } = 60;
        public int RefreshTokenExpireDays { get; set; } = 7;
    }
}