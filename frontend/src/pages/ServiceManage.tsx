import AddIcon from '@mui/icons-material/Add';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { serviceApi } from '../api/service';
import { categoryConfig } from '../constants/categories';
import { ServiceCategory, ServiceStatus } from '../constants/enums';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { useServiceStore } from '../stores/serviceStore';
import { money } from '../utils/format';

export function ServiceManage() {
  const { services, loadServices, updateStatus } = useServiceStore();
  const [category, setCategory] = useState<ServiceCategory | ''>('');
  const [status, setStatus] = useState<ServiceStatus | ''>('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', category: ServiceCategory.CLEANING, basePrice: 99, unit: '次', duration: 90, description: '' });

  useEffect(() => { loadServices({ category: category || undefined, status: status || undefined }); }, [loadServices, category, status]);

  return (
    <>
      <PageHeader title="服务管理" subtitle="维护服务项目、上下架与定价" actions={<Stack direction="row" spacing={1}>
        <TextField select size="small" label="类目" value={category} onChange={(e) => setCategory(e.target.value as ServiceCategory | '')} sx={{ minWidth: 140 }}>
          <MenuItem value="">全部</MenuItem>{Object.values(ServiceCategory).map((item) => <MenuItem key={item} value={item}>{categoryConfig[item].label}</MenuItem>)}
        </TextField>
        <TextField select size="small" label="状态" value={status} onChange={(e) => setStatus(e.target.value as ServiceStatus | '')} sx={{ minWidth: 120 }}>
          <MenuItem value="">全部</MenuItem><MenuItem value={ServiceStatus.ACTIVE}>上架</MenuItem><MenuItem value={ServiceStatus.INACTIVE}>下架</MenuItem>
        </TextField>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>新建服务</Button>
      </Stack>} />
      <Paper>
        <Table>
          <TableHead><TableRow><TableCell>服务</TableCell><TableCell>类目</TableCell><TableCell>价格</TableCell><TableCell>时长</TableCell><TableCell>状态</TableCell><TableCell>操作</TableCell></TableRow></TableHead>
          <TableBody>
            {services.map((service) => (
              <TableRow key={service.id}>
                <TableCell>{service.name}</TableCell>
                <TableCell>{categoryConfig[service.category].label}</TableCell>
                <TableCell>{money(service.basePrice)} / {service.unit}</TableCell>
                <TableCell>{service.duration} 分钟</TableCell>
                <TableCell><StatusBadge value={service.status} /></TableCell>
                <TableCell><Button onClick={() => updateStatus(service.id, service.status === ServiceStatus.ACTIVE ? ServiceStatus.INACTIVE : ServiceStatus.ACTIVE)}>{service.status === ServiceStatus.ACTIVE ? '下架' : '上架'}</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>新建服务项目</DialogTitle>
        <DialogContent><Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="名称" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <TextField select label="类目" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as ServiceCategory })}>{Object.values(ServiceCategory).map((item) => <MenuItem key={item} value={item}>{categoryConfig[item].label}</MenuItem>)}</TextField>
          <TextField label="价格" type="number" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: Number(e.target.value) })} />
          <TextField label="计价单位" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
          <TextField label="时长" type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })} />
          <TextField label="描述" multiline minRows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </Stack></DialogContent>
        <DialogActions><Button onClick={() => setOpen(false)}>取消</Button><Button variant="contained" onClick={async () => { await serviceApi.create(form); await loadServices(); setOpen(false); }}>保存</Button></DialogActions>
      </Dialog>
    </>
  );
}
