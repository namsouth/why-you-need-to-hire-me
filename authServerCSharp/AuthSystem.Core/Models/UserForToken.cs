using AuthSystem.Core.Entities;

namespace AuthSystem.Core.Models
{
    public class UserForToken
    {
        public Guid Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Fullname { get; set; } = string.Empty;
        
        // Constructor from User entity
        public UserForToken(User user)
        {
            Id = user.Uuid;
            Username = user.Username;
            Fullname = user.Fullname;
        }
        
        // Parameterless constructor for serialization
        public UserForToken() { }
    }
}