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

    [Required]
    public string Smjena { get; set; }

    public IFormFile? Privitak { get; set; }

    // Dodano svojstvo Opis
    public string? Opis { get; set; }

    public string? Status { get; set; }
}