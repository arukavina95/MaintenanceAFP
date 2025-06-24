using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Identity.Data;
using System.Threading.Tasks;

namespace backend.Services
{
    public interface IAuthService
    {
        Task<LoginResponseDto> Login(Login loginDto); // Ispravljen tip parametra
        Task<Korisnici> Register(Registracija registerDto); // Ispravljen tip parametra
    }
}