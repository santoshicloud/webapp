const winston = require('winston');

const severityMap = {
    error: 'error',
    warn: 'warning',
    info: 'info',
    debug: 'debug'
};

//Determining log file path based on environment
const logFilePath = process.env.NODE_ENV === 'test' ? '/dev/null' : 'var/log/webapp/application.log';

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(info => {
            //Map Winston log levels to Google Cloud Logging severity levels
            const severity = severityMap[info.level] || 'default';
            //return the log message with the severity level
            return JSON.stringify({
                severity: severity,
                message: info.message,
                timestamp: info.timestamp
            });
        })
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: logFilePath})
    ]
});

module.exports = logger;