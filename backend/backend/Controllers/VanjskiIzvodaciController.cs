using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VanjskiIzvodaciController : ControllerBase
    {
        private readonly UmagDbContext _context;
        private readonly IWebHostEnvironment _webHostEnvironment;

        public VanjskiIzvodaciController(UmagDbContext context, IWebHostEnvironment webHostEnvironment)
        {
            _context = context;
            _webHostEnvironment = webHostEnvironment;
        }

        // GET: api/vanjski-izvodaci/lista - za dropdown
        [HttpGet("lista")]
        public async Task<ActionResult<IEnumerable<string>>> GetLista()
        {
            var lista = await _context.VanjskiIzvodaci
                .Where(x => x.Aktivan)
                .Select(x => x.ImeFirme)
                .Distinct()
                .OrderBy(x => x)
                .ToListAsync();

            return Ok(lista);
        }

        // GET: api/vanjski-izvodaci
        [HttpGet]
        public async Task<ActionResult<IEnumerable<VanjskiIzvodaciDto>>> GetAll()
        {
            var result = await _context.VanjskiIzvodaci
                .Where(x => x.Aktivan)
                .Select(x => new VanjskiIzvodaciDto
                {
                    Id = x.Id,
                    ImeFirme = x.ImeFirme,
                    KontaktOsoba = x.KontaktOsoba,
                    KontaktTelefon = x.KontaktTelefon,
                    KontaktEmail = x.KontaktEmail,
                    OpisPoslova = x.OpisPoslova,
                    OpremaServisiraju = x.OpremaServisiraju,
                    Dokumenti = x.Dokumenti,
                    DatumKreiranja = x.DatumKreiranja,
                    Aktivan = x.Aktivan
                })
                .OrderBy(x => x.ImeFirme)
                .ToListAsync();

            return Ok(result);
        }

        // GET: api/vanjski-izvodaci/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<VanjskiIzvodaciDto>> GetById(int id)
        {
            var entity = await _context.VanjskiIzvodaci.FindAsync(id);

            if (entity == null || !entity.Aktivan)
                return NotFound();

            var dto = new VanjskiIzvodaciDto
            {
                Id = entity.Id,
                ImeFirme = entity.ImeFirme,
                KontaktOsoba = entity.KontaktOsoba,
                KontaktTelefon = entity.KontaktTelefon,
                KontaktEmail = entity.KontaktEmail,
                OpisPoslova = entity.OpisPoslova,
                OpremaServisiraju = entity.OpremaServisiraju,
                Dokumenti = entity.Dokumenti,
                DatumKreiranja = entity.DatumKreiranja,
                Aktivan = entity.Aktivan
            };

            return Ok(dto);
        }

        // POST: api/vanjski-izvodaci
        [HttpPost]
        public async Task<ActionResult<VanjskiIzvodaciDto>> Create([FromBody] VanjskiIzvodaciDto dto)
        {
            var entity = new VanjskiIzvodaci
            {
                ImeFirme = dto.ImeFirme,
                KontaktOsoba = dto.KontaktOsoba,
                KontaktTelefon = dto.KontaktTelefon,
                KontaktEmail = dto.KontaktEmail,
                OpisPoslova = dto.OpisPoslova,
                OpremaServisiraju = dto.OpremaServisiraju,
                Dokumenti = dto.Dokumenti,
                DatumKreiranja = DateTime.Now,
                Aktivan = true
            };

            _context.VanjskiIzvodaci.Add(entity);
            await _context.SaveChangesAsync();

            dto.Id = entity.Id;
            dto.DatumKreiranja = entity.DatumKreiranja;

            return CreatedAtAction(nameof(GetById), new { id = entity.Id }, dto);
        }

        // PUT: api/vanjski-izvodaci/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] VanjskiIzvodaciDto dto)
        {
            if (id != dto.Id)
                return BadRequest("ID mismatch.");

            var entity = await _context.VanjskiIzvodaci.FindAsync(id);
            if (entity == null || !entity.Aktivan)
                return NotFound();

            entity.ImeFirme = dto.ImeFirme;
            entity.KontaktOsoba = dto.KontaktOsoba;
            entity.KontaktTelefon = dto.KontaktTelefon;
            entity.KontaktEmail = dto.KontaktEmail;
            entity.OpisPoslova = dto.OpisPoslova;
            entity.OpremaServisiraju = dto.OpremaServisiraju;
            entity.Dokumenti = dto.Dokumenti;

            _context.Entry(entity).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/vanjski-izvodaci/{id} (soft delete)
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var entity = await _context.VanjskiIzvodaci.FindAsync(id);
            if (entity == null)
                return NotFound();

            // Soft delete
            entity.Aktivan = false;
            _context.Entry(entity).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/vanjski-izvodaci/upload
        [HttpPost("upload")]
        public async Task<ActionResult<object>> UploadDocument(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");

            try
            {
                // Create uploads directory if it doesn't exist
                var uploadsPath = Path.Combine(_webHostEnvironment.WebRootPath, "uploads", "vanjski-izvodaci");
                if (!Directory.Exists(uploadsPath))
                {
                    Directory.CreateDirectory(uploadsPath);
                }

                // Generate unique filename
                var fileName = $"{Guid.NewGuid()}_{file.FileName}";
                var filePath = Path.Combine(uploadsPath, fileName);

                // Save file
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

        // GET: api/vanjski-izvodaci/download/{fileName}
        [HttpGet("download/{fileName}")]
        public async Task<IActionResult> DownloadDocument(string fileName)
        {
            try
            {
                var uploadsPath = Path.Combine(_webHostEnvironment.WebRootPath, "uploads", "vanjski-izvodaci");
                var filePath = Path.Combine(uploadsPath, fileName);

                if (!System.IO.File.Exists(filePath))
                    return NotFound("File not found.");

                var fileBytes = await System.IO.File.ReadAllBytesAsync(filePath);
                var originalFileName = fileName.Contains('_')
                  ? fileName.Substring(fileName.IndexOf('_') + 1)
                  : fileName;

                return File(fileBytes, "application/octet-stream", originalFileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
