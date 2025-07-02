using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PlaniranjeController : ControllerBase
    {
        private readonly UmagDbContext _context;

        public PlaniranjeController(UmagDbContext context)
        {
            _context = context;
        }

        [HttpGet("StrojeviNaslovi")]
        public async Task<ActionResult<IEnumerable<string>>> GetStrojeviNaslovi()
        {
            var naslovi = await _context.Strojevi.Select(s => s.Naslov).ToListAsync();
            return Ok(naslovi);
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<PlaniranjeListDto>>> GetPlaniranja()
        {
            var planiranja = await _context.Planiranja
                .Include(p => p.Stroj)
                .Include(p => p.Korisnik)
                .Select(p => new PlaniranjeListDto
                {
                    Id = p.Id,
                    VrstaZadataka = p.VrstaZadataka,
                    PocetniDatum = p.PocetniDatum,
                    ZavrsniDatum = p.ZavrsniDatum,
                    StrojId = p.StrojId,
                    StrojNaslov = p.Stroj.Naslov,
                    Smjena = p.Smjena,
                    Opis = p.Opis,
                    Status = p.Status,
                    KorisnikId = p.KorisnikId,
                    KorisnikIme = p.Korisnik.Ime
                })
                .ToListAsync();

            return Ok(planiranja);
        }

        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult> PostPlaniranje([FromForm] PlaniranjeDto dto)
        {
            // Dohvati ID korisnika iz JWT tokena
            var korisnikIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(korisnikIdString, out var korisnikId))
                return Unauthorized("Neispravan korisnički token.");

            var plan = new Planiranje
            {
                VrstaZadataka = dto.VrstaZadataka,
                PocetniDatum = dto.PocetniDatum,
                ZavrsniDatum = dto.ZavrsniDatum,
                StrojId = dto.StrojId,
                Smjena = dto.Smjena,
                Opis = dto.Opis,
                Status = dto.Status,
                KorisnikId = korisnikId // automatski iz tokena!
            };

            if (dto.Privitak != null && dto.Privitak.Length > 0)
            {
                var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
                Directory.CreateDirectory(uploadsFolder);

                var uniqueFileName = $"{Guid.NewGuid()}_{dto.Privitak.FileName}";
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await dto.Privitak.CopyToAsync(stream);
                }

                plan.PrivitakPath = $"/uploads/{uniqueFileName}";
            }

            _context.Planiranja.Add(plan);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPlaniranja), new { id = plan.Id }, plan);
        }

        [HttpPut("{id}")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> PutPlaniranje(int id, [FromForm] PlaniranjeDto dto)
        {
            var plan = await _context.Planiranja.FindAsync(id);
            if (plan == null)
                return NotFound($"Planiranje s ID-om {id} nije pronađeno.");

            // Dohvati ID korisnika iz JWT tokena
            var korisnikIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(korisnikIdString, out var korisnikId))
                return Unauthorized("Neispravan korisnički token.");

            plan.VrstaZadataka = dto.VrstaZadataka;
            plan.PocetniDatum = dto.PocetniDatum;
            plan.ZavrsniDatum = dto.ZavrsniDatum;
            plan.StrojId = dto.StrojId;
            plan.Smjena = dto.Smjena;
            plan.Opis = dto.Opis;
            plan.Status = dto.Status;
            plan.KorisnikId = korisnikId; // automatski iz tokena!

            if (dto.Privitak != null && dto.Privitak.Length > 0)
            {
                var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
                Directory.CreateDirectory(uploadsFolder);

                var uniqueFileName = $"{Guid.NewGuid()}_{dto.Privitak.FileName}";
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await dto.Privitak.CopyToAsync(stream);
                }

                plan.PrivitakPath = $"/uploads/{uniqueFileName}";
            }

            _context.Entry(plan).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Planiranja.Any(e => e.Id == id))
                    return NotFound($"Planiranje s ID-om {id} nije pronađeno.");
                else
                    throw;
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePlaniranje(int id)
        {
            var plan = await _context.Planiranja.FindAsync(id);
            if (plan == null)
                return NotFound($"Planiranje s ID-om {id} nije pronađeno.");

            _context.Planiranja.Remove(plan);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}