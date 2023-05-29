'use strict'

const {createLogger, format, transports} = require('winston');
const dailyRotateFile = require('winston-daily-rotate-file');

module.exports.newLogger = function(level, fileName) {
    return createLogger({
        level: level,
        format: format.combine(
            format.timestamp({
                format: 'YYYY-MM-DD HH:mm:ss'
            }),
            format.errors({ stack: true }),
            format.splat(),
            format.json()
        ),
        defaultMeta: {
            fileName: fileName
        },
        transports: [
            new transports.Console(),
            new transports.DailyRotateFile({
                level: 'info',
                filename: './logs/work-%DATE%.log',
                datePattern: 'YYYY-MM-DD',
                maxFiles: '20',
                auditFile: './logs/auditFileForWork.json'
            }),
            new transports.DailyRotateFile({
                level: 'error',
                filename: './logs/errors-%DATE%.log',
                datePattern: 'YYYY-MM-DD',
                maxFiles: '20',
                auditFile: './logs/auditFileForError.json'
            })
        ]
    });
}