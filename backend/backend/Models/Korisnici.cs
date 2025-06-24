namespace backend.Models
{
    public class Korisnici
    {
        public int Id { get; set; }
        public string Korisnik { get; set; }
        // Uklonite originalno polje Lozinka (string)
        // public string Lozinka { get; set; } // OVO SE UKLANJA ILI KOMENTIRA

        public byte[] LozinkaHash { get; set; } // NOVO POLJE
        public byte[] LozinkaSalt { get; set; } // NOVO POLJE

        public string? Ime { get; set; }
        public string? BrojKartice { get; set; }
        public string? Potpis { get; set; }
        public string? Odjel { get; set; }
        public bool Aktivan { get; set; }
        public int? RazinaPristupa { get; set; }
        public DateOnly? DatumRodenja { get; set; }
        public DateOnly? ZaposlenOd { get; set; }
        public int? UkupnoDanaGo { get; set; }
        public int? UkupnoDanaStarogGo { get; set; }
    }
}