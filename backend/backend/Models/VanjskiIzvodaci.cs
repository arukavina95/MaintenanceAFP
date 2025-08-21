namespace backend.Models
{
    public class VanjskiIzvodaci
    {
        public int Id { get; set; }
        public string ImeFirme { get; set; } = string.Empty;
        public string KontaktOsoba { get; set; } = string.Empty;
        public string KontaktTelefon { get; set; } = string.Empty;
        public string KontaktEmail { get; set; } = string.Empty;
        public string OpisPoslova { get; set; } = string.Empty;
        public string OpremaServisiraju { get; set; } = string.Empty;
        public string Dokumenti { get; set; } = string.Empty;
        public DateTime DatumKreiranja { get; set; } = DateTime.Now;
        public bool Aktivan { get; set; } = true;
    }
}
