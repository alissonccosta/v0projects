import fs from 'fs';
import path from 'path';
import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const dest = process.env.LOG_DEST || 'file';
const transportsArray: any[] = [];

if (dest === 'http' && process.env.LOG_SERVICE_URL) {
  try {
    const url = new URL(process.env.LOG_SERVICE_URL);
    transportsArray.push(new transports.Http({
      host: url.hostname,
      port: Number(url.port || (url.protocol === 'https:' ? 443 : 80)),
      path: url.pathname,
      ssl: url.protocol === 'https:'
    }));
  } catch (err) {
    console.error('Invalid LOG_SERVICE_URL', err);
  }
} else {
  const dir = process.env.LOG_DIR || path.join(__dirname, '../../logs');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  transportsArray.push(new DailyRotateFile({
    dirname: dir,
    filename: 'actions-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxFiles: '14d'
  }));
}

const logger = createLogger({
  level: 'info',
  format: format.combine(format.timestamp(), format.json()),
  transports: transportsArray
});

export default logger;
