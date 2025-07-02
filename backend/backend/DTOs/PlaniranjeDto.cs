using Microsoft.AspNetCore.Http;
using System;
using System.ComponentModel.DataAnnotations;

public class PlaniranjeDto
{
    [Required]
    public string VrstaZadataka { get; set; }
    [Required]
    public DateTime PocetniDatum { get; set; }
    [Required]
    public DateTime ZavrsniDatum { get; set; }
    [Required]
    public int StrojId { get; set; }
    // OBRISATI: public string StrojNaslov { get; set; } // <-- OVO OBRIŠI
    [Required]
    public string Smjena { get; set; }
    public IFormFile? Privitak { get; set; }
    public string? Opis { get; set; }
    public string? Status { get; set; }

    [Required]
    public int KorisnikId { get; set; }
}