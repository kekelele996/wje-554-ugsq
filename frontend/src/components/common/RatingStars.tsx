import { Rating, Stack, Typography } from '@mui/material';

export function RatingStars({ value, onChange, readOnly = false }: { value?: number; onChange?: (value: number) => void; readOnly?: boolean }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <Rating
        value={value || 0}
        readOnly={readOnly}
        onChange={(_, next) => next && onChange?.(next)}
      />
      <Typography variant="body2" color="text.secondary">{(value || 0).toFixed(1)}</Typography>
    </Stack>
  );
}
