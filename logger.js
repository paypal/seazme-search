const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf, colorize, align } = format;

const logFormat = printf(info => {
    return `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`;
  });
  
module.exports = {
      logger: createLogger({
        format: combine(
          label({ label: 'Seazmenodeweb' }),
          timestamp(),
          colorize(),
          align(),
          logFormat
        ),
        transports: [
            new transports.Console(),
            new transports.File({ filename: 'access.log' })
        ]
      })
}