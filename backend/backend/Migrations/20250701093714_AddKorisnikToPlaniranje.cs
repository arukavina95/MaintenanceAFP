using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddKorisnikToPlaniranje : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
             name: "KorisnikId",
             table: "Planiranja",
             type: "int",
             nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Planiranja_KorisnikId",
                table: "Planiranja",
                column: "KorisnikId");

            migrationBuilder.AddForeignKey(
                name: "FK_Planiranja_Korisnici_KorisnikId",
                table: "Planiranja",
                column: "KorisnikId",
                principalTable: "Korisnici",
                principalColumn: "ID",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Planiranja_Korisnici_KorisnikId",
                table: "Planiranja");

            migrationBuilder.DropIndex(
                name: "IX_Planiranja_KorisnikId",
                table: "Planiranja");

            migrationBuilder.DropColumn(
                name: "KorisnikId",
                table: "Planiranja");
        }
    }
}
