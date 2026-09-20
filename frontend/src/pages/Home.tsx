import SearchIcon from '@mui/icons-material/Search';
import { Box, Button, Grid, InputAdornment, Paper, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { categoryConfig } from '../constants/categories';
import { ServiceCategory, ServiceStatus } from '../constants/enums';
import { ServiceCard } from '../components/common/ServiceCard';
import { WorkerCard } from '../components/common/WorkerCard';
import { PageHeader } from '../components/common/PageHeader';
import { useServiceStore } from '../stores/serviceStore';
import { useWorkerStore } from '../stores/workerStore';

export function Home() {
  const [keyword, setKeyword] = useState('');
  const { services, loadServices } = useServiceStore();
  const { workers, loadWorkers } = useWorkerStore();

  useEffect(() => {
    loadServices({ status: ServiceStatus.ACTIVE });
    loadWorkers();
  }, [loadServices, loadWorkers]);

  const filtered = useMemo(() => services.filter((service) => service.name.includes(keyword)), [services, keyword]);
  const topWorkers = [...workers].sort((a, b) => b.rating - a.rating).slice(0, 3);
  const hotServices = [...filtered].sort((a, b) => b.orderCount - a.orderCount).slice(0, 6);

  return (
    <>
      <PageHeader title="服务分类" subtitle="搜索服务、查看推荐技师并快速下单" />
      <Paper sx={{ p: { xs: 3, md: 5 }, mb: 3, background: 'linear-gradient(135deg, #fffdf7 0%, #dceadf 100%)' }}>
        <Typography variant="h4">今天的家务、维修和跑腿，一次排好</Typography>
        <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>平台活动：新客首单减 30 元，晚间维修免上门费。</Typography>
        <TextField
          fullWidth
          placeholder="搜索深度保洁、水管疏通、搬家..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
        />
      </Paper>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {Object.entries(categoryConfig).map(([category, config]) => {
          const Icon = config.icon;
          return (
            <Grid item xs={6} md={2.4} key={category}>
              <Button fullWidth variant="outlined" onClick={() => loadServices({ category: category as ServiceCategory, status: ServiceStatus.ACTIVE })} sx={{ p: 2.5, justifyContent: 'flex-start', bgcolor: 'background.paper' }}>
                <Stack direction="row" spacing={1.5} alignItems="center"><Icon sx={{ color: config.color }} /><Typography fontWeight={800}>{config.label}</Typography></Stack>
              </Button>
            </Grid>
          );
        })}
      </Grid>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>推荐技师</Typography>
        <Grid container spacing={2}>{topWorkers.map((worker) => <Grid item xs={12} md={4} key={worker.id}><WorkerCard worker={worker} /></Grid>)}</Grid>
      </Box>
      <Box>
        <Typography variant="h5" sx={{ mb: 2 }}>热门服务</Typography>
        <Grid container spacing={2}>{hotServices.map((service) => <Grid item xs={12} md={4} key={service.id}><ServiceCard service={service} /></Grid>)}</Grid>
      </Box>
    </>
  );
}
