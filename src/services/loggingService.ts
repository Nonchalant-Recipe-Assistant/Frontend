import axios from 'axios';

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  component?: string;
  userId?: number;
  userEmail?: string;
  additionalData?: Record<string, any>;
  stackTrace?: string;
}

class LoggingService {
  private baseUrl: string;
  private isDevelopment: boolean;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    this.isDevelopment = import.meta.env.DEV || false;
  }

  private async sendToServer(logEntry: LogEntry): Promise<void> {
    try {
      await axios.post(`${this.baseUrl}/logs`, logEntry, {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json',
        }
      });
    } catch (error) {
      // Fallback: log to console if server is unavailable
      console.error('Failed to send log to server:', error);
      this.storeLocally(logEntry);
    }
  }

  private storeLocally(logEntry: LogEntry): void {
    try {
      const storedLogs = localStorage.getItem('pendingLogs') || '[]';
      const logs: LogEntry[] = JSON.parse(storedLogs);
      logs.push(logEntry);
      
      // Keep only last 100 logs to prevent storage overflow
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }
      
      localStorage.setItem('pendingLogs', JSON.stringify(logs));
    } catch (error) {
      console.error('Failed to store log locally:', error);
    }
  }

  private async flushPendingLogs(): Promise<void> {
    try {
      const storedLogs = localStorage.getItem('pendingLogs');
      if (!storedLogs) return;

      const logs: LogEntry[] = JSON.parse(storedLogs);
      
      for (const log of logs) {
        await this.sendToServer(log);
      }
      
      localStorage.removeItem('pendingLogs');
    } catch (error) {
      console.error('Failed to flush pending logs:', error);
    }
  }

  private createLogEntry(
    level: LogLevel, 
    message: string, 
    component?: string, 
    additionalData?: Record<string, any>,
    error?: Error
  ): LogEntry {
    // Get user info from localStorage if available
    const userStr = localStorage.getItem('user');
    let user: { user_id?: number; email?: string } = {};
    
    try {
      user = userStr ? JSON.parse(userStr) : {};
    } catch (e) {
      console.warn('Failed to parse user data from localStorage');
    }

    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      component,
      userId: user.user_id,
      userEmail: user.email,
      additionalData,
      stackTrace: error?.stack
    };
  }

  public async error(
    message: string, 
    component?: string, 
    error?: Error, 
    additionalData?: Record<string, any>
  ): Promise<void> {
    const logEntry = this.createLogEntry(LogLevel.ERROR, message, component, additionalData, error);
    
    // Always log errors to console in development
    if (this.isDevelopment) {
      console.error(`[${component}] ${message}`, error, additionalData);
    }
    
    await this.sendToServer(logEntry);
  }

  public async warn(
    message: string, 
    component?: string, 
    additionalData?: Record<string, any>
  ): Promise<void> {
    const logEntry = this.createLogEntry(LogLevel.WARN, message, component, additionalData);
    
    if (this.isDevelopment) {
      console.warn(`[${component}] ${message}`, additionalData);
    }
    
    await this.sendToServer(logEntry);
  }

  public async info(
    message: string, 
    component?: string, 
    additionalData?: Record<string, any>
  ): Promise<void> {
    const logEntry = this.createLogEntry(LogLevel.INFO, message, component, additionalData);
    
    if (this.isDevelopment) {
      console.info(`[${component}] ${message}`, additionalData);
    }
    
    await this.sendToServer(logEntry);
  }

  public async debug(
    message: string, 
    component?: string, 
    additionalData?: Record<string, any>
  ): Promise<void> {
    const logEntry = this.createLogEntry(LogLevel.DEBUG, message, component, additionalData);
    
    if (this.isDevelopment) {
      console.debug(`[${component}] ${message}`, additionalData);
    }
    
    await this.sendToServer(logEntry);
  }

  // Initialize the service
  public initialize(): void {
    // Flush any pending logs on startup
    this.flushPendingLogs().catch(console.error);
    
    // Set up global error handlers
    this.setupGlobalErrorHandlers();
    
    this.info('Logging service initialized', 'LoggingService');
  }

  private setupGlobalErrorHandlers(): void {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.error(
        'Unhandled Promise Rejection', 
        'GlobalErrorHandler', 
        event.reason,
        { promise: event.promise.toString() }
      );
    });

    // Handle runtime errors
    window.addEventListener('error', (event) => {
      this.error(
        'Runtime Error', 
        'GlobalErrorHandler', 
        event.error,
        { 
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno 
        }
      );
    });
  }
}

// Create singleton instance
export const loggingService = new LoggingService();