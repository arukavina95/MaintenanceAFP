using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class Strojevi
{
    public int Id { get; set; }

    public string Naslov { get; set; } = null!;

    public string? Odjel { get; set; }

    public byte[]? Privitak { get; set; }

    public string? Proizvodac { get; set; }

    public int? GodinaProizvodnje { get; set; }

    public DateOnly? UpogonuOd { get; set; }

    public bool Aktivan { get; set; }
}
