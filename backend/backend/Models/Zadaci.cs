using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class Zadaci
    {
        [Key]
        public int Id { get; set; }
        public string Broj { get; set; }
        public DateTime Datum { get; set; }
        public string Smjena { get; set; }
        public string Djelatnik { get; set; }
        public string Odjel { get; set; }
        public string ProstorRada { get; set; }
        public string Stroj { get; set; }
        public string OpisRada { get; set; }
        public string ElePoz { get; set; }
        public decimal SatiRada { get; set; }
        public string UgradeniDijelovi { get; set; }
        public string? Napomena { get; set; } // Dodano
    }
}
