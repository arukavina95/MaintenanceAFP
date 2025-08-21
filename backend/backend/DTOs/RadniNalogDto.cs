using backend.Enums;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

public class RadniNalogDto
{
    public string BrojRN { get; set; }
    public string Naslov { get; set; }
    public int OdjelPrijaveId { get; set; }
    public int UstanovioId { get; set; }
    public DateTime DatumPrijave { get; set; }
    public int StrojId { get; set; }
    public string? OpisKvara { get; set; }
    public ZaOdjelEnum ZaOdjel { get; set; }
    public string StupanjHitnosti { get; set; }
    public DateTime? OtklonitiDo { get; set; }
    public string VrstaNaloga { get; set; }
    public string Status { get; set; }
    public string? Obrazlozenje { get; set; }
    public string? TehnoloskaOznaka { get; set; }
    public string? NacinRjesavanja { get; set; }
    public string? UtrosenoMaterijala { get; set; }
    public DateTime? DatumZatvaranja { get; set; }
    public string? Napomena { get; set; }
    public int? OdradioId { get; set; }
    public double? SatiRada { get; set; }
    public string? RDIFOPrema { get; set; }
    public DateTime? DatumVrijemePreuzimanja { get; set; }
    public int? DodijeljenoId { get; set; }
    public DateTime? DatumVrijemeDodjele { get; set; }
    public List<int> SudjelovaliIds { get; set; }
    public IFormFile? Privitak { get; set; }
}