import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../query-keys';
import { documentService } from '@/services/document.service';

export const useDocumentsByEmployee = (employeeId: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.documents.byEmployee(employeeId),
    queryFn: () => documentService.getDocumentsByEmployee(employeeId),
    enabled: enabled && !!employeeId,
    staleTime: 30 * 1000,
  });
};
