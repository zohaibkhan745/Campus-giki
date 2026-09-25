import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle } from 'lucide-react';
import { eventService } from '@/services/event.service';
import { Button } from '@/components/ui/Button';

interface DeleteEventDialogProps {
  isOpen: boolean;
  eventId: string | null;
  eventTitle: string | null;
  onClose: () => void;
}

export const DeleteEventDialog: React.FC<DeleteEventDialogProps> = ({
  isOpen,
  eventId,
  eventTitle,
  onClose,
}) => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    meta: { notify: true },
    mutationFn: (id: string) => eventService.deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myEvents'] });
      queryClient.invalidateQueries({ queryKey: ['publicEvents'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['societyEvents'] });
      queryClient.invalidateQueries({ queryKey: ['societyDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['adminEvents'] });
      queryClient.invalidateQueries({ queryKey: ['adminEventsList'] });
      queryClient.invalidateQueries({ queryKey: ['advisorDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['campusFeed'] });
      onClose();
    },
  });

  if (!isOpen || !eventId) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
    >
      <div className="w-full max-w-md bg-surface-card border border-border-subtle rounded-2xl p-6 shadow-elevation-3 space-y-4 text-left">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 id="delete-dialog-title" className="font-bold text-lg text-text-primary">
              Delete Event?
            </h3>
            <p className="text-xs text-text-muted">This action cannot be undone.</p>
          </div>
        </div>

        <p className="text-sm text-text-secondary font-medium">
          Are you sure you want to delete <span className="font-semibold text-text-primary">&quot;{eventTitle}&quot;</span>? All event details will be permanently removed.
        </p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={deleteMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            isLoading={deleteMutation.isPending}
            onClick={() => deleteMutation.mutate(eventId)}
          >
            Delete Event
          </Button>
        </div>
      </div>
    </div>
  );
};
