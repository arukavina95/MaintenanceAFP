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

        public AuthController(IAuthService authService)
        {
            _authService = authService;
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
    }
}