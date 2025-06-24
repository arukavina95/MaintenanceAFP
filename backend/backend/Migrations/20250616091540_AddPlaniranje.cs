using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddPlaniranje : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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
                    Privitak = table.Column<byte[]>(type: "varbinary(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Planiranja", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Planiranja_Strojevi_StrojId",
                        column: x => x.StrojId,
                        principalTable: "Strojevi",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Planiranja_StrojId",
                table: "Planiranja",
                column: "StrojId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Planiranja");
        }
    }
}
