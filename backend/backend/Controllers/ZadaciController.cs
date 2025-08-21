using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/zadaci-ev")]
    public class ZadaciController : ControllerBase
    {
        private readonly UmagDbContext _context;

        public ZadaciController(UmagDbContext context)
        {
            _context = context;
        }

        // GET /api/zadaci-ev - Fetch all records
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ZadaciDto>>> GetZadaci()
        {
            var zadaci = await _context.Zadaci.ToListAsync();
            return Ok(zadaci);
        }

        // POST /api/zadaci-ev - Create a new record
        [HttpPost]
        public async Task<ActionResult<ZadaciDto>> CreateZadatak([FromBody] ZadaciDto zadaciDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var zadatak = new Zadaci
            {
                Broj = zadaciDto.Broj,
                Datum = zadaciDto.Datum,
                Smjena = zadaciDto.Smjena,
                Djelatnik = zadaciDto.Djelatnik,
                Odjel = zadaciDto.Odjel,
                ProstorRada = zadaciDto.ProstorRada,
                Stroj = zadaciDto.Stroj,
                OpisRada = zadaciDto.OpisRada,
                ElePoz = zadaciDto.ElePoz,
                SatiRada = zadaciDto.SatiRada,
                UgradeniDijelovi = zadaciDto.UgradeniDijelovi,
                Napomena= zadaciDto.Napomena
            };

            _context.Zadaci.Add(zadatak);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetZadaci), new { id = zadatak.Id }, zadatak);
        }

        // PUT /api/zadaci-ev/{id} - Update a record
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateZadatak(int id, [FromBody] ZadaciDto zadaciDto)
        {
            if (id != zadaciDto.Id)
                return BadRequest("ID in URL does not match ID in body.");

            var zadatak = await _context.Zadaci.FindAsync(id);
            if (zadatak == null)
                return NotFound("Zadatak not found.");

            zadatak.Broj = zadaciDto.Broj;
            zadatak.Datum = zadaciDto.Datum;
            zadatak.Smjena = zadaciDto.Smjena;
            zadatak.Djelatnik = zadaciDto.Djelatnik;
            zadatak.Odjel = zadaciDto.Odjel;
            zadatak.ProstorRada = zadaciDto.ProstorRada;
            zadatak.Stroj = zadaciDto.Stroj;
            zadatak.OpisRada = zadaciDto.OpisRada;
            zadatak.ElePoz = zadaciDto.ElePoz;
            zadatak.SatiRada = zadaciDto.SatiRada;
            zadatak.UgradeniDijelovi = zadaciDto.UgradeniDijelovi;
            zadatak.Napomena = zadaciDto.Napomena;  

            _context.Entry(zadatak).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE /api/zadaci-ev/{id} - Delete a record
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteZadatak(int id)
        {
            var zadatak = await _context.Zadaci.FindAsync(id);
            if (zadatak == null)
                return NotFound("Zadatak not found.");

            _context.Zadaci.Remove(zadatak);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}