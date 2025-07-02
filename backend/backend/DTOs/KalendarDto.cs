using System.ComponentModel.DataAnnotations;

public class KalendarDto
{
    [Required]
    public int KorisnikId { get; set; }
    [Required]
    public DateTime PocetniDatum { get; set; }
    [Required]
    public DateTime ZavrsniDatum { get; set; }
    [Required]
    public RazlogIzostanka RazlogIzostanka { get; set; } // Use enum here
    public IFormFile? Privitak { get; set; }
}