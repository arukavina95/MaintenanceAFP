
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Models;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class StrojeviController : ControllerBase
{
    private readonly UmagDbContext _context;

    public StrojeviController(UmagDbContext context)
    {
        _context = context; 
    }   

    // GET: api/Strojevi
    [HttpGet]
    public async Task<ActionResult<IEnumerable<object>>> GetStrojevi()
    {
        var result = await _context.Strojevi
            .Select(s => new { s.Id, s.Naslov })
            .ToListAsync();
        return Ok(result);
    }
}