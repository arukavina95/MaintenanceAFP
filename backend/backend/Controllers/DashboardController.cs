using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.DTOs;
using backend.Models;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly UmagDbContext _context;

        public DashboardController(UmagDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<DashboardData>> GetDashboardData()
        {
            try
            {
                var stats = await GetStatsInternal();
                var activities = await GetRecentActivitiesInternal();
                var statusProgress = await GetStatusProgressInternal();

                return Ok(new DashboardData
                {
                    stats = stats,
                    activities = activities,
                    statusProgress = statusProgress
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("stats")]
        public async Task<ActionResult<DashboardStats>> GetStats()
        {
            try
            {
                var stats = await GetStatsInternal();
                return Ok(stats);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("activities")]
        public async Task<ActionResult<List<DashboardActivity>>> GetRecentActivities()
        {
            try
            {
                var activities = await GetRecentActivitiesInternal();
                return Ok(activities);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("status-progress")]
        public async Task<ActionResult<StatusProgress>> GetStatusProgress()
        {
            try
            {
                var statusProgress = await GetStatusProgressInternal();
                return Ok(statusProgress);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // Private helper methods
        private async Task<int> GetActiveWorkOrdersCount()
        {
            return await _context.RadniNalozi
                .Where(rn => rn.Status == "Otvoren" || rn.Status == "U tijeku")
                .CountAsync();
        }

        private async Task<int> GetCompletedThisMonthCount()
        {
            var startOfMonth = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1);
            var endOfMonth = startOfMonth.AddMonths(1).AddDays(-1);

            return await _context.RadniNalozi
                .Where(rn => rn.Status == "Zatvoren" &&
                             rn.DatumZatvaranja >= startOfMonth &&
                             rn.DatumZatvaranja <= endOfMonth)
                .CountAsync();
        }

        private async Task<int> GetCriticalWorkOrdersCount()
        {
            return await _context.RadniNalozi
                .Where(rn => rn.StupanjHitnosti == "Visok" &&
                             (rn.Status == "Otvoren" || rn.Status == "U tijeku"))
                .CountAsync();
        }

        private async Task<int> GetActiveTechniciansCount()
        {
            return await _context.Korisnici
                .Where(k => k.Aktivan && k.Odjel == "Održavanje")
                .CountAsync();
        }

        private async Task<DashboardStats> GetStatsInternal()
        {
            return new DashboardStats
            {
                aktivniRadniNalozi = await GetActiveWorkOrdersCount(),
                zavrseniOvajMjesec = await GetCompletedThisMonthCount(),
                kriticniNalozi = await GetCriticalWorkOrdersCount(),
                aktivniTehnicari = await GetActiveTechniciansCount()
            };
        }

        private async Task<List<DashboardActivity>> GetRecentActivitiesInternal()
        {
            var activities = new List<DashboardActivity>();

            // Dohvati zadnjih 10 radnih naloga
            var recentWorkOrders = await _context.RadniNalozi
                .OrderByDescending(rn => rn.DatumPrijave)
                .Take(10)
                .Include(rn => rn.Ustanovio)
                .ToListAsync();

            foreach (var workOrder in recentWorkOrders)
            {
                var timeAgo = GetTimeAgo(workOrder.DatumPrijave);
                var userName = workOrder.Ustanovio?.Ime ?? "Nepoznato";

                activities.Add(new DashboardActivity
                {
                    Id = workOrder.Id,
                    Action = $"Radni nalog #{workOrder.BrojRN} {GetActionType(workOrder.Status)}",
                    User = userName,
                    Time = timeAgo,
                    Type = GetActivityType(workOrder.Status, workOrder.StupanjHitnosti)
                });
            }

            return activities;
        }

        private async Task<StatusProgress> GetStatusProgressInternal()
        {
            var totalWorkOrders = await _context.RadniNalozi.CountAsync();

            if (totalWorkOrders == 0)
            {
                return new StatusProgress();
            }

            var otvoreni = await _context.RadniNalozi
                .Where(rn => rn.Status == "Otvoren")
                .CountAsync();

            var uTijeku = await _context.RadniNalozi
                .Where(rn => rn.Status == "U tijeku")
                .CountAsync();

            var zavrseni = await _context.RadniNalozi
                .Where(rn => rn.Status == "Zatvoren")
                .CountAsync();

            return new StatusProgress
            {
                otvoreni = new StatusItem
                {
                    count = otvoreni,
                    percentage = (int)((double)otvoreni / totalWorkOrders * 100)
                },
                uTijeku = new StatusItem
                {
                    count = uTijeku,
                    percentage = (int)((double)uTijeku / totalWorkOrders * 100)
                },
                zavrseni = new StatusItem
                {
                    count = zavrseni,
                    percentage = (int)((double)zavrseni / totalWorkOrders * 100)
                }
            };
        }

        private string GetTimeAgo(DateTime dateTime)
        {
            var timeSpan = DateTime.Now - dateTime;

            if (timeSpan.TotalMinutes < 1)
                return "Upravo sada";
            else if (timeSpan.TotalMinutes < 60)
                return $"{(int)timeSpan.TotalMinutes} minuta";
            else if (timeSpan.TotalHours < 24)
                return $"{(int)timeSpan.TotalHours} sati";
            else
                return $"{(int)timeSpan.TotalDays} dana";
        }

        private string GetActionType(string status)
        {
            return status switch
            {
                "Otvoren" => "kreiran",
                "U tijeku" => "započet",
                "Zatvoren" => "završen",
                _ => "ažuriran"
            };
        }

        private string GetActivityType(string status, string priority)
        {
            if (priority == "Visok")
                return "critical";

            return status switch
            {
                "Otvoren" => "create",
                "U tijeku" => "plan",
                "Zatvoren" => "complete",
                _ => "create"
            };
        }
    }
}