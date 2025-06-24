using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.DTOs;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ObavijestiController : ControllerBase
    {
        private readonly UmagDbContext _context;

        public ObavijestiController(UmagDbContext context)
        {
            _context = context;
        }

        // GET: api/Obavijesti
        // Svi korisnici mogu vidjeti obavijesti
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<Obavijesti>>> GetObavijesti()
        {
            if (_context.Obavijesti == null)
            {
                return NotFound("Nije pronađen set entiteta 'Obavijesti'.");
            }
            return await _context.Obavijesti.ToListAsync();
        }

        // GET: api/Obavijesti/{id}
        // Svi korisnici mogu vidjeti pojedinačnu obavijest
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<Obavijesti>> GetObavijest(int id)
        {
            if (_context.Obavijesti == null)
            {
                return NotFound("Nije pronađen set entiteta 'Obavijesti'.");
            }

            var obavijest = await _context.Obavijesti.FindAsync(id);

            if (obavijest == null)
            {
                return NotFound($"Obavijest s ID-om {id} nije pronađena.");
            }

            return obavijest;
        }

        // POST: api/Obavijesti
        // Samo administrator može dodavati obavijesti
        [HttpPost]
        [Authorize(Roles = "Administrator")]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<Obavijesti>> PostObavijest([FromForm] ObavijestiDto obavijestDto)
        {
            if (_context.Obavijesti == null)
            {
                return Problem("Entity set 'UmagDbContext.Obavijesti' je null.");
            }

            var obavijest = new Obavijesti
            {
                ImeObavijesti = obavijestDto.ImeObavijesti,
                Opis = obavijestDto.Opis,
                DatumObjave = obavijestDto.DatumObjave,
                Aktivno = obavijestDto.Aktivno
            };

            if (obavijestDto.Slika != null && obavijestDto.Slika.Length > 0)
            {
                using var ms = new MemoryStream();
                await obavijestDto.Slika.CopyToAsync(ms);
                obavijest.Slika = ms.ToArray();
            }

            obavijest.Id = 0;

            _context.Obavijesti.Add(obavijest);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetObavijest), new { id = obavijest.Id }, new { obavijest.Id, obavijest.ImeObavijesti, obavijest.DatumObjave, obavijest.Aktivno });
        }

        // PUT: api/Obavijesti/{id}
        // Samo administrator može uređivati obavijesti
        [HttpPut("{id}")]
        [Authorize(Roles = "Administrator")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> PutObavijest(int id, [FromForm] ObavijestiDto obavijestDto)
        {
            var obavijestToUpdate = await _context.Obavijesti.FindAsync(id);

            if (obavijestToUpdate == null)
            {
                return NotFound($"Obavijest s ID-om {id} nije pronađena.");
            }

            obavijestToUpdate.ImeObavijesti = obavijestDto.ImeObavijesti;
            obavijestToUpdate.Opis = obavijestDto.Opis;
            obavijestToUpdate.DatumObjave = obavijestDto.DatumObjave;
            obavijestToUpdate.Aktivno = obavijestDto.Aktivno;

            if (obavijestDto.Slika != null && obavijestDto.Slika.Length > 0)
            {
                using var ms = new MemoryStream();
                await obavijestDto.Slika.CopyToAsync(ms);
                obavijestToUpdate.Slika = ms.ToArray();
            }

            _context.Entry(obavijestToUpdate).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ObavijestExists(id))
                {
                    return NotFound($"Obavijest s ID-om {id} nije pronađena.");
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/Obavijesti/{id}
        // Samo administrator može brisati obavijesti
        [HttpDelete("{id}")]
        [Authorize(Roles = "Administrator")]
        public async Task<IActionResult> DeleteObavijest(int id)
        {
            if (_context.Obavijesti == null)
            {
                return NotFound("Nije pronađen set entiteta 'Obavijesti'.");
            }

            var obavijest = await _context.Obavijesti.FindAsync(id);
            if (obavijest == null)
            {
                return NotFound($"Obavijest s ID-om {id} nije pronađena.");
            }

            _context.Obavijesti.Remove(obavijest);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ObavijestExists(int id)
        {
            return (_context.Obavijesti?.Any(e => e.Id == id)).GetValueOrDefault();
        }
    }
}