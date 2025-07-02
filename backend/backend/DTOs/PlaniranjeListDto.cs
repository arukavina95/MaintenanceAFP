namespace backend.DTOs
{
    public class PlaniranjeListDto
    {
        public int Id { get; set; }
        public string VrstaZadataka { get; set; }
        public DateTime PocetniDatum { get; set; }
        public DateTime ZavrsniDatum { get; set; }
        public int StrojId { get; set; }
        public string StrojNaslov { get; set; } // Ovdje ga trebaš jer je ovo OUTPUT DTO
        public string Smjena { get; set; }
        public string? Opis { get; set; }
        public string? Status { get; set; }

        public int KorisnikId { get; set; }
        public string? KorisnikIme { get; set; } // ako želiš prikazati ime korisnika
        // Ne uključuj Privitak ovdje
    }
}
