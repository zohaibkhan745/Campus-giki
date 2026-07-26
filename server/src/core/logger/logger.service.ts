import { Injectable, ConsoleLogger, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class AppLoggerService extends ConsoleLogger {
  log(message: any, context?: string) {
    super.log(message, context || this.context);
  }

  error(message: any, stack?: string, context?: string) {
    super.error(message, stack, context || this.context);
  }

  warn(message: any, context?: string) {
    super.warn(message, context || this.context);
  }

  debug(message: any, context?: string) {
    super.debug(message, context || this.context);
  }

  verbose(message: any, context?: string) {
    super.verbose(message, context || this.context);
  }
}
