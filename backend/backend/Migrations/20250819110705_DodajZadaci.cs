using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class DodajZadaci : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {

            migrationBuilder.CreateTable(
                name: "Zadaci",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Broj = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Datum = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Smjena = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Djelatnik = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Odjel = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ProstorRada = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Stroj = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OpisRada = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ElePoz = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SatiRada = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    UgradeniDijelovi = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Zadaci", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Zadaci");

            migrationBuilder.CreateTable(
                name: "VrstaNaloga",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Aktivan = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    Naslov = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__VrstaNal__3214EC2794902D78", x => x.ID);
                });
        }
    }
}
