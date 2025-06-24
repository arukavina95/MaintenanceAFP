using backend.Models;

namespace backend.DTOs
{
    public class LoginResponseDto
    {
        public KorisniciDto User { get; set; } // Promijenjeno iz UserDto u KorisniciDto
        public string Token { get; set; }
    }
}
