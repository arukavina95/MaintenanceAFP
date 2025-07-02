using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class PromjenaLozinkeDto
    {

        [Required]
        public string NovaLozinka { get; set; }
    }
}
