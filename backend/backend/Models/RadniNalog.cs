using backend.Enums;
using backend.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

public class RadniNalog
{
    public int Id { get; set; }

    [Required]
    public string BrojRN { get; set; }

    [Required]
    public string Naslov { get; set; }

    [Required]
    public int OdjelPrijaveId { get; set; }
    public OdjelPrijave OdjelPrijave { get; set; }

    [Required]
    public int UstanovioId { get; set; }
    public Korisnici Ustanovio { get; set; }

    [Required]
    public DateTime DatumPrijave { get; set; }

    [Required]
    public int StrojId { get; set; }
    public Strojevi Stroj { get; set; }

    public string? OpisKvara { get; set; }

    [Required]
    public ZaOdjelEnum ZaOdjel { get; set; }

    [Required]
    public string StupanjHitnosti { get; set; }

    public DateTime? OtklonitiDo { get; set; }

    [Required]
    public string VrstaNaloga { get; set; }

    [Required]
    public string Status { get; set; }

    public string? Obrazlozenje { get; set; }
    public string? TehnoloskaOznaka { get; set; }
    public string? NacinRjesavanja { get; set; }
    public string? UtrosenoMaterijala { get; set; }
    public DateTime? DatumZatvaranja { get; set; }
    public string? Napomena { get; set; }

    public int? OdradioId { get; set; }
    public Korisnici Odradio { get; set; }

    public double? SatiRada { get; set; }
    public string? RDIFOPrema { get; set; }

    public string? Potpis { get; set; }

    public DateTime? DatumVrijemePreuzimanja { get; set; }

    public int? DodijeljenoId { get; set; }
    public Korisnici Dodijeljeno { get; set; }

    public DateTime? DatumVrijemeDodjele { get; set; }

    public ICollection<RadniNalogSudionik> Sudjelovali { get; set; }

    public string? PrivitakPath { get; set; }
}