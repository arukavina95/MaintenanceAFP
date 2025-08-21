import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Box, LinearProgress, Avatar, CircularProgress, Alert, IconButton, Button } from '@mui/material';
import { 
  TrendingUp, 
  TrendingDown, 
  Assignment, 
  CheckCircle, 
  Warning,
  Schedule,
  Person,
  Refresh
} from '@mui/icons-material';
import { designTokens } from '../theme/designSystem';
import dashboardService, { type DashboardData, type DashboardActivity } from '../services/dashboardService';

export const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Pokušaj dohvatiti sve podatke odjednom
      const data = await dashboardService.getDashboardData();
      console.log('Dashboard data received:', data); // Debug log
      setDashboardData(data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Greška pri dohvaćanju podataka za dashboard');
      
      // Fallback: pokušaj dohvatiti pojedinačne podatke
      try {
        const [stats, activities, statusProgress] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getRecentActivities(),
          dashboardService.getStatusProgress()
        ]);
        
        console.log('Fallback data:', { stats, activities, statusProgress }); // Debug log
        
        setDashboardData({
          stats,
          activities,
          statusProgress
        });
      } catch (fallbackErr) {
        console.error('Fallback error:', fallbackErr);
        setError('Nije moguće dohvatiti podatke za dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Fallback podaci ako API nije dostupan
  const fallbackStats = [
    {
      title: 'Aktivni radni nalozi',
      value: 0,
      change: '0%',
      trend: 'up' as const,
      color: 'primary.main' as const,
      icon: <Assignment />
    },
    {
      title: 'Završeni ovaj mjesec',
      value: 0,
      change: '0%',
      trend: 'up' as const,
      color: 'success.main' as const,
      icon: <CheckCircle />
    },
    {
      title: 'Kritični naloz',
      value: 0,
      change: '0',
      trend: 'down' as const,
      color: 'error.main' as const,
      icon: <Warning />
    }
  ];

  const fallbackActivities: DashboardActivity[] = [];

  // Fallback podaci za status naloga
  const fallbackStatusProgress = {
    otvoreni: { count: 0, percentage: 0 },
    uTijeku: { count: 0, percentage: 0 },
    zavrseni: { count: 0, percentage: 0 }
  };

  const stats = dashboardData ? [
    {
      title: 'Aktivni radni nalozi',
      value: dashboardData.stats.aktivniRadniNalozi,
      change: '+12%', // Ovo bi trebalo biti dinamičko
      trend: 'up' as const,
      color: 'primary.main' as const,
      icon: <Assignment />
    },
    {
      title: 'Završeni ovaj mjesec',
      value: dashboardData.stats.zavrseniOvajMjesec || 0,
      change: dashboardData.stats.zavrseniOvajMjesec > 0 ? '+8%' : '0%',
      trend: dashboardData.stats.zavrseniOvajMjesec > 0 ? 'up' as const : 'down' as const,
      color: 'success.main' as const,
      icon: <CheckCircle />
    },
    {
      title: 'Kritični naloz',
      value: dashboardData.stats.kriticniNalozi,
      change: '-2', // Ovo bi trebalo biti dinamičko
      trend: 'down' as const,
      color: 'error.main' as const,
      icon: <Warning />
    }
  ] : fallbackStats;

  const recentActivities = dashboardData?.activities || fallbackActivities;
  const statusProgress = dashboardData?.statusProgress || fallbackStatusProgress;

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'create': return <Assignment color="primary" />;
      case 'complete': return <CheckCircle color="success" />;
      case 'plan': return <Schedule color="info" />;
      case 'critical': return <Warning color="error" />;
      default: return <Person color="action" />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center', 
          py: 12,
          gap: 3
        }}>
          <CircularProgress size={56} color="primary" />
          <Typography variant="h6" color="neutral.600" fontWeight={500}>
            Učitavanje dashboard podataka...
          </Typography>
          <Typography variant="body2" color="neutral.500">
            Molimo pričekajte
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center', 
          py: 12,
          gap: 3
        }}>
          <Alert 
            severity="error" 
            sx={{ 
              borderRadius: designTokens.borderRadius.lg,
              maxWidth: 500,
              '& .MuiAlert-icon': {
                fontSize: 28,
              },
              '& .MuiAlert-message': {
                fontSize: 16,
                fontWeight: 500,
              }
            }}
          >
            {error}
          </Alert>
        </Box>
      </Box>
    );
  }

  const handleRefresh = () => {
    setLoading(true);
    setError(null);
    fetchDashboardData();
  };

  // Funkcija za ažuriranje postojećih radnih naloga
  const updateExistingOrders = async () => {
    try {
      const response = await fetch('http://localhost:5008/api/RadniNalozi');
      const orders = await response.json();
      
      // Pronađi naloge s statusom "Zatvoreno"
      const ordersToUpdate = orders.filter((order: any) => order.status === 'Zatvoreno');
      
      if (ordersToUpdate.length > 0) {
        console.log(`Pronađeno ${ordersToUpdate.length} naloga za ažuriranje`);
        
        // Ažuriraj svaki nalog
        for (const order of ordersToUpdate) {
          const updatePayload = {
            ...order,
            Status: 'Završen' // Promijeni status
          };
          
          await fetch(`http://localhost:5008/api/RadniNalozi/${order.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatePayload)
          });
        }
        
        console.log('Svi nalogi su ažurirani');
        // Osvježi dashboard podatke
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Greška pri ažuriranju naloga:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="flex-end" alignItems="center" mb={4}>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            onClick={updateExistingOrders}
            sx={{ 
              color: 'warning.main',
              borderColor: 'warning.main',
              '&:hover': {
                borderColor: 'warning.dark',
                backgroundColor: 'warning.50',
              }
            }}
          >
            Ažuriraj postojeće naloge
          </Button>
          <IconButton 
            onClick={handleRefresh}
            disabled={loading}
            sx={{ 
              color: 'primary.main',
              '&:hover': {
                bgcolor: 'primary.50',
              }
            }}
          >
            <Refresh />
          </IconButton>
        </Box>
      </Box>

      {/* Statistike */}
      <Box display="flex" flexWrap="wrap" gap={3} mb={4}>
        {stats.map((stat, index) => (
          <Box key={index} sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)', lg: 'calc(33.33% - 16px)' } }}>
            <Card sx={{ 
              border: '1px solid',
              borderColor: 'neutral.200',
              borderRadius: designTokens.borderRadius.lg,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: designTokens.shadows.lg,
              },
            }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" color="neutral.600" gutterBottom>
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" fontWeight={600} color={stat.color}>
                      {stat.value}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={0.5} mt={1}>
                      {stat.trend === 'up' ? 
                        <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} /> :
                        <TrendingDown sx={{ fontSize: 16, color: 'error.main' }} />
                      }
                      <Typography 
                        variant="body2" 
                        color={stat.trend === 'up' ? 'success.main' : 'error.main'}
                        fontWeight={500}
                      >
                        {stat.change}
                      </Typography>
                    </Box>
                  </Box>
                  <Avatar sx={{ 
                    width: 48, 
                    height: 48, 
                    bgcolor: stat.color,
                    color: 'white'
                  }}>
                    {stat.icon}
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      <Box display="flex" flexWrap="wrap" gap={3}>
        {/* Status naloga */}
        <Box sx={{ width: { xs: '100%', lg: 'calc(33.33% - 16px)' } }}>
          <Card sx={{ 
            border: '1px solid',
            borderColor: 'neutral.200',
            borderRadius: designTokens.borderRadius.lg,
          }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={3}>
                Status naloga
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Otvoreni</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {statusProgress.otvoreni.count || 0}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={statusProgress.otvoreni.percentage || 0} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      backgroundColor: 'neutral.200',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: 'warning.main',
                      }
                    }} 
                  />
                </Box>
                <Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">U tijeku</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {statusProgress.uTijeku.count || 0}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={statusProgress.uTijeku.percentage || 0} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      backgroundColor: 'neutral.200',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: 'info.main',
                      }
                    }} 
                  />
                </Box>
                <Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Završeni</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {statusProgress.zavrseni.count || 0}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={statusProgress.zavrseni.percentage || 0} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      backgroundColor: 'neutral.200',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: 'success.main',
                      }
                    }} 
                  />
                </Box>
                {!dashboardData && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'neutral.50', borderRadius: 1 }}>
                    <Typography variant="body2" color="neutral.600" textAlign="center">
                      Podaci o statusu naloga nisu dostupni
                    </Typography>
                  </Box>
                )}
                {dashboardData && dashboardData.statusProgress.zavrseni.count === 0 && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'info.50', borderRadius: 1, border: '1px solid', borderColor: 'info.200' }}>
                    <Typography variant="body2" color="info.main" textAlign="center" fontWeight={500}>
                      ℹ️ Nema zatvorenih radnih naloga
                    </Typography>
                    <Typography variant="caption" color="info.main" textAlign="center" display="block" sx={{ mt: 0.5 }}>
                      Postojeći nalogi imaju status "Zatvoreno", a backend traži "Završen"
                    </Typography>
                    <Typography variant="caption" color="info.main" textAlign="center" display="block" sx={{ mt: 0.5 }}>
                      Klikni "Ažuriraj postojeće naloge" da riješiš problem
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Aktivnosti */}
        <Box sx={{ width: { xs: '100%', lg: 'calc(66.66% - 16px)' } }}>
          <Card sx={{ 
            border: '1px solid',
            borderColor: 'neutral.200',
            borderRadius: designTokens.borderRadius.lg,
          }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={3}>
                Nedavne aktivnosti
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                {recentActivities.map((activity) => (
                  <Box 
                    key={activity.id}
                    display="flex" 
                    alignItems="center" 
                    gap={2}
                    sx={{
                      p: 2,
                      borderRadius: designTokens.borderRadius.md,
                      backgroundColor: 'neutral.50',
                      '&:hover': {
                        backgroundColor: 'neutral.100',
                      },
                    }}
                  >
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'neutral.300' }}>
                      {getActivityIcon(activity.type)}
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="body2" fontWeight={500}>
                        {activity.action}
                      </Typography>
                      <Typography variant="caption" color="neutral.600">
                        {activity.user} • {activity.time}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
                 </Box>
       </Box>
       
               {/* RFID Test Component */}
       
        
        {/* Backend Test Component */}
       
      </Box>
    );
  }; 