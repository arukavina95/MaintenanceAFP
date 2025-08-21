using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/izvodaci")]
    public class IzvodaciController : ControllerBase
    {
        private readonly UmagDbContext _context;
        private readonly IWebHostEnvironment _environment;

        public IzvodaciController(UmagDbContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
        }

        // GET: api/vanjski-izvodaci
        [HttpGet]
        public async Task<ActionResult<IEnumerable<IzvodaciDto>>> GetAll()
        {
            var result = await _context.Izvodaci
                .Select(x => new IzvodaciDto
                {
                    Id = x.Id,
                    Broj = x.Broj,
                    Izvodac = x.Izvodac,
                    PocetniDatum = x.PocetniDatum,
                    ZavrsniDatum = x.ZavrsniDatum,
                    MjestoRada = x.MjestoRada,
                    Kontakt = x.Kontakt,
                    OpisRada = x.OpisRada,
                    OdgovornaOsoba = x.OdgovornaOsoba,
                    Zastoj = x.Zastoj,
                    Status = x.Status,
                    TipRadova = x.TipRadova,
                    Privitak = x.Privitak
                })
                .ToListAsync();
            return Ok(result);
        }

        // GET: api/vanjski-izvodaci/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<IzvodaciDto>> GetById(int id)
        {
            var x = await _context.Izvodaci.FindAsync(id);
            if (x == null)
                return NotFound();

            var dto = new IzvodaciDto
            {
                Id = x.Id,
                Broj = x.Broj,
                Izvodac = x.Izvodac,
                PocetniDatum = x.PocetniDatum,
                ZavrsniDatum = x.ZavrsniDatum,
                MjestoRada = x.MjestoRada,
                Kontakt = x.Kontakt,
                OpisRada = x.OpisRada,
                OdgovornaOsoba = x.OdgovornaOsoba,
                Zastoj = x.Zastoj,
                Status = x.Status,
                TipRadova = x.TipRadova,
                Privitak = x.Privitak
            };
            return Ok(dto);
        }

        // POST: api/vanjski-izvodaci
        [HttpPost]
        public async Task<ActionResult<IzvodaciDto>> Create([FromBody] IzvodaciDto dto)
        {
            var entity = new Izvodaci
            {
                Broj = dto.Broj,
                Izvodac = dto.Izvodac,
                PocetniDatum = dto.PocetniDatum,
                ZavrsniDatum = dto.ZavrsniDatum,
                MjestoRada = dto.MjestoRada,
                Kontakt = dto.Kontakt,
                OpisRada = dto.OpisRada,
                OdgovornaOsoba = dto.OdgovornaOsoba,
                Zastoj = dto.Zastoj,
                Status = dto.Status,
                TipRadova = dto.TipRadova,
                Privitak = dto.Privitak
            };
            _context.Izvodaci.Add(entity);
            await _context.SaveChangesAsync();
            dto.Id = entity.Id;
            return CreatedAtAction(nameof(GetById), new { id = entity.Id }, dto);
        }

        // PUT: api/vanjski-izvodaci/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] IzvodaciDto dto)
        {
            if (id != dto.Id)
                return BadRequest("ID mismatch.");

            var entity = await _context.Izvodaci.FindAsync(id);
            if (entity == null)
                return NotFound();

            entity.Broj = dto.Broj;
            entity.Izvodac = dto.Izvodac;
            entity.PocetniDatum = dto.PocetniDatum;
            entity.ZavrsniDatum = dto.ZavrsniDatum;
            entity.MjestoRada = dto.MjestoRada;
            entity.Kontakt = dto.Kontakt;
            entity.OpisRada = dto.OpisRada;
            entity.OdgovornaOsoba = dto.OdgovornaOsoba;
            entity.Zastoj = dto.Zastoj;
            entity.Status = dto.Status;
            entity.TipRadova = dto.TipRadova;
            entity.Privitak = dto.Privitak;

            _context.Entry(entity).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/vanjski-izvodaci/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var entity = await _context.Izvodaci.FindAsync(id);
            if (entity == null)
                return NotFound();

            _context.Izvodaci.Remove(entity);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // POST: api/izvodaci/upload
        [HttpPost("upload")]
        public async Task<IActionResult> Upload(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded");

            try
            {
                // Kreiraj uploads direktorij ako ne postoji
                var uploadsPath = Path.Combine(_environment.ContentRootPath, "uploads");
                if (!Directory.Exists(uploadsPath))
                {
                    Directory.CreateDirectory(uploadsPath);
                }

                // Generiraj jedinstveno ime datoteke
                var fileName = $"{Guid.NewGuid()}_{file.FileName}";
                var filePath = Path.Combine(uploadsPath, fileName);

                // Spremi datoteku
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                return Ok(new { fileName = fileName });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/izvodaci/download/{fileName}
        [HttpGet("download/{fileName}")]
        public IActionResult Download(string fileName)
        {
            try
            {
                var uploadsPath = Path.Combine(_environment.ContentRootPath, "uploads");
                var filePath = Path.Combine(uploadsPath, fileName);

                if (!System.IO.File.Exists(filePath))
                    return NotFound("File not found");

                var fileBytes = System.IO.File.ReadAllBytes(filePath);
                var contentType = GetContentType(fileName);

                return File(fileBytes, contentType, fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        private string GetContentType(string fileName)
        {
            var extension = Path.GetExtension(fileName).ToLowerInvariant();
            return extension switch
            {
                ".pdf" => "application/pdf",
                ".doc" => "application/msword",
                ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                ".xls" => "application/vnd.ms-excel",
                ".xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                ".txt" => "text/plain",
                ".jpg" => "image/jpeg",
                ".jpeg" => "image/jpeg",
                ".png" => "image/png",
                _ => "application/octet-stream"
            };
        }
    }
}
