namespace backend.DTOs
{
    public class DashboardData
    {
        public DashboardStats stats { get; set; } = new();
        public List<DashboardActivity> activities { get; set; } = new();
        public StatusProgress statusProgress { get; set; } = new();
    }

    public class DashboardStats
    {
        public int aktivniRadniNalozi { get; set; }
        public int zavrseniOvajMjesec { get; set; }
        public int kriticniNalozi { get; set; }
        public int aktivniTehnicari { get; set; }
    }

    public class DashboardActivity
    {
        public int Id { get; set; }
        public string Action { get; set; } = string.Empty;
        public string User { get; set; } = string.Empty;
        public string Time { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty; // "create", "complete", "plan", "critical"
    }

    public class StatusProgress
    {
        public StatusItem otvoreni { get; set; } = new();
        public StatusItem uTijeku { get; set; } = new();
        public StatusItem zavrseni { get; set; } = new();
    }

    public class StatusItem
    {
        public int count { get; set; }
        public int percentage { get; set; }
    }
}