namespace AuthSystem.Core.Entities
{
    public class KeyManagement
    {
        public Guid Uuid { get; set; } = Guid.NewGuid();
        public string KeyCode { get; set; } = string.Empty;
        public string PublicKey { get; set; } = string.Empty;
        public string PrivateKey { get; set; } = string.Empty;
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public string? IpWhiteList { get; set; }
        public string? IpBlackList { get; set; }
        public DateTime ExpireDate { get; set; }
    }
}