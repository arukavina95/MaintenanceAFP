using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class UpdatePlaniranjePrivitakPath : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Privitak",
                table: "Planiranja");

            migrationBuilder.AddColumn<string>(
                name: "PrivitakPath",
                table: "Planiranja",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PrivitakPath",
                table: "Planiranja");

            migrationBuilder.AddColumn<byte[]>(
                name: "Privitak",
                table: "Planiranja",
                type: "varbinary(max)",
                nullable: true);
        }
    }
}
