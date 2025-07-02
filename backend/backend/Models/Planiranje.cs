using backend.Models;
using System;
using System.ComponentModel.DataAnnotations;

public class Planiranje
{
    public int Id { get; set; }

    [Required]
    public string VrstaZadataka { get; set; } // "Preventiva", "Tekuće", "Ostalo"

    [Required]
    public DateTime PocetniDatum { get; set; }

    [Required]
    public DateTime ZavrsniDatum { get; set; }

    [Required]
    public int StrojId { get; set; }
    public Strojevi Stroj { get; set; }

  
    [Required]
    public string Smjena { get; set; } // "Prva", "Druga", "Treća"

    public string? PrivitakPath { get; set; }

    // Dodano svojstvo Opis
    public string? Opis { get; set; }

    public string? Status { get; set; }

    public int KorisnikId { get; set; } // FK na korisnika koji je napravio zapis
    public Korisnici Korisnik { get; set; } // Navigacijsko svojstvo
}