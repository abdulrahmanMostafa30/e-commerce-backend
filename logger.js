import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import fs from 'fs';
import path from 'path';


const env = process.env.NODE_ENV || 'development';
const logDir = 'log';
const datePatternConfiguration = {
  default: 'YYYY-MM-DD',
  everHour: 'YYYY-MM-DD-HH',
  everMinute: 'YYYY-MM-DD-THH-mm',
};
const numberOfDaysToKeepLog = 30;
const fileSizeToRotate = 1; // in megabyte

// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Configure daily rotation for log files
const configureDailyRotateTransport = () => {
  return new transports.DailyRotateFile({
    filename: `${logDir}/%DATE%-results.log`,
    datePattern: datePatternConfiguration.everHour,
    zippedArchive: true,
    maxSize: `${fileSizeToRotate}m`,
    maxFiles: `${numberOfDaysToKeepLog}d`,
  });
};

// Configure console transport
const configureConsoleTransport = () => {
  return new transports.Console({
    level: 'info',
    handleExceptions: true,
    format: format.combine(
      format.label({ label: path.basename(new URL(import.meta.url).pathname) }),
      format.colorize(),
      format.printf(
        info => `${info.timestamp}[${info.label}] ${info.level}: ${info.message}`
      ),
    ),
  });
};

// Create the logger instance
const configureLogger = () => {
  const transportsArray = [];

  if (env === 'development') {
    transportsArray.push(configureConsoleTransport());
  }

  transportsArray.push(configureDailyRotateTransport());

  return createLogger({
    level: env === 'development' ? 'verbose' : 'info',
    handleExceptions: true,
    format: format.combine(
      format.label({ label: path.basename(new URL(import.meta.url).pathname) }),
      format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
      }),
      format.printf(
        info => `${info.timestamp}[${info.label}] ${info.level}: ${JSON.stringify(info.message)}`
      ),
    ),
    transports: transportsArray,
  });
};

const logger = configureLogger();

logger.stream = {
  write: (message) => {
    logger.info(message);
  },
};

export default logger;
