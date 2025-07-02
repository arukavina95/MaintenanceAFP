using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class CreateKalendarTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Kalendari",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    KorisnikId = table.Column<int>(type: "int", nullable: false),
                    PocetniDatum = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ZavrsniDatum = table.Column<DateTime>(type: "datetime2", nullable: false),
                    RazlogIzostanka = table.Column<int>(type: "int", nullable: false),
                    Privitak = table.Column<byte[]>(type: "varbinary(max)", nullable: true),
                    PrivitakNaziv = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Kalendari", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Kalendari_Korisnici_KorisnikId",
                        column: x => x.KorisnikId,
                        principalTable: "Korisnici",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Kalendari_KorisnikId",
                table: "Kalendari",
                column: "KorisnikId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Kalendari");
        }
    }
}
