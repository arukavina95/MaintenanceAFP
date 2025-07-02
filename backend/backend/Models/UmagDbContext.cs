using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace backend.Models;

public partial class UmagDbContext : DbContext
{
    public UmagDbContext()
    {
    }

    public UmagDbContext(DbContextOptions<UmagDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Korisnici> Korisnici { get; set; }

    public virtual DbSet<OdjelPrijave> OdjelPrijave { get; set; }

    public virtual DbSet<PrijavaKvarova> PrijavaKvarova { get; set; }

    public virtual DbSet<Strojevi> Strojevi { get; set; }

    public virtual DbSet<VrstaNaloga> VrstaNaloga { get; set; }

    public virtual DbSet<ZaOdjel> ZaOdjel { get; set; }

    public virtual DbSet<Obavijesti> Obavijesti { get; set; } 

    public virtual DbSet<Planiranje> Planiranja { get; set; }

    public virtual DbSet<Kalendar> Kalendari { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)   
        => optionsBuilder.UseSqlServer("Server=Rukavina\\SQLEXPRESS;Database=UMAG_db;User Id=antun;Password=antun;TrustServerCertificate=True");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Korisnici>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Korisnic__3214EC2782069455");

            entity.ToTable("Korisnici");

            entity.Property(e => e.Id).HasColumnName("ID");
            entity.Property(e => e.Aktivan).HasDefaultValue(true);
            entity.Property(e => e.BrojKartice).HasMaxLength(50);
            entity.Property(e => e.Ime).HasMaxLength(255);
            entity.Property(e => e.Korisnik).HasMaxLength(255);
            modelBuilder.Entity<Korisnici>(entity =>
            {
                entity.HasKey(e => e.Id).HasName("PK__Korisnic__3214EC2782069455");

                entity.ToTable("Korisnici");

                entity.Property(e => e.Id).HasColumnName("ID");
                entity.Property(e => e.Aktivan).HasDefaultValue(true);
                entity.Property(e => e.BrojKartice).HasMaxLength(50);
                entity.Property(e => e.Ime).HasMaxLength(255);
                entity.Property(e => e.Korisnik).HasMaxLength(255);
                entity.Property(e => e.LozinkaHash).HasMaxLength(255); // Fix: Replace 'Lozinka' with 'LozinkaHash'  
                entity.Property(e => e.LozinkaSalt).HasMaxLength(255); // Fix: Add 'LozinkaSalt' mapping  
                entity.Property(e => e.Odjel).HasMaxLength(255);
                entity.Property(e => e.Potpis).HasMaxLength(255);
            });
            entity.Property(e => e.Odjel).HasMaxLength(255);
            entity.Property(e => e.Potpis).HasMaxLength(255);
        });

        modelBuilder.Entity<OdjelPrijave>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__OdjelPri__3214EC272213897F");

            entity.ToTable("OdjelPrijave");

            entity.Property(e => e.Id).HasColumnName("ID");
            entity.Property(e => e.Aktivan).HasDefaultValue(true);
            entity.Property(e => e.Naslov).HasMaxLength(255);
        });

        modelBuilder.Entity<PrijavaKvarova>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__PrijavaK__3214EC273537315B");

            entity.ToTable("PrijavaKvarova");

            entity.Property(e => e.Id).HasColumnName("ID");
            entity.Property(e => e.BrojRn)
                .HasMaxLength(50)
                .HasColumnName("BrojRN");
            entity.Property(e => e.BrojTehnoloskaOznaka).HasMaxLength(255);
            entity.Property(e => e.DatumVrijemeDodjele).HasColumnType("datetime");
            entity.Property(e => e.DatumVrijemePreuzimanja).HasColumnType("datetime");
            entity.Property(e => e.DodijeljenoDjelatniku).HasMaxLength(255);
            entity.Property(e => e.Naslov).HasMaxLength(255);
            entity.Property(e => e.ObrazlozenjePp).HasColumnName("ObrazlozenjePP");
            entity.Property(e => e.OdjelPrijave).HasMaxLength(255);
            entity.Property(e => e.Potpis).HasMaxLength(255);
            entity.Property(e => e.Rfidopreme)
                .HasMaxLength(255)
                .HasColumnName("RFIDOpreme");
            entity.Property(e => e.Status).HasMaxLength(50);
            entity.Property(e => e.Stroj).HasMaxLength(255);
            entity.Property(e => e.StupanjHitnosti).HasMaxLength(50);
            entity.Property(e => e.Ustanovio).HasMaxLength(255);
            entity.Property(e => e.VrstaNaloga).HasMaxLength(100);
            entity.Property(e => e.ZaOdjel).HasMaxLength(255);
        });

        modelBuilder.Entity<Strojevi>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Strojevi__3214EC27E3AC053A");

            entity.ToTable("Strojevi");

            entity.Property(e => e.Id).HasColumnName("ID");
            entity.Property(e => e.Aktivan).HasDefaultValue(true);
            entity.Property(e => e.Naslov).HasMaxLength(255);
            entity.Property(e => e.Odjel).HasMaxLength(255);
            entity.Property(e => e.Proizvodac).HasMaxLength(255);
            entity.Property(e => e.UpogonuOd).HasColumnName("UPogonuOd");
        });

        modelBuilder.Entity<VrstaNaloga>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__VrstaNal__3214EC2794902D78");

            entity.ToTable("VrstaNaloga");

            entity.Property(e => e.Id).HasColumnName("ID");
            entity.Property(e => e.Aktivan).HasDefaultValue(true);
            entity.Property(e => e.Naslov).HasMaxLength(255);
        });

        modelBuilder.Entity<ZaOdjel>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__ZaOdjel__3214EC2712040936");

            entity.ToTable("ZaOdjel");

            entity.Property(e => e.Id).HasColumnName("ID");
            entity.Property(e => e.Aktivan).HasDefaultValue(true);
            entity.Property(e => e.Naslov).HasMaxLength(255);
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
