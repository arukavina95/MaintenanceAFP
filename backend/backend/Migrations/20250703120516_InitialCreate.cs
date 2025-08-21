using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
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
                name: "Obavijesti",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ImeObavijesti = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Opis = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DatumObjave = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Aktivno = table.Column<bool>(type: "bit", nullable: false),
                    Slika = table.Column<byte[]>(type: "varbinary(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Obavijesti", x => x.Id);
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
                    PrivitakPath = table.Column<string>(type: "nvarchar(max)", nullable: true),
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

            migrationBuilder.CreateTable(
                name: "Planiranja",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    VrstaZadataka = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PocetniDatum = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ZavrsniDatum = table.Column<DateTime>(type: "datetime2", nullable: false),
                    StrojId = table.Column<int>(type: "int", nullable: false),
                    Smjena = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PrivitakPath = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Opis = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    KorisnikId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Planiranja", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Planiranja_Korisnici_KorisnikId",
                        column: x => x.KorisnikId,
                        principalTable: "Korisnici",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Planiranja_Strojevi_StrojId",
                        column: x => x.StrojId,
                        principalTable: "Strojevi",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RadniNalozi",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BrojRN = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Naslov = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OdjelPrijaveId = table.Column<int>(type: "int", nullable: false),
                    UstanovioId = table.Column<int>(type: "int", nullable: false),
                    DatumPrijave = table.Column<DateTime>(type: "datetime2", nullable: false),
                    StrojId = table.Column<int>(type: "int", nullable: false),
                    OpisKvara = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ZaOdjel = table.Column<int>(type: "int", nullable: false),
                    StupanjHitnosti = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OtklonitiDo = table.Column<DateTime>(type: "datetime2", nullable: true),
                    VrstaNaloga = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Obrazlozenje = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TehnoloskaOznaka = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NacinRjesavanja = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UtrosenoMaterijala = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DatumZatvaranja = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Napomena = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OdradioId = table.Column<int>(type: "int", nullable: true),
                    SatiRada = table.Column<double>(type: "float", nullable: true),
                    RDIFOPrema = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Potpis = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DatumVrijemePreuzimanja = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DodijeljenoId = table.Column<int>(type: "int", nullable: true),
                    DatumVrijemeDodjele = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PrivitakPath = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RadniNalozi", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RadniNalozi_Korisnici_DodijeljenoId",
                        column: x => x.DodijeljenoId,
                        principalTable: "Korisnici",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_RadniNalozi_Korisnici_OdradioId",
                        column: x => x.OdradioId,
                        principalTable: "Korisnici",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_RadniNalozi_Korisnici_UstanovioId",
                        column: x => x.UstanovioId,
                        principalTable: "Korisnici",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RadniNalozi_OdjelPrijave_OdjelPrijaveId",
                        column: x => x.OdjelPrijaveId,
                        principalTable: "OdjelPrijave",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RadniNalozi_Strojevi_StrojId",
                        column: x => x.StrojId,
                        principalTable: "Strojevi",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RadniNalogSudionik",
                columns: table => new
                {
                    RadniNalogId = table.Column<int>(type: "int", nullable: false),
                    KorisnikId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RadniNalogSudionik", x => new { x.RadniNalogId, x.KorisnikId });
                    table.ForeignKey(
                        name: "FK_RadniNalogSudionik_Korisnici_KorisnikId",
                        column: x => x.KorisnikId,
                        principalTable: "Korisnici",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RadniNalogSudionik_RadniNalozi_RadniNalogId",
                        column: x => x.RadniNalogId,
                        principalTable: "RadniNalozi",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Kalendari_KorisnikId",
                table: "Kalendari",
                column: "KorisnikId");

            migrationBuilder.CreateIndex(
                name: "IX_Planiranja_KorisnikId",
                table: "Planiranja",
                column: "KorisnikId");

            migrationBuilder.CreateIndex(
                name: "IX_Planiranja_StrojId",
                table: "Planiranja",
                column: "StrojId");

            migrationBuilder.CreateIndex(
                name: "IX_RadniNalogSudionik_KorisnikId",
                table: "RadniNalogSudionik",
                column: "KorisnikId");

            migrationBuilder.CreateIndex(
                name: "IX_RadniNalozi_DodijeljenoId",
                table: "RadniNalozi",
                column: "DodijeljenoId");

            migrationBuilder.CreateIndex(
                name: "IX_RadniNalozi_OdjelPrijaveId",
                table: "RadniNalozi",
                column: "OdjelPrijaveId");

            migrationBuilder.CreateIndex(
                name: "IX_RadniNalozi_OdradioId",
                table: "RadniNalozi",
                column: "OdradioId");

            migrationBuilder.CreateIndex(
                name: "IX_RadniNalozi_StrojId",
                table: "RadniNalozi",
                column: "StrojId");

            migrationBuilder.CreateIndex(
                name: "IX_RadniNalozi_UstanovioId",
                table: "RadniNalozi",
                column: "UstanovioId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Kalendari");

            migrationBuilder.DropTable(
                name: "Obavijesti");

            migrationBuilder.DropTable(
                name: "Planiranja");

            migrationBuilder.DropTable(
                name: "RadniNalogSudionik");

            migrationBuilder.DropTable(
                name: "VrstaNaloga");

            migrationBuilder.DropTable(
                name: "ZaOdjel");

            migrationBuilder.DropTable(
                name: "RadniNalozi");

            migrationBuilder.DropTable(
                name: "Korisnici");

            migrationBuilder.DropTable(
                name: "OdjelPrijave");

            migrationBuilder.DropTable(
                name: "Strojevi");
        }
    }
}
