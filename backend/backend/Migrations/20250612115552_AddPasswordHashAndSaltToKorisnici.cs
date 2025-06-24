using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddPasswordHashAndSaltToKorisnici : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Korisnici",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Korisnik = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    LozinkaHash = table.Column<byte[]>(type: "varbinary(255)", maxLength: 255, nullable: false),
                    LozinkaSalt = table.Column<byte[]>(type: "varbinary(255)", maxLength: 255, nullable: false),
                    Ime = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    BrojKartice = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Potpis = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Odjel = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Aktivan = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    RazinaPristupa = table.Column<int>(type: "int", nullable: true),
                    DatumRodenja = table.Column<DateOnly>(type: "date", nullable: true),
                    ZaposlenOd = table.Column<DateOnly>(type: "date", nullable: true),
                    UkupnoDanaGo = table.Column<int>(type: "int", nullable: true),
                    UkupnoDanaStarogGo = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Korisnic__3214EC2782069455", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "OdjelPrijave",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Naslov = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Aktivan = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__OdjelPri__3214EC272213897F", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "PrijavaKvarova",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BrojRN = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Naslov = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    OdjelPrijave = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Ustanovio = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    DatumPrijave = table.Column<DateOnly>(type: "date", nullable: false),
                    Stroj = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    OpisKvara = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ZaOdjel = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    StupanjHitnosti = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    OtklonitiDo = table.Column<DateOnly>(type: "date", nullable: true),
                    VrstaNaloga = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    ObrazlozenjePP = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BrojTehnoloskaOznaka = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    NacinRjesavanja = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UtroseniMaterijal = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DatumZatvaranja = table.Column<DateOnly>(type: "date", nullable: true),
                    Napomena = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OdradioSatiRada = table.Column<int>(type: "int", nullable: true),
                    RFIDOpreme = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Potpis = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    DatumVrijemePreuzimanja = table.Column<DateTime>(type: "datetime", nullable: true),
                    DodijeljenoDjelatniku = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    DatumVrijemeDodjele = table.Column<DateTime>(type: "datetime", nullable: true),
                    Sudjelovali = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__PrijavaK__3214EC273537315B", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "Strojevi",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Naslov = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Odjel = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Privitak = table.Column<byte[]>(type: "varbinary(max)", nullable: true),
                    Proizvodac = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    GodinaProizvodnje = table.Column<int>(type: "int", nullable: true),
                    UPogonuOd = table.Column<DateOnly>(type: "date", nullable: true),
                    Aktivan = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Strojevi__3214EC27E3AC053A", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "VrstaNaloga",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Naslov = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Aktivan = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__VrstaNal__3214EC2794902D78", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "ZaOdjel",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Naslov = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Aktivan = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__ZaOdjel__3214EC2712040936", x => x.ID);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Korisnici");

            migrationBuilder.DropTable(
                name: "OdjelPrijave");

            migrationBuilder.DropTable(
                name: "PrijavaKvarova");

            migrationBuilder.DropTable(
                name: "Strojevi");

            migrationBuilder.DropTable(
                name: "VrstaNaloga");

            migrationBuilder.DropTable(
                name: "ZaOdjel");
        }
    }
}
