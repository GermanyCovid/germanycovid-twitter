import log4js from "log4js";

log4js.configure({
  appenders: {
    out: { type: "stdout", layout: { type: "pattern", pattern: "%[ %d{dd/MM/yyyy hh:mm:ss} | %p | %m %]" } }
  },
  categories: {
    default: {
      appenders: ["out"],
      level: "all"
    }
  },
  pm2: true
});

export namespace LogService {

  const logger = log4js.getLogger();

  export function logInfo(message: string) {
    logger.info(message);
  }

  export function logDebug(message: string) {
    logger.debug(message);
  }

  export function logWarn(message: string) {
    logger.warn(message);
  }

  export function logError(message: string) {
    logger.error(message);
  }
}