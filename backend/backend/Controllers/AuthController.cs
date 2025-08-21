using backend.DTOs;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly UmagDbContext _context;

        public AuthController(IAuthService authService, UmagDbContext context)
        {
            _authService = authService;
            _context = context;
        }

        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register([FromBody] Registracija dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var createdUser = await _authService.Register(dto);
                var userDto = new KorisniciDto
                {
                    Id = createdUser.Id,
                    Korisnik = createdUser.Korisnik,
                    Ime = createdUser.Ime,
                    RazinaPristupa = createdUser.RazinaPristupa
                };
                return CreatedAtAction(nameof(Register), new { id = createdUser.Id }, userDto);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] Login request)
        {
            var loginResult = await _authService.Login(request);
            if (loginResult == null)
                return Unauthorized("Invalid credentials");

            return Ok(loginResult);
        }

        [HttpPost("rfid-login")]
        [AllowAnonymous]
        public async Task<IActionResult> RfidLogin([FromBody] RfidLoginDto dto)
        {
            var user = await _context.Korisnici
                .FirstOrDefaultAsync(k => k.BrojKartice == dto.BrojKartice && k.Aktivan);

            if (user == null)
                return Unauthorized("RFID card not recognized or user inactive.");

            var userDto = new KorisniciDto
            {
                Id = user.Id,
                Korisnik = user.Korisnik,
                Ime = user.Ime,
                RazinaPristupa = user.RazinaPristupa
            };

            // Generate JWT token for RFID login
            var token = _authService.CreateToken(user);

            return Ok(new LoginResponseDto
            {
                User = userDto,
                Token = token
            });
        }
    }
}