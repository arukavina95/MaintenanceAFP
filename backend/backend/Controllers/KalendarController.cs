using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    //[Authorize] // Only authenticated users
    public class KalendarController : ControllerBase
    {
        private readonly UmagDbContext _context;

        public KalendarController(UmagDbContext context)
        {
            _context = context;
        }

        // GET: api/Kalendar
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetKalendar()
        {
            var result = await _context.Kalendari
                .Include(k => k.Korisnik)
                .Select(k => new
                {
                    k.Id,
                    k.KorisnikId,
                    k.PocetniDatum,
                    k.ZavrsniDatum,
                    RazlogIzostankaNaziv = k.RazlogIzostanka.ToString(),
                    k.PrivitakPath,
                    k.PrivitakNaziv,
                    ImeKorisnika = k.Korisnik != null ? k.Korisnik.Ime : null
                })
                .ToListAsync();

            return Ok(result);
        }

        // GET: api/Kalendar/korisnik/5
        [HttpGet("korisnik/{korisnikId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetKalendarForUser(int korisnikId)
        {
            var result = await _context.Kalendari
                .Where(k => k.KorisnikId == korisnikId)
                .Include(k => k.Korisnik)
                .Select(k => new
                {
                    k.Id,
                    k.KorisnikId,
                    k.PocetniDatum,
                    k.ZavrsniDatum,
                    k.RazlogIzostanka,
                    k.PrivitakPath,
                    k.PrivitakNaziv,
                    ImeKorisnika = k.Korisnik != null ? k.Korisnik.Ime : null
                })
                .ToListAsync();

            return Ok(result);
        }

        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult> PostKalendar([FromForm] KalendarDto dto)
        {
            var kalendar = new Kalendar
            {
                KorisnikId = dto.KorisnikId,
                PocetniDatum = dto.PocetniDatum,
                ZavrsniDatum = dto.ZavrsniDatum,
                RazlogIzostanka = dto.RazlogIzostanka
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

                kalendar.PrivitakPath = $"/uploads/{uniqueFileName}";
                kalendar.PrivitakNaziv = dto.Privitak.FileName;
            }

            _context.Kalendari.Add(kalendar);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetKalendar), new { id = kalendar.Id }, kalendar);
        }

        [HttpPut("{id}")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> PutKalendar(int id, [FromForm] KalendarDto dto)
        {
            var kalendar = await _context.Kalendari.FindAsync(id);
            if (kalendar == null)
                return NotFound($"Kalendar s ID-om {id} nije pronađen.");

            kalendar.KorisnikId = dto.KorisnikId;
            kalendar.PocetniDatum = dto.PocetniDatum;
            kalendar.ZavrsniDatum = dto.ZavrsniDatum;
            kalendar.RazlogIzostanka = dto.RazlogIzostanka;

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

                kalendar.PrivitakPath = $"/uploads/{uniqueFileName}";
                kalendar.PrivitakNaziv = dto.Privitak.FileName;
            }

            _context.Entry(kalendar).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _context.Kalendari.AnyAsync(e => e.Id == id))
                    return NotFound($"Kalendar s ID-om {id} nije pronađen.");
                else
                    throw;
            }

            return NoContent();
        }

        // DELETE: api/Kalendar/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteKalendar(int id)
        {
            var kalendar = await _context.Kalendari.FindAsync(id);
            if (kalendar == null)
                return NotFound($"Kalendar s ID-om {id} nije pronađen.");

            _context.Kalendari.Remove(kalendar);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("razlozi-izostanka")]
        [AllowAnonymous]
        public ActionResult<IEnumerable<string>> GetRazloziIzostanka()
        {
            return Enum.GetNames(typeof(RazlogIzostanka));
        }
    }
}