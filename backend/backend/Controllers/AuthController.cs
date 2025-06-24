using backend.DTOs;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly UmagDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(IAuthService authService, UmagDbContext context, IConfiguration configuration)
        {
            _authService = authService;
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<ActionResult<KorisniciDto>> Register([FromBody] Registracija request)
        {
            if (_context.Korisnici.Any(u => u.Korisnik == request.Username))
                return BadRequest("Username already exists");

            using var hmac = new System.Security.Cryptography.HMACSHA512();
            var newUser = new Korisnici
            {
                Korisnik = request.Username,
                Ime = request.Ime,
                LozinkaHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(request.Password)),
                LozinkaSalt = hmac.Key,
                BrojKartice = request.BrojKartice,
                Potpis = request.Potpis,
                Odjel = request.Odjel,
                Aktivan = request.Aktivan,
                RazinaPristupa = request.RazinaPristupa,
                DatumRodenja = request.DatumRodenja,
                ZaposlenOd = request.ZaposlenOd,
                UkupnoDanaGo = request.UkupnoDanaGo,
                UkupnoDanaStarogGo = request.UkupnoDanaStarogGo
            };

            // Fix: Map the Korisnici object to a Registracija object before passing it to the Register method
            var registerDto = new Registracija
            {
                Username = newUser.Korisnik,
                Password = request.Password,
                Ime = newUser.Ime,
                BrojKartice = newUser.BrojKartice,
                Potpis = newUser.Potpis,
                Odjel = newUser.Odjel,
                Aktivan = newUser.Aktivan,
                RazinaPristupa = newUser.RazinaPristupa,
                DatumRodenja = newUser.DatumRodenja,
                ZaposlenOd = newUser.ZaposlenOd,
                UkupnoDanaGo = newUser.UkupnoDanaGo,
                UkupnoDanaStarogGo = newUser.UkupnoDanaStarogGo
            };

            var createdUser = await _authService.Register(registerDto);
            var userDto = new KorisniciDto
            {
                Id = createdUser.Id,
                Korisnik = createdUser.Korisnik,
                Ime = createdUser.Ime,
                RazinaPristupa = createdUser.RazinaPristupa
            };
            return CreatedAtAction(nameof(Register), new { id = createdUser.Id }, userDto);
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public IActionResult Login([FromBody] Login request)
        {
            var user = _context.Korisnici.FirstOrDefault(u => u.Korisnik == request.Username);
            if (user == null)
                return Unauthorized("Invalid credentials");

            using var hmac = new System.Security.Cryptography.HMACSHA512(user.LozinkaSalt);
            var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(request.Password));

            if (!computedHash.SequenceEqual(user.LozinkaHash))
                return Unauthorized("Invalid credentials");

            var token = GenerateJwtToken(user);
            var userDto = new KorisniciDto
            {
                Id = user.Id,
                Korisnik = user.Korisnik,
                Ime = user.Ime,
                RazinaPristupa = user.RazinaPristupa
            };

            return Ok(new { token, user = userDto });
        }

        private string GenerateJwtToken(Korisnici user)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.Name, user.Korisnik),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Role, user.RazinaPristupa == 1 ? "Administrator" : "Korisnik")
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["AppSettings:Token"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["AppSettings:Issuer"],
                audience: _configuration["AppSettings:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}