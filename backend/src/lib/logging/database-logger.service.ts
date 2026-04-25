import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { Knex } from 'knex';
import { Log } from './log.interface';

@Injectable()
export class DatabaseLoggerService implements LoggerService {
  constructor(
    @Inject('KNEX_CONNECTION') private readonly knex: Knex,
  ) {}

  private printToConsole(log: Log) {
    const idTag = `\x1b[36m[ID: ${log.correlationId || 'N/A'}]\x1b[0m`;
    const methodTag = `\x1b[33m${log.method || 'SYS'}\x1b[0m`;
    const endpoint = log.endpoint || '';
    
    if (log.level === 'error') {
      console.error(
        `\x1b[31m[ERROR]\x1b[0m ${idTag} ${methodTag} ${endpoint} -> ${log.errorMessage}`,
      );
      if (log.trace) {
        const shortTrace = log.trace.split('\n').slice(0, 2).join('\n');
        console.error(`\x1b[90m${shortTrace}\x1b[0m`);
      }
    } else {
      console.log(
        `\x1b[32m[LOG]\x1b[0m   ${idTag} ${methodTag} ${endpoint}`,
      );
    }
  }

  // Helper to safely insert into DB without crashing the app if the DB is down
  private async insertLogSafe(log: Log) {
    try {
      await this.knex('logs').insert(log);
    } catch (err) {
      console.error('❌ Failed to save log to database', err);
    }
  }

  async log(log: Log) {
    log.level = 'log';
    this.printToConsole(log);
    await this.insertLogSafe(log);
  }

  async error(log: Log) {
    log.level = 'error';
    this.printToConsole(log);
    await this.insertLogSafe(log);
  }

  async warn(log: Log) {
    log.level = 'warn';
    console.warn(`\x1b[33m[WARN]\x1b[0m [ID: ${log.correlationId}] ${log.action}`);
    await this.insertLogSafe(log);
  }

  async debug(log: Log) {
    log.level = 'debug';
    if (process.env.NODE_ENV !== 'production') {
       console.debug(`\x1b[34m[DEBUG]\x1b[0m ${log.action}`);
    }
    await this.insertLogSafe(log);
  }

  async verbose(log: Log) {
    log.level = 'verbose';
    await this.insertLogSafe(log);
  }

  async getLogs(userId?: number): Promise<Log[]> {
    const query = this.knex('logs').select('*');
    
    if (userId) {
      query.where('userId', userId);
    }

    return await query
      .orderBy('timestamp', 'desc')
      .limit(100);
  }
}