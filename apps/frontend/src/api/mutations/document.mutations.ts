import { useMutation, useQueryClient } from '@tanstack/react-query';

import { documentService } from '@/services/document.service';

import { queryKeys } from '../query-keys';

export const useUploadDocumentForEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: queryKeys.documents.upload,
    mutationFn: ({ employeeId, file }: { employeeId: number; file: File }) =>
      documentService.uploadDocumentForEmployee(employeeId, file),
    onSuccess: (_, { employeeId }) => {
      // Invalidate documents for the specific employee
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.byEmployee(employeeId) });
    },
  });
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (documentId: number) => documentService.deleteDocument(documentId),
    onSuccess: () => {
      // Invalidate all document queries since we don't know which employee this document belonged to
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
};
