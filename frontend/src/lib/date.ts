import { parseDate } from '@chakra-ui/react';

const isValidDateParts = (day: number, month: number, year: number) => {
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
};

export const formatDateAsDdSlashMMSlashYyyy = (value: string | Date) => {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString();

  return `${day}/${month}/${year}`;
};

export const parseDdSlashMMSlashYyyyToDateValue = (value: string) => {
  const trimmed = value.trim();
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
    return undefined;
  }

  const [dayText, monthText, yearText] = trimmed.split('/');
  const day = Number(dayText);
  const month = Number(monthText);
  const year = Number(yearText);

  if (!isValidDateParts(day, month, year)) {
    return undefined;
  }

  return parseDate(`${year.toString().padStart(4, '0')}-${month
    .toString()
    .padStart(2, '0')}-${day.toString().padStart(2, '0')}`);
};