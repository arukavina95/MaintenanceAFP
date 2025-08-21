import React from 'react';
import { Card, CardContent, Chip, Box, Typography} from '@mui/material';
import { WorkOutline, Schedule, Person, Warning, Assignment } from '@mui/icons-material';
import { designTokens } from '../theme/designSystem';
import type { RadniNalog } from '../services/radniNaloziService';

interface WorkOrderCardProps {
  workOrder: RadniNalog;
  onClick: () => void;
  users?: Array<{ id: number; ime: string }>;
}

export const WorkOrderCard: React.FC<WorkOrderCardProps> = ({ workOrder, onClick, users }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'otvoren': return 'warning';
      case 'u tijeku': return 'info';
      case 'zatvoren': return 'success';
      case 'završen': return 'success';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'visok': return 'error';
      case 'srednji': return 'warning';
      case 'nizak': return 'success';
      case 'kritičan': return 'error';
      default: return 'default';
    }
  };

  return (
    <Card 
      onClick={onClick}
      sx={{
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: designTokens.shadows.lg,
        },
        border: '1px solid',
        borderColor: 'neutral.200',
        borderRadius: designTokens.borderRadius.lg,
        height: '100%',
      }}
    >
      <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box flex={1}>
            <Typography variant="h6" fontWeight={600} color="neutral.800" gutterBottom>
              {workOrder.brojRN}
            </Typography>
            <Typography variant="body1" color="neutral.600" sx={{ mb: 1 }}>
              {workOrder.naslov}
            </Typography>
          </Box>
          <Box display="flex" gap={1}>
            <Chip 
              label={workOrder.status}
              color={getStatusColor(workOrder.status) as any}
              size="small"
              sx={{ fontWeight: 500 }}
            />
            <Chip 
              label={workOrder.stupanjHitnosti}
              color={getPriorityColor(workOrder.stupanjHitnosti) as any}
              size="small"
              icon={<Warning />}
            />
          </Box>
        </Box>

        <Box display="flex" flexDirection="column" gap={1} flex={1}>
          <Box display="flex" alignItems="center" gap={1}>
            <Person sx={{ fontSize: 16, color: 'neutral.500' }} />
            <Typography variant="body2" color="neutral.600">
              {workOrder.ustanovio || 'Nepoznato'}
            </Typography>
          </Box>
          
          <Box display="flex" alignItems="center" gap={1}>
            <WorkOutline sx={{ fontSize: 16, color: 'neutral.500' }} />
            <Typography variant="body2" color="neutral.600">
              {workOrder.stroj || 'Nepoznato'}
            </Typography>
          </Box>
          
          <Box display="flex" alignItems="center" gap={1}>
            <Schedule sx={{ fontSize: 16, color: 'neutral.500' }} />
            <Typography variant="body2" color="neutral.600">
              {workOrder.datumPrijave ? new Date(workOrder.datumPrijave).toLocaleDateString('hr-HR') : 'Nepoznato'}
            </Typography>
          </Box>
          
          {workOrder.dodijeljenoId && (
            <Box display="flex" alignItems="center" gap={1}>
              <Assignment sx={{ fontSize: 16, color: 'neutral.500' }} />
              <Typography variant="body2" color="neutral.600">
                {users ? (() => {
                  const user = users.find(u => u.id === workOrder.dodijeljenoId);
                  return user ? user.ime : `ID: ${workOrder.dodijeljenoId}`;
                })() : `ID: ${workOrder.dodijeljenoId}`}
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}; 