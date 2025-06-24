using backend.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using backend.Services; // Dodano, jer se AuthService registrira

var cultureInfo = new System.Globalization.CultureInfo("en-US");
System.Globalization.CultureInfo.DefaultThreadCurrentCulture = cultureInfo;
System.Globalization.CultureInfo.DefaultThreadCurrentUICulture = cultureInfo;

var options = new WebApplicationOptions
{
    Args = args,
    WebRootPath = "wwwroot"
};


var builder = WebApplication.CreateBuilder(options);
builder.Configuration.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true);
// Add services to the container.
builder.Services.AddControllers();

// Registracija servisa za pristup bazi podataka
builder.Services.AddDbContext<UmagDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Registracija Endpoint API Explorera za Swagger
builder.Services.AddEndpointsApiExplorer();

// Registriraj vaš AuthService
builder.Services.AddScoped<IAuthService, AuthService>();


// Konfiguracija Swagger/OpenAPI - SADA AKTIVIRANO!
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Maintenance API", Version = "v1" });

    // Dodaj definiciju sigurnosti za JWT Bearer token - AKTIVIRANO!
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "AppSettings",
        In = ParameterLocation.Header,
        Description = "Unesite **SAMO** JWT token dobiven pri prijavi. **NE** unosite 'Bearer ' ponovno! " +
                      "Primjer: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`"
    });

    // Dodaj sigurnosni zahtjev za Bearer token - AKTIVIRANO!
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

// Konfiguriraj JWT authentication - SADA AKTIVIRANO!
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
  .AddJwtBearer(options =>
  {
      options.TokenValidationParameters = new TokenValidationParameters
      {
          ValidateIssuer = true,
          ValidIssuer = builder.Configuration["AppSettings:Issuer"],
          ValidateAudience = true,
          ValidAudience = builder.Configuration["AppSettings:Audience"],
          ValidateLifetime = true,
          ValidateIssuerSigningKey = true,
          IssuerSigningKey = new SymmetricSecurityKey(
    Encoding.UTF8.GetBytes(builder.Configuration["AppSettings:Token"])
)
      };

      // DODAJ OVO ZA DEBUG
      options.Events = new JwtBearerEvents
      {
          OnAuthenticationFailed = context =>
          {
              Console.WriteLine($"[Auth Failed] {context.Exception.Message}");
              return Task.CompletedTask;
          },
          OnTokenValidated = context =>
          {
              Console.WriteLine($"[Token Validated] {context.SecurityToken}");
              return Task.CompletedTask;
          },
          OnChallenge = context =>
          {
              Console.WriteLine($"[Auth Challenge] Error: {context.Error}, Description: {context.ErrorDescription}");
              return Task.CompletedTask;
          }
      };
  });

 


// Konfiguriraj CORS-a
builder.Services.AddCors(corsOptions =>
{
    corsOptions.AddPolicy("AllowAllOrigins",
        policy =>
        {
            policy.AllowAnyOrigin()
                    .AllowAnyMethod()
                    .AllowAnyHeader();
        });
});
builder.Services.AddDirectoryBrowser();


var app = builder.Build();

app.UseStaticFiles();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Koristi CORS policy PRIJE UseAuthentication() i UseAuthorization()
app.UseCors("AllowAllOrigins");

app.UseAuthentication(); // SADA AKTIVIRANO!
app.UseAuthorization(); // SADA AKTIVIRANO!

app.MapControllers();

app.Run();