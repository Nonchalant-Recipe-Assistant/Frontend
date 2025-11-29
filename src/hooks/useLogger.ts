import { useRef } from 'react';
import { loggingService, LogLevel } from '../services/loggingService';

export const useLogger = (componentName: string) => {
  const loggerRef = useRef({
    error: (message: string, error?: Error, additionalData?: Record<string, any>) => 
      loggingService.error(message, componentName, error, additionalData),
    
    warn: (message: string, additionalData?: Record<string, any>) => 
      loggingService.warn(message, componentName, additionalData),
    
    info: (message: string, additionalData?: Record<string, any>) => 
      loggingService.info(message, componentName, additionalData),
    
    debug: (message: string, additionalData?: Record<string, any>) => 
      loggingService.debug(message, componentName, additionalData),
  });

  return loggerRef.current;
};