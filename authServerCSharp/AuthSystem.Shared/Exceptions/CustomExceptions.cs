namespace AuthSystem.Shared.Exceptions
{
    public class AuthenticationException : Exception
    {
        public AuthenticationException(string message) : base(message) { }
    }

    public class UserNotFoundException : AuthenticationException
    {
        public UserNotFoundException() : base("User not found") { }
    }

    public class InvalidCredentialsException : AuthenticationException
    {
        public InvalidCredentialsException() : base("Invalid username or password") { }
    }

    public class TokenValidationException : AuthenticationException
    {
        public TokenValidationException(string message) : base(message) { }
    }

    public class KeyManagementException : Exception
    {
        public KeyManagementException(string message) : base(message) { }
    }
}