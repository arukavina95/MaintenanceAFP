using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.IO;
using System;
using System.Linq;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class RadniNaloziController : ControllerBase
{
    private readonly UmagDbContext _context;

    public RadniNaloziController(UmagDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [Produces("application/json")]
    public async Task<ActionResult<IEnumerable<RadniNalogResponseDto>>> GetRadniNalozi()
    {
        var nalozi = await _context.RadniNalozi
            .Include(rn => rn.OdjelPrijave)
            .Include(rn => rn.Ustanovio)
            .Include(rn => rn.Stroj)
            .Include(rn => rn.Odradio)
            .Include(rn => rn.Sudjelovali).ThenInclude(s => s.Korisnik)
            .ToListAsync();

        var result = nalozi.Select(rn => new RadniNalogResponseDto
        {
            Id = rn.Id,
            BrojRN = rn.BrojRN,
            Naslov = rn.Naslov,
            DatumPrijave = rn.DatumPrijave,
            Status = rn.Status,
            OpisKvara = rn.OpisKvara,
            StupanjHitnosti = rn.StupanjHitnosti,
            OtklonitiDo = rn.OtklonitiDo,
            VrstaNaloga = rn.VrstaNaloga,
            Obrazlozenje = rn.Obrazlozenje,
            TehnoloskaOznaka = rn.TehnoloskaOznaka,
            NacinRjesavanja = rn.NacinRjesavanja,
            UtrosenoMaterijala = rn.UtrosenoMaterijala,
            Napomena = rn.Napomena,
            DatumZatvaranja = rn.DatumZatvaranja,
            OdjelPrijave = rn.OdjelPrijave?.Naslov,
            Ustanovio = rn.Ustanovio?.Ime,
            Stroj = rn.Stroj?.Naslov,
            ZaOdjel = rn.ZaOdjel,
            Odradio = rn.Odradio?.Ime,
            DodijeljenoId = rn.DodijeljenoId, // DODANO
            DatumVrijemeDodjele = rn.DatumVrijemeDodjele.ToString(), // DODANO
            Sudionici = rn.Sudjelovali.Select(s => new KorisniciDto
            {
                Id = s.KorisnikId,
                Ime = s.Korisnik.Ime,
                Korisnik = s.Korisnik.Korisnik,
                RazinaPristupa = s.Korisnik.RazinaPristupa
            }).ToList()
        }).ToList();

        return Ok(result);
    }

    [HttpGet("{id}")]
    [Produces("application/json")]
    public async Task<ActionResult<RadniNalogResponseDto>> GetRadniNalog(int id)
    {
        var rn = await _context.RadniNalozi
            .Include(rn => rn.OdjelPrijave)
            .Include(rn => rn.Ustanovio)
            .Include(rn => rn.Stroj)
            .Include(rn => rn.Odradio)
            .Include(rn => rn.Sudjelovali).ThenInclude(s => s.Korisnik)
            .FirstOrDefaultAsync(rn => rn.Id == id);

        if (rn == null)
            return NotFound();

        var result = new RadniNalogResponseDto
        {
            Id = rn.Id,
            BrojRN = rn.BrojRN,
            Naslov = rn.Naslov,
            DatumPrijave = rn.DatumPrijave,
            Status = rn.Status,
            OpisKvara = rn.OpisKvara,
            StupanjHitnosti = rn.StupanjHitnosti,
            OtklonitiDo = rn.OtklonitiDo,
            VrstaNaloga = rn.VrstaNaloga,
            Obrazlozenje = rn.Obrazlozenje,
            TehnoloskaOznaka = rn.TehnoloskaOznaka,
            NacinRjesavanja = rn.NacinRjesavanja,
            UtrosenoMaterijala = rn.UtrosenoMaterijala,
            Napomena = rn.Napomena,
            DatumZatvaranja = rn.DatumZatvaranja,
            OdjelPrijave = rn.OdjelPrijave?.Naslov,
            Ustanovio = rn.Ustanovio?.Ime,
            Stroj = rn.Stroj?.Naslov,
            Odradio = rn.Odradio?.Ime,
            DodijeljenoId = rn.DodijeljenoId, // DODANO
            DatumVrijemeDodjele = rn.DatumVrijemeDodjele.ToString(), // DODANO
            Sudionici = rn.Sudjelovali.Select(s => new KorisniciDto
            {
                Id = s.KorisnikId,
                Ime = s.Korisnik.Ime,
                Korisnik = s.Korisnik.Korisnik,
                RazinaPristupa = s.Korisnik.RazinaPristupa
            }).ToList()
        };

        return Ok(result);
    }

    [HttpPost]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> PostRadniNalog([FromForm] RadniNalogDto dto)
    {
        var nalog = new RadniNalog
        {
            BrojRN = dto.BrojRN,
            Naslov = dto.Naslov,
            OdjelPrijaveId = dto.OdjelPrijaveId,
            UstanovioId = dto.UstanovioId,
            DatumPrijave = dto.DatumPrijave,
            StrojId = dto.StrojId,
            OpisKvara = dto.OpisKvara,
            ZaOdjel = dto.ZaOdjel,
            StupanjHitnosti = dto.StupanjHitnosti,
            OtklonitiDo = dto.OtklonitiDo,
            VrstaNaloga = dto.VrstaNaloga,
            Status = dto.Status,
            Obrazlozenje = dto.Obrazlozenje,
            TehnoloskaOznaka = dto.TehnoloskaOznaka,
            NacinRjesavanja = dto.NacinRjesavanja,
            UtrosenoMaterijala = dto.UtrosenoMaterijala,
            DatumZatvaranja = dto.DatumZatvaranja,
            Napomena = dto.Napomena,
            OdradioId = dto.OdradioId,
            SatiRada = dto.SatiRada,
            RDIFOPrema = dto.RDIFOPrema,
            DatumVrijemePreuzimanja = dto.DatumVrijemePreuzimanja,
            DodijeljenoId = dto.DodijeljenoId,
            DatumVrijemeDodjele = dto.DatumVrijemeDodjele,
            Sudjelovali = dto.SudjelovaliIds?.Select(id => new RadniNalogSudionik { KorisnikId = id }).ToList()
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

            nalog.PrivitakPath = $"/uploads/{uniqueFileName}";
        }

        // Potpis iz korisnika
        var korisnik = await _context.Korisnici.FindAsync(dto.UstanovioId);
        nalog.Potpis = korisnik?.Potpis;

        _context.RadniNalozi.Add(nalog);
        await _context.SaveChangesAsync();

        // Fetch the created entity with includes if needed
        var created = await _context.RadniNalozi
            .Include(rn => rn.OdjelPrijave)
            .Include(rn => rn.Ustanovio)
            .Include(rn => rn.Stroj)
            .Include(rn => rn.Odradio)
            .Include(rn => rn.Sudjelovali).ThenInclude(s => s.Korisnik)
            .FirstOrDefaultAsync(rn => rn.Id == nalog.Id);

        var result = new RadniNalogResponseDto
        {
            Id = created.Id,
            BrojRN = created.BrojRN,
            Naslov = created.Naslov,
            DatumPrijave = created.DatumPrijave,
            Status = created.Status,
            OpisKvara = created.OpisKvara,
            StupanjHitnosti = created.StupanjHitnosti,
            OtklonitiDo = created.OtklonitiDo,
            VrstaNaloga = created.VrstaNaloga,
            Obrazlozenje = created.Obrazlozenje,
            TehnoloskaOznaka = created.TehnoloskaOznaka,
            NacinRjesavanja = created.NacinRjesavanja,
            UtrosenoMaterijala = created.UtrosenoMaterijala,
            Napomena = created.Napomena,
            DatumZatvaranja = created.DatumZatvaranja,
            OdjelPrijave = created.OdjelPrijave?.Naslov,
            Ustanovio = created.Ustanovio?.Ime,
            Stroj = created.Stroj?.Naslov,
            ZaOdjel = created.ZaOdjel,
            Odradio = created.Odradio?.Ime,
            DodijeljenoId = created.DodijeljenoId, // DODANO
            DatumVrijemeDodjele = created.DatumVrijemeDodjele.ToString(), // DODANO
            Sudionici = created.Sudjelovali.Select(s => new KorisniciDto
            {
                Id = s.KorisnikId,
                Ime = s.Korisnik.Ime,
                Korisnik = s.Korisnik.Korisnik,
                RazinaPristupa = s.Korisnik.RazinaPristupa
            }).ToList()
        };

        return CreatedAtAction(nameof(GetRadniNalog), new { id = created.Id }, result);
    }

    [HttpPut("{id}")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> PutRadniNalog(int id, [FromForm] RadniNalogDto dto)
    {
        var nalog = await _context.RadniNalozi
            .Include(rn => rn.Sudjelovali)
            .FirstOrDefaultAsync(rn => rn.Id == id);

        if (nalog == null)
            return NotFound();

        nalog.BrojRN = dto.BrojRN;
        nalog.Naslov = dto.Naslov;
        nalog.OdjelPrijaveId = dto.OdjelPrijaveId;
        nalog.UstanovioId = dto.UstanovioId;
        nalog.DatumPrijave = dto.DatumPrijave;
        nalog.StrojId = dto.StrojId;
        nalog.OpisKvara = dto.OpisKvara;
        nalog.ZaOdjel = dto.ZaOdjel;
        nalog.StupanjHitnosti = dto.StupanjHitnosti;
        nalog.OtklonitiDo = dto.OtklonitiDo;
        nalog.VrstaNaloga = dto.VrstaNaloga;
        nalog.Status = dto.Status;
        nalog.Obrazlozenje = dto.Obrazlozenje;
        nalog.TehnoloskaOznaka = dto.TehnoloskaOznaka;
        nalog.NacinRjesavanja = dto.NacinRjesavanja;
        nalog.UtrosenoMaterijala = dto.UtrosenoMaterijala;
        nalog.DatumZatvaranja = dto.DatumZatvaranja;
        nalog.Napomena = dto.Napomena;
        nalog.OdradioId = dto.OdradioId;
        nalog.SatiRada = dto.SatiRada;
        nalog.RDIFOPrema = dto.RDIFOPrema;
        nalog.DatumVrijemePreuzimanja = dto.DatumVrijemePreuzimanja;
        nalog.DodijeljenoId = dto.DodijeljenoId;
        nalog.DatumVrijemeDodjele = dto.DatumVrijemeDodjele;

        // Update sudionici
        nalog.Sudjelovali?.Clear();
        if (dto.SudjelovaliIds != null)
        {
            nalog.Sudjelovali = dto.SudjelovaliIds.Select(id => new RadniNalogSudionik { KorisnikId = id }).ToList();
        }

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

            nalog.PrivitakPath = $"/uploads/{uniqueFileName}";
        }

        // Potpis iz korisnika
        var korisnik = await _context.Korisnici.FindAsync(dto.UstanovioId);
        nalog.Potpis = korisnik?.Potpis;

        _context.Entry(nalog).State = EntityState.Modified;
        await _context.SaveChangesAsync();

        // Fetch the updated entity with includes if needed
        var updated = await _context.RadniNalozi
            .Include(rn => rn.OdjelPrijave)
            .Include(rn => rn.Ustanovio)
            .Include(rn => rn.Stroj)
            .Include(rn => rn.Odradio)
            .Include(rn => rn.Sudjelovali).ThenInclude(s => s.Korisnik)
            .FirstOrDefaultAsync(rn => rn.Id == nalog.Id);

        var result = new RadniNalogResponseDto
        {
            Id = updated.Id,
            BrojRN = updated.BrojRN,
            Naslov = updated.Naslov,
            DatumPrijave = updated.DatumPrijave,
            Status = updated.Status,
            OpisKvara = updated.OpisKvara,
            StupanjHitnosti = updated.StupanjHitnosti,
            OtklonitiDo = updated.OtklonitiDo,
            VrstaNaloga = updated.VrstaNaloga,
            Obrazlozenje = updated.Obrazlozenje,
            TehnoloskaOznaka = updated.TehnoloskaOznaka,
            NacinRjesavanja = updated.NacinRjesavanja,
            UtrosenoMaterijala = updated.UtrosenoMaterijala,
            Napomena = updated.Napomena,
            DatumZatvaranja = updated.DatumZatvaranja,
            OdjelPrijave = updated.OdjelPrijave?.Naslov,
            Ustanovio = updated.Ustanovio?.Ime,
            Stroj = updated.Stroj?.Naslov,
            ZaOdjel = updated.ZaOdjel,
            Odradio = updated.Odradio?.Ime,
            DodijeljenoId = updated.DodijeljenoId, // DODANO
            DatumVrijemeDodjele = updated.DatumVrijemeDodjele.ToString(), // DODANO
            Sudionici = updated.Sudjelovali.Select(s => new KorisniciDto
            {
                Id = s.KorisnikId,
                Ime = s.Korisnik.Ime,
                Korisnik = s.Korisnik.Korisnik,
                RazinaPristupa = s.Korisnik.RazinaPristupa
            }).ToList()
        };

        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRadniNalog(int id)
    {
        var nalog = await _context.RadniNalozi
            .Include(rn => rn.Sudjelovali)
            .FirstOrDefaultAsync(rn => rn.Id == id);

        if (nalog == null)
            return NotFound();

        _context.RadniNalozi.Remove(nalog);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}


