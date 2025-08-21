
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace backend.Services
{
    public class AuthService : IAuthService
    {
        private readonly UmagDbContext _context; // Vaš DbContext
        private readonly IConfiguration _configuration;

        public AuthService(UmagDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<Korisnici> Register(Registracija registerDto)
        {
            if (await _context.Korisnici.AnyAsync(u => u.Korisnik == registerDto.Username))
            {
                throw new ArgumentException("Korisničko ime već postoji.");
            }

            // Implementacija hashiranja lozinke
            CreatePasswordHash(registerDto.Password, out byte[] passwordHash, out byte[] passwordSalt);

            var newUser = new Korisnici
            {
                Korisnik = registerDto.Username,
                Ime = registerDto.Ime,
                LozinkaHash = passwordHash, 
                LozinkaSalt = passwordSalt,
                BrojKartice = registerDto.BrojKartice,
                Potpis = registerDto.Potpis,
                Odjel = registerDto.Odjel,
                Aktivan = registerDto.Aktivan,
                RazinaPristupa = registerDto.RazinaPristupa ?? 2, 
                DatumRodenja = registerDto.DatumRodenja,
                ZaposlenOd = registerDto.ZaposlenOd,
                UkupnoDanaGo = registerDto.UkupnoDanaGo,
                UkupnoDanaStarogGo = registerDto.UkupnoDanaStarogGo
            };

            _context.Korisnici.Add(newUser);
            await _context.SaveChangesAsync();

            return newUser;
        }

        public async Task<LoginResponseDto> Login(Login loginDto)
        {
            var user = await _context.Korisnici
                .FirstOrDefaultAsync(u => u.Korisnik == loginDto.Username);

            if (user == null)
            {
                return null; // Korisnik nije pronađen
            }

            // Provjera lozinke s hashiranim vrijednostima
            if (!VerifyPasswordHash(loginDto.Password, user.LozinkaHash, user.LozinkaSalt))
            {
                return null; // Pogrešna lozinka
            }

            // Korisnik je uspješno prijavljen, generiraj JWT token
            var token = CreateToken(user);

            var userDto = new KorisniciDto
            {
                Id = user.Id,
                Korisnik = user.Korisnik,
                Ime = user.Ime,
                RazinaPristupa = user.RazinaPristupa
            };

            return new LoginResponseDto { User = userDto, Token = token };
        }

        // Pomoćne metode za hashiranje/provjeru lozinke
        private void CreatePasswordHash(string password, out byte[] passwordHash, out byte[] passwordSalt)
        {
            using (var hmac = new HMACSHA512())
            {
                passwordSalt = hmac.Key;
                passwordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
            }
        }

        private bool VerifyPasswordHash(string password, byte[] passwordHash, byte[] passwordSalt)
        {
            using (var hmac = new HMACSHA512(passwordSalt))
            {
                var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
                for (int i = 0; i < computedHash.Length; i++)
                {
                    if (computedHash[i] != passwordHash[i]) return false;
                }
            }
            return true;
        }

        // Metoda za generiranje JWT tokena
        public string CreateToken(Korisnici user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Korisnik),
                // Dodajte ClaimTypes.Role na temelju RazinaPristupa
                new Claim(ClaimTypes.Role, user.RazinaPristupa == 1 ? "Administrator" : "Korisnik") // Mapiramo 1 na "Admin", ostalo na "Korisnik"
            };

            var tokenKey = _configuration.GetSection("AppSettings:Token").Value;
            if (string.IsNullOrEmpty(tokenKey))
            {
                throw new InvalidOperationException("JWT Token key is not configured in appsettings.json.");
            }
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(tokenKey));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.Now.AddDays(7), // Token istječe za 7 dana
                SigningCredentials = creds,
                Issuer = _configuration.GetSection("AppSettings:Issuer").Value,
                Audience = _configuration.GetSection("AppSettings:Audience").Value
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }
    }
}