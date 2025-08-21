namespace backend.DTOs
{

    public class IzvodaciDto
    {
        public int Id { get; set; }
        public string Broj { get; set; }
        public string Izvodac { get; set; }
        public DateTime PocetniDatum { get; set; }
        public DateTime ZavrsniDatum { get; set; }
        public string MjestoRada { get; set; }
        public string Kontakt { get; set; }
        public string OpisRada { get; set; }
        public string OdgovornaOsoba { get; set; }
        public bool Zastoj { get; set; }
        public string Status { get; set; }
        public string TipRadova { get; set; }
        public string? Privitak { get; set; }
    }
}
