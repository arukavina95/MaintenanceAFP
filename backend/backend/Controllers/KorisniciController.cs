using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace QCS_WebAPI.Controllers // Prilagodite namespaceu vašeg projekta
{
    [Authorize(Roles = "Administrator")]
    [ApiController]
    [Route("api/[controller]")]
    public class KorisniciController : ControllerBase // Nasljeđuje ControllerBase za API kontrolere
    {
        private readonly UmagDbContext _context; // Instanca DbContexta za rad s bazom

        // Konstruktor - EF Core će automatski injektirati QCSDatabaseContext
        public KorisniciController(UmagDbContext context)
        {
            _context = context;
        }

        // GET: api/Korisnici
        // Dohvaća sve korisnike iz baze podataka
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Korisnici>>> GetKorisnici()
        {
            // Provjerava je li DbSet Korisnici null prije pristupa
            if (_context.Korisnici == null)
            {
                return NotFound(); // Vraća 404 Not Found ako tablica nije dostupna
            }
            // Asinkrono dohvaća sve korisnike i vraća ih kao listu
            return await _context.Korisnici.ToListAsync();
        }

        // GET: api/Korisnici/5
        // Dohvaća pojedinog korisnika po ID-u
        [HttpGet("{id}")]
        public async Task<ActionResult<Korisnici>> GetKorisnik(int id)
        {
            if (_context.Korisnici == null)
            {
                return NotFound(); // Vraća 404 Not Found ako tablica nije dostupna
            }

            // Asinkrono pronalazi korisnika po ID-u
            var korisnik = await _context.Korisnici.FindAsync(id);

            if (korisnik == null)
            {
                return NotFound(); // Vraća 404 Not Found ako korisnik s danim ID-om ne postoji
            }

            return korisnik; // Vraća pronađenog korisnika
        }

        // PUT: api/Korisnici/5
        // Ažurira postojećeg korisnika
        // Zahtijeva da se ID u URL-u podudara s ID-em u tijelu zahtjeva
        [HttpPut("{id}")]
        public async Task<IActionResult> PutKorisnici(int id, Korisnici korisnici)
        {
            // Provjerava podudarnost ID-a
            if (id != korisnici.Id)
            {
                return BadRequest(); // Vraća 400 Bad Request ako se ID-evi ne podudaraju
            }

            // Označava entitet kao modificiran
            _context.Entry(korisnici).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync(); // Sprema promjene u bazu
            }
            catch (DbUpdateConcurrencyException)
            {
                // Rukovanje konkurentnim pristupom ako je entitet u međuvremenu izmijenjen/obrisan
                if (!KorisniciExists(id))
                {
                    return NotFound(); // Vraća 404 Not Found ako korisnik više ne postoji
                }
                else
                {
                    throw; // Baca iznimku za druge probleme
                }
            }

            return NoContent(); // Vraća 204 No Content za uspješno ažuriranje bez vraćanja podataka
        }

        // POST: api/Korisnici
        // Kreira novog korisnika
        // Vraća 201 CreatedAtAction s lokacijom novog resursa
        [HttpPost]
        public async Task<ActionResult<Korisnici>> PostKorisnici(Korisnici korisnici)
        {
            if (_context.Korisnici == null)
            {
                return Problem("Entity set 'QCSDatabaseContext.Korisnici' is null.");
            }

            // Dodaje novog korisnika u kontekst
            _context.Korisnici.Add(korisnici);
            await _context.SaveChangesAsync(); // Sprema novog korisnika u bazu

            // Vraća 201 CreatedAtAction, s lokacijom novog resursa i kreiranim objektom
            return CreatedAtAction("GetKorisnik", new { id = korisnici.Id }, korisnici);
        }

        // DELETE: api/Korisnici/5
        // Briše korisnika po ID-u
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteKorisnici(int id)
        {
            if (_context.Korisnici == null)
            {
                return NotFound(); // Vraća 404 Not Found ako tablica nije dostupna
            }

            // Pronalazi korisnika za brisanje
            var korisnici = await _context.Korisnici.FindAsync(id);
            if (korisnici == null)
            {
                return NotFound(); // Vraća 404 Not Found ako korisnik ne postoji
            }

            // Uklanja korisnika iz konteksta
            _context.Korisnici.Remove(korisnici);
            await _context.SaveChangesAsync(); // Sprema promjene (briše korisnika)

            return NoContent(); // Vraća 204 No Content za uspješno brisanje
        }



        // GET: api/Korisnici/OdjeliPrijave
        [HttpGet("OdjeliPrijave")]
        [AllowAnonymous] // ili [Authorize] ako želiš ograničiti pristup
        public async Task<ActionResult<IEnumerable<OdjelPrijave>>> GetOdjeliPrijave()
        {
            if (_context.OdjelPrijave == null)
            {
                return NotFound("Nije pronađen set entiteta 'OdjelPrijave'.");
            }
            return await _context.OdjelPrijave.Where(o => o.Aktivan).ToListAsync();
        }


        // Pomoćna metoda za provjeru postojanja korisnika
        private bool KorisniciExists(int id)
        {
            return (_context.Korisnici?.Any(e => e.Id == id)).GetValueOrDefault();
        }

        //Promjena lozinke 
        [HttpPut("{id}/PromjenaLozinke")]
        public async Task<IActionResult> ChangePassword(int id, [FromBody] PromjenaLozinkeDto dto)
        {
            var korisnik = await _context.Korisnici.FindAsync(id);
            if (korisnik == null)
                return NotFound();

            using var hmac = new System.Security.Cryptography.HMACSHA512();
            korisnik.LozinkaHash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(dto.NovaLozinka));
            korisnik.LozinkaSalt = hmac.Key;

            await _context.SaveChangesAsync();
            return Ok();
        }

    }
}
