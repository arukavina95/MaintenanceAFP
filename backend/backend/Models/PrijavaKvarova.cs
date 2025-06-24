using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class PrijavaKvarova
{
    public int Id { get; set; }

    public string? BrojRn { get; set; }

    public string? Naslov { get; set; }

    public string? OdjelPrijave { get; set; }

    public string? Ustanovio { get; set; }

    public DateOnly DatumPrijave { get; set; }

    public string? Stroj { get; set; }

    public string? OpisKvara { get; set; }

    public string? ZaOdjel { get; set; }

    public string? StupanjHitnosti { get; set; }

    public DateOnly? OtklonitiDo { get; set; }

    public string? VrstaNaloga { get; set; }

    public string? Status { get; set; }

    public string? ObrazlozenjePp { get; set; }

    public string? BrojTehnoloskaOznaka { get; set; }

    public string? NacinRjesavanja { get; set; }

    public string? UtroseniMaterijal { get; set; }

    public DateOnly? DatumZatvaranja { get; set; }

    public string? Napomena { get; set; }

    public int? OdradioSatiRada { get; set; }

    public string? Rfidopreme { get; set; }

    public string? Potpis { get; set; }

    public DateTime? DatumVrijemePreuzimanja { get; set; }

    public string? DodijeljenoDjelatniku { get; set; }

    public DateTime? DatumVrijemeDodjele { get; set; }

    public string? Sudjelovali { get; set; }
}
