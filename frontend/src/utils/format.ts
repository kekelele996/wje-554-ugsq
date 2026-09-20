import dayjs from 'dayjs';

export const money = (value: number) => `¥${value.toFixed(2)}`;
export const datetime = (value: string) => dayjs(value).format('YYYY-MM-DD HH:mm');
