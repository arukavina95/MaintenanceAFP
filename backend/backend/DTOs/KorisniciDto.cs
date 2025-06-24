namespace backend.DTOs
{
    public class KorisniciDto
    {
        public int Id { get; set; }
        public string Korisnik { get; set; } // Ekvivalent Username-u
        public string Ime { get; set; }
        public int? RazinaPristupa { get; set; }
    }
}
