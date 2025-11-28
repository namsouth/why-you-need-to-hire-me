using AuthSystem.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace AuthSystem.Infrastructure.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<UserRoleMap> UserRoleMaps { get; set; }
        public DbSet<LoginSession> LoginSessions { get; set; }
        public DbSet<KeyManagement> KeyManagements { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // User configuration
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(u => u.Uuid);
                entity.HasIndex(u => u.Username).IsUnique();
            });

            // Role configuration
            modelBuilder.Entity<Role>(entity =>
            {
                entity.HasKey(r => r.Uuid);
                entity.HasIndex(r => r.RoleName).IsUnique();
            });

            // UserRoleMap configuration
            modelBuilder.Entity<UserRoleMap>(entity =>
            {
                entity.HasKey(urm => urm.Uuid);
                
                entity.HasOne(urm => urm.User)
                    .WithMany()
                    .HasForeignKey(urm => urm.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
                    
                entity.HasOne(urm => urm.Role)
                    .WithMany()
                    .HasForeignKey(urm => urm.RoleId)
                    .OnDelete(DeleteBehavior.Cascade);
                    
                entity.HasIndex(urm => new { urm.UserId, urm.RoleId });
            });

            // LoginSession configuration
            modelBuilder.Entity<LoginSession>(entity =>
            {
                entity.HasKey(ls => ls.Id);
                
                entity.HasOne(ls => ls.User)
                    .WithMany()
                    .HasForeignKey(ls => ls.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
                    
                entity.HasIndex(ls => ls.RefreshToken);
            });

            // KeyManagement configuration
            modelBuilder.Entity<KeyManagement>(entity =>
            {
                entity.HasKey(km => km.Uuid);
                entity.HasIndex(km => km.KeyCode).IsUnique();
            });

            // Seed initial data
            modelBuilder.Entity<Role>().HasData(
                new Role { Uuid = Guid.NewGuid(), RoleName = "Admin" },
                new Role { Uuid = Guid.NewGuid(), RoleName = "User" },
                new Role { Uuid = Guid.NewGuid(), RoleName = "Manager" }
            );
        }
    }
}