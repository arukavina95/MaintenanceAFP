namespace backend.Models
{
    public class RadniNalogSudionik
    {
        public int RadniNalogId { get; set; }
        public RadniNalog RadniNalog { get; set; }

        public int KorisnikId { get; set; }
        public Korisnici Korisnik { get; set; }
    }

}
