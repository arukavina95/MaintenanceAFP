using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class DodajIzvodace : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "VanjskiIzvodaci");

            migrationBuilder.CreateTable(
                name: "Izvodaci",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Broj = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Izvodac = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PocetniDatum = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ZavrsniDatum = table.Column<DateTime>(type: "datetime2", nullable: false),
                    MjestoRada = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Kontakt = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OpisRada = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OdgovornaOsoba = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Zastoj = table.Column<bool>(type: "bit", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TipRadova = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Privitak = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Izvodaci", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Izvodaci");

            migrationBuilder.CreateTable(
                name: "VanjskiIzvodaci",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Broj = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Kontakt = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MjestoRada = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OdgovornaOsoba = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OpisRada = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PocetniDatum = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Privitak = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TipRadova = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    VanjskiIzvodac = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Zastoj = table.Column<bool>(type: "bit", nullable: false),
                    ZavrsniDatum = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VanjskiIzvodaci", x => x.Id);
                });
        }
    }
}
