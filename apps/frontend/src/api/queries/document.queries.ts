import { useQuery } from '@tanstack/react-query';

import { documentService } from '@/services/document.service';

import { queryKeys } from '../query-keys';

export const useDocumentsByEmployee = (employeeId: number, enabled: boolean = true) => useQuery({
    queryKey: queryKeys.documents.byEmployee(employeeId),
    queryFn: () => documentService.getDocumentsByEmployee(employeeId),
    enabled: enabled && !!employeeId,
    staleTime: 30 * 1000,
  });
