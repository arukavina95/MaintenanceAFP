using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class ObavijestiDto
    {
        // Ne treba Id jer je za kreiranje/ažuriranje, ID se šalje kroz URL ili je 0
        [Required]
        public string ImeObavijesti { get; set; }
        public string Opis { get; set; }
        [Required]
        public DateTime DatumObjave { get; set; }
        public bool Aktivno { get; set; } = true;
        public IFormFile? Slika { get; set; } // IFormFile za primanje datoteke
    }
}
