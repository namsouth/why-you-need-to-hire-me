namespace AuthSystem.Core.Entities
{
    public class UserRoleMap
    {
        public Guid Uuid { get; set; } = Guid.NewGuid();
        public Guid UserId { get; set; }
        public Guid RoleId { get; set; }
        public DateTime CreateTime { get; set; } = DateTime.UtcNow;
        public DateTime? ExpireTime { get; set; }
        
        // Navigation properties
        public User User { get; set; } = null!;
        public Role Role { get; set; } = null!;
    }
}