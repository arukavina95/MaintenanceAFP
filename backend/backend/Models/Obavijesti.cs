using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class Obavijesti
    {
        public int Id { get; set; }

        [Required]
        public string ImeObavijesti { get; set; }  // Naziv obavijesti

        public string Opis { get; set; }  // Opis obavijesti
        [Required]
        public DateTime DatumObjave { get; set; }  // Datum obavijesti

        public bool Aktivno { get; set; } = true;  // Status obavijesti (aktivno/neaktivno)

        public byte[]? Slika { get; set;}
    }
}
