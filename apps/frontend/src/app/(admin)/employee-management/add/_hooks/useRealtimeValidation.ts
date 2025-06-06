import { useState, useCallback } from 'react';
import { EmployeeService } from '@/services/employee.service';

// Simple debounce implementation
function debounce<T extends (...args: any[]) => any>(func: T, delay: number): T {
  let timeoutId: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  }) as T;
}

interface ValidationState {
  isValidating: boolean;
  isValid: boolean | null;
  message: string;
}

interface UseRealtimeValidationReturn {
  validationStates: {
    email: ValidationState;
    nik: ValidationState;
    employee_code: ValidationState;
  };
  validateField: (field: 'email' | 'nik' | 'employee_code', value: string) => void;
  clearValidation: (field: 'email' | 'nik' | 'employee_code') => void;
}

const employeeService = new EmployeeService();

export const useRealtimeValidation = (): UseRealtimeValidationReturn => {
  const [validationStates, setValidationStates] = useState({
    email: { isValidating: false, isValid: null, message: '' },
    nik: { isValidating: false, isValid: null, message: '' },
    employee_code: { isValidating: false, isValid: null, message: '' },
  });

  const validateFieldDebounced = useCallback(
    debounce(async (field: 'email' | 'nik' | 'employee_code', value: string) => {
      if (!value || value.trim() === '') {
        setValidationStates((prev) => ({
          ...prev,
          [field]: { isValidating: false, isValid: null, message: '' },
        }));
        return;
      }

      setValidationStates((prev) => ({
        ...prev,
        [field]: { ...prev[field], isValidating: true },
      }));

      try {
        const result = await employeeService.validateUniqueField(field, value);

        setValidationStates((prev) => ({
          ...prev,
          [field]: {
            isValidating: false,
            isValid: !result.exists,
            message: result.exists ? result.message || `${field} already exists` : '',
          },
        }));
      } catch (error) {
        setValidationStates((prev) => ({
          ...prev,
          [field]: {
            isValidating: false,
            isValid: null,
            message: 'Error validating field',
          },
        }));
      }
    }, 500),
    [],
  );

  const validateField = useCallback(
    (field: 'email' | 'nik' | 'employee_code', value: string) => {
      validateFieldDebounced(field, value);
    },
    [validateFieldDebounced],
  );

  const clearValidation = useCallback((field: 'email' | 'nik' | 'employee_code') => {
    setValidationStates((prev) => ({
      ...prev,
      [field]: { isValidating: false, isValid: null, message: '' },
    }));
  }, []);

  return {
    validationStates,
    validateField,
    clearValidation,
  };
};
