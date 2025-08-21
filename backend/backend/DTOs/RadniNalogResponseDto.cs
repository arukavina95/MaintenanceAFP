using backend.Enums;
using System.Text.Json.Serialization;

namespace backend.DTOs
{
    public class RadniNalogResponseDto
    {
        public int Id { get; set; }
        public string BrojRN { get; set; }
        public string Naslov { get; set; }
        public DateTime DatumPrijave { get; set; }
        public string Status { get; set; }
        public string? OpisKvara { get; set; }
        public ZaOdjelEnum ZaOdjel { get; set; }
        public string? StupanjHitnosti { get; set; }
        public DateTime? OtklonitiDo { get; set; }
        public string? VrstaNaloga { get; set; }
        public string? Obrazlozenje { get; set; }
        public string? TehnoloskaOznaka { get; set; }
        public string? NacinRjesavanja { get; set; }
        public string? UtrosenoMaterijala { get; set; }
        public string? Napomena { get; set; }
        public DateTime? DatumZatvaranja { get; set; }
        public string? OdjelPrijave { get; set; }
        public string? Ustanovio { get; set; }
        public string? Stroj { get; set; }
        public string? Odradio { get; set; }
        public List<KorisniciDto> Sudionici { get; set; }


        [JsonPropertyName("dodijeljenoId")]
        public int? DodijeljenoId { get; set; }

        [JsonPropertyName("datumVrijemeDodjele")]
        public string? DatumVrijemeDodjele { get; set; }
    }
}
