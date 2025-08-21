
import { getRadniNalozi, getUsers } from './radniNaloziService';
import type { RadniNalog, User } from './radniNaloziService';



export interface DashboardStats {
  aktivniRadniNalozi: number;
  zavrseniOvajMjesec: number;
  kriticniNalozi: number;
}

export interface StatusItem {
  count: number;
  percentage: number;
}

export interface StatusProgress {
  otvoreni: StatusItem;
  uTijeku: StatusItem;
  zavrseni: StatusItem;
}

export interface DashboardActivity {
  id: number;
  action: string;
  user: string;
  time: string;
  type: 'create' | 'complete' | 'plan' | 'critical';
}

export interface DashboardData {
  stats: DashboardStats;
  activities: DashboardActivity[];
  statusProgress: StatusProgress;
}

class DashboardService {
  async getDashboardData(): Promise<DashboardData> {
    try {
      // Fetch work orders and users data
      const [workOrders, users] = await Promise.all([
        getRadniNalozi(),
        getUsers()
      ]);

      // Calculate statistics from work orders data
      const stats = this.calculateStats(workOrders);
      const statusProgress = this.calculateStatusProgress(workOrders);
      const activities = this.generateActivities(workOrders, users);

      return {
        stats,
        statusProgress,
        activities
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }

  private calculateStats(workOrders: RadniNalog[], ): DashboardStats {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Count active work orders (Otvoren, U tijeku)
    const aktivniRadniNalozi = workOrders.filter(wo => 
      wo.status === 'Otvoren' || wo.status === 'U tijeku'
    ).length;

    // Count completed this month
    const zavrseniOvajMjesec = workOrders.filter(wo => {
      if (wo.status !== 'Završen' && wo.status !== 'Zatvoren' && !(wo.status as string).includes('Zavrsen')) return false;
      if (!wo.datumZatvaranja) return false;
      
      const closeDate = new Date(wo.datumZatvaranja);
      return closeDate.getMonth() === currentMonth && closeDate.getFullYear() === currentYear;
    }).length;

    // Count critical work orders
    const kriticniNalozi = workOrders.filter(wo => 
      wo.stupanjHitnosti === 'Kritičan'
    ).length;

    return {
      aktivniRadniNalozi,
      zavrseniOvajMjesec,
      kriticniNalozi
    };
  }

  private calculateStatusProgress(workOrders: RadniNalog[]): StatusProgress {
    const total = workOrders.length;
    
    // Debug: ispisati sve statuse da vidimo kako se točno zovu
    const uniqueStatuses = [...new Set(workOrders.map(wo => wo.status))];
    console.log('Dostupni statusi u podacima:', uniqueStatuses);
    
    const otvoreni = workOrders.filter(wo => wo.status === 'Otvoren').length;
    const uTijeku = workOrders.filter(wo => wo.status === 'U tijeku').length;
    const zavrseni = workOrders.filter(wo => 
      wo.status === 'Završen' || 
      wo.status === 'Zatvoren' ||
      (wo.status as string).includes('Zavrsen')
    ).length;

    console.log('Broj otvorenih:', otvoreni);
    console.log('Broj u tijeku:', uTijeku);
    console.log('Broj završenih:', zavrseni);

    return {
      otvoreni: {
        count: otvoreni,
        percentage: total > 0 ? Math.round((otvoreni / total) * 100) : 0
      },
      uTijeku: {
        count: uTijeku,
        percentage: total > 0 ? Math.round((uTijeku / total) * 100) : 0
      },
      zavrseni: {
        count: zavrseni,
        percentage: total > 0 ? Math.round((zavrseni / total) * 100) : 0
      }
    };
  }

  private generateActivities(workOrders: RadniNalog[], users: User[]): DashboardActivity[] {
    // Generate activities based on recent work orders
    const activities: DashboardActivity[] = [];
    
    // Get recent work orders (last 10)
    const recentOrders = workOrders
      .sort((a, b) => new Date(b.datumPrijave).getTime() - new Date(a.datumPrijave).getTime())
      .slice(0, 10);

    recentOrders.forEach((order, index) => {
      const user = users.find(u => u.id === order.ustanovioId);
      const userName = user ? user.ime : 'Nepoznat korisnik';
      
      activities.push({
        id: index + 1,
        action: `Kreiran radni nalog: ${order.brojRN}`,
        user: userName,
        time: new Date(order.datumPrijave).toLocaleDateString('hr-HR'),
        type: 'create'
      });
    });

    return activities;
  }

  async getStats(): Promise<DashboardStats> {
    const data = await this.getDashboardData();
    return data.stats;
  }

  async getRecentActivities(): Promise<DashboardActivity[]> {
    const data = await this.getDashboardData();
    return data.activities;
  }

  async getStatusProgress(): Promise<DashboardData['statusProgress']> {
    const data = await this.getDashboardData();
    return data.statusProgress;
  }
}

export default new DashboardService(); 