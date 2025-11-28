using System.ComponentModel.DataAnnotations;

namespace AuthSystem.Core.Entities
{
    public class User
    {
        [Key]
        public Guid Uuid { get; set; } = Guid.NewGuid();
        
        [Required]
        [MaxLength(50)]
        public string Username { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(255)]
        public string Password { get; set; } = string.Empty; // Hashed password
        
        [Required]
        [MaxLength(100)]
        public string Fullname { get; set; } = string.Empty;
        
        public DateTime CreatedTime { get; set; } = DateTime.UtcNow;
        
        [MaxLength(50)]
        public string CreatedBy { get; set; } = "system";
    }
}