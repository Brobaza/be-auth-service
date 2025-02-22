import { BadRequestException } from '@nestjs/common';
import { format, isAfter, isValid, parse } from 'date-fns';
import { DATE_FORMAT, DATE_TIME_FORMAT } from './constants';
import { ErrorDictionary } from 'src/enums/error.dictionary';
import { DepositRequestPrefixCode } from 'src/enums/deposit.dictionary';

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const currentTime = () => new Date();

export const isValidTime = (inputDate: string, layout: string) => {
  const parsedDate = parse(inputDate, layout, currentTime());
  return isValid(parsedDate);
};

export const parseDateTime = (val: string) => {
  return parse(val, DATE_TIME_FORMAT, currentTime());
};

export const isValidDateTime = (val: string) => {
  return isValidTime(val, DATE_TIME_FORMAT);
};

export const formatCurrentDate = () => {
  return format(currentTime(), DATE_FORMAT);
};

export const formatCurrentDateTime = () => {
  return format(currentTime(), DATE_TIME_FORMAT);
};

export const createVietQrUrl = ({
  bankShortName,
  accountNumber,
  template = 'compact2',
  amount,
  description,
  accountName,
}: {
  bankShortName: string;
  accountNumber: string;
  template?: 'compact2' | 'compact' | 'qr_only' | 'print';
  amount: number;
  description: string;
  accountName: string;
}) => {
  return `https://img.vietqr.io/image/${bankShortName}-${accountNumber}-${template}.png?amount=${amount}&addInfo=${encodeURIComponent(description)}&accountName=${encodeURIComponent(accountName)}`;
};

export const parseRangeTime = (startTime: string, endTime: string) => {
  const now = currentTime();

  const start = parse(startTime, DATE_TIME_FORMAT, now);
  if (!isValid(start)) {
    throw new BadRequestException({
      code: ErrorDictionary.START_TIME_INVALID,
    });
  }

  const end = parse(endTime, DATE_TIME_FORMAT, now);
  if (!isValid(end)) {
    throw new BadRequestException({
      code: ErrorDictionary.END_TIME_INVALID,
    });
  }

  if (isAfter(start, end)) {
    throw new BadRequestException({
      code: ErrorDictionary.RANGE_TIME_INVALID,
    });
  }

  return [start, end];
};

export const formatToVND = (number: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(number);
};

export const generateTransactionCode = () => {
  const head = DepositRequestPrefixCode.HEAD;
  const mid = DepositRequestPrefixCode.MID;
  const end = DepositRequestPrefixCode.END;

  const randomNumber1 = Math.floor(1000 + Math.random() * 9000);
  const randomNumber2 = Math.floor(10 + Math.random() * 90);

  const [seconds, nanoseconds] = process.hrtime();
  const highResTime = `${seconds}${nanoseconds}`.slice(-6);

  return `${head}${randomNumber1}${mid}${randomNumber2}${end}${highResTime}`;
};

export const extractTransactionCode = (description: string) => {
  const head = DepositRequestPrefixCode.HEAD;
  const mid = DepositRequestPrefixCode.MID;
  const end = DepositRequestPrefixCode.END;

  const regex = new RegExp(`${head}\\d{4}${mid}\\d{2}${end}\\d{6}`, 'g');

  const match = description.match(regex);

  return match ? match[0] : null;
};
