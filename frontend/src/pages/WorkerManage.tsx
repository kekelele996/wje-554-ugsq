import { Button, Card, CardContent, Drawer, Grid, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { ServiceCategory, WorkerStatus } from '../constants/enums';
import { categoryConfig } from '../constants/categories';
import { PageHeader } from '../components/common/PageHeader';
import { RatingStars } from '../components/common/RatingStars';
import { WorkerCard } from '../components/common/WorkerCard';
import { useWorkerStore } from '../stores/workerStore';

export function WorkerManage() {
  const { workers, selected, loadWorkers, loadWorker, review } = useWorkerStore();
  const [status, setStatus] = useState<WorkerStatus | ''>('');
  const [category, setCategory] = useState<ServiceCategory | ''>('');

  useEffect(() => { loadWorkers({ status: status || undefined, category: category || undefined }); }, [loadWorkers, status, category]);

  return (
    <>
      <PageHeader
        title="技师管理"
        subtitle="审核技师、查看评分与接单状态"
        actions={<Stack direction="row" spacing={1}>
          <TextField select size="small" label="状态" value={status} onChange={(e) => setStatus(e.target.value as WorkerStatus | '')} sx={{ minWidth: 140 }}>
            <MenuItem value="">全部</MenuItem>{Object.values(WorkerStatus).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
          </TextField>
          <TextField select size="small" label="类目" value={category} onChange={(e) => setCategory(e.target.value as ServiceCategory | '')} sx={{ minWidth: 140 }}>
            <MenuItem value="">全部</MenuItem>{Object.values(ServiceCategory).map((item) => <MenuItem key={item} value={item}>{categoryConfig[item].label}</MenuItem>)}
          </TextField>
        </Stack>}
      />
      <Grid container spacing={2}>{workers.map((worker) => <Grid item xs={12} md={4} key={worker.id}><WorkerCard worker={worker} onClick={() => loadWorker(worker.id)} /></Grid>)}</Grid>
      <Drawer anchor="right" open={Boolean(selected)} onClose={() => useWorkerStore.setState({ selected: undefined })}>
        {selected && <Stack spacing={2} sx={{ width: 380, p: 3 }}>
          <Typography variant="h5">{selected.name}</Typography>
          <RatingStars value={selected.rating} readOnly />
          <Typography>{selected.bio}</Typography>
          <Typography color="text.secondary">手机号：{selected.phone}</Typography>
          <Typography color="text.secondary">身份证：{selected.idCardNo}</Typography>
          <Card><CardContent><Typography variant="h6">评分统计</Typography><Typography>平均 {selected.rating} 分，完成 {selected.totalOrders} 单</Typography></CardContent></Card>
          {selected.status === WorkerStatus.PENDING_REVIEW && <Stack direction="row" spacing={1}>
            <Button variant="contained" onClick={() => review(selected.id, true)}>审核通过</Button>
            <Button color="error" variant="outlined" onClick={() => review(selected.id, false)}>拒绝</Button>
          </Stack>}
        </Stack>}
      </Drawer>
    </>
  );
}
