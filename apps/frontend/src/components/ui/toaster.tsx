'use client';

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast';
import { useToast } from '@/components/ui/use-toast';

export function Toaster() {
  const { toasts } = useToast();

  console.log('Toaster rendered with toasts:', toasts.length);

  return (
    <ToastProvider>
      {toasts.map(function (toast) {
        console.log('Rendering toast:', toast);
        return (
          <Toast key={toast.id} {...toast}>
            <div className='grid gap-1'>
              {toast.title && <ToastTitle>{toast.title}</ToastTitle>}
              {toast.description && <ToastDescription>{toast.description}</ToastDescription>}
            </div>
            {toast.action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
