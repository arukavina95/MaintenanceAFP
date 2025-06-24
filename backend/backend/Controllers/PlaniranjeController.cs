using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
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

        // GET: api/Planiranje/Strojevi
        [HttpGet("Strojevi")]
        public async Task<ActionResult<IEnumerable<Strojevi>>> GetStrojevi()
        {
            return await _context.Strojevi.ToListAsync();
        }

        // GET: api/Planiranje
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Planiranje>>> GetPlaniranja()
        {
            return await _context.Planiranja.Include(p => p.Stroj).ToListAsync();
        }

        // POST: api/Planiranje
        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult> PostPlaniranje([FromForm] PlaniranjeDto dto)
        {
            var plan = new Planiranje
            {
                VrstaZadataka = dto.VrstaZadataka,
                PocetniDatum = dto.PocetniDatum,
                ZavrsniDatum = dto.ZavrsniDatum,
                StrojId = dto.StrojId,
                Smjena = dto.Smjena,
                Opis = dto.Opis,
                Status = dto.Status
               
            };

            if (dto.Privitak != null && dto.Privitak.Length > 0)
            {
                using var ms = new MemoryStream();
                await dto.Privitak.CopyToAsync(ms);
                plan.Privitak = ms.ToArray();
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

            plan.VrstaZadataka = dto.VrstaZadataka;
            plan.PocetniDatum = dto.PocetniDatum;
            plan.ZavrsniDatum = dto.ZavrsniDatum;
            plan.StrojId = dto.StrojId;
            plan.Smjena = dto.Smjena;
            plan.Opis = dto.Opis;
            plan.Status = dto.Status;

            if (dto.Privitak != null && dto.Privitak.Length > 0)
            {
                using var ms = new MemoryStream();
                await dto.Privitak.CopyToAsync(ms);
                plan.Privitak = ms.ToArray();
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

        // DELETE: api/Planiranje/{id}
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