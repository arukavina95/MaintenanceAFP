using backend.Models;

public class Kalendar
{
    public int Id { get; set; }
    public int KorisnikId { get; set; }
    public DateTime PocetniDatum { get; set; }
    public DateTime ZavrsniDatum { get; set; }
    public RazlogIzostanka RazlogIzostanka { get; set; } // Use enum here
    public string? PrivitakPath { get; set; } // <-- putanja do fajla
    public string? PrivitakNaziv { get; set; }
    public Korisnici? Korisnik { get; set; }
}