namespace AuthSystem.Core.Entities
{
    public class Role
    {
        public Guid Uuid { get; set; } = Guid.NewGuid();
        public string RoleName { get; set; } = string.Empty;
    }
}