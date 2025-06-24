using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class Registracija
    {
        [Required]
        public string Username { get; set; }
        [Required]
        public string Ime { get; set; }
        [Required]
        public string Password { get; set; }
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
