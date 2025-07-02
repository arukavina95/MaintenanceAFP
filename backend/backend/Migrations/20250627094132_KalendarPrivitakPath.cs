using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class KalendarPrivitakPath : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Privitak",
                table: "Kalendari");

            migrationBuilder.AddColumn<string>(
                name: "PrivitakPath",
                table: "Kalendari",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PrivitakPath",
                table: "Kalendari");

            migrationBuilder.AddColumn<byte[]>(
                name: "Privitak",
                table: "Kalendari",
                type: "varbinary(max)",
                nullable: true);
        }
    }
}
