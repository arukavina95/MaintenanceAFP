using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class VrstaNaloga
{
    public int Id { get; set; }

    public string Naslov { get; set; } = null!;

    public bool Aktivan { get; set; }
}
