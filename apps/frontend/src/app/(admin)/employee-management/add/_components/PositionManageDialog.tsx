'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Trash2, Edit, Plus, Save, X } from 'lucide-react';
import { useGetMyPositions } from '@/api/queries/position.queries';
import {
  useCreatePosition,
  useUpdatePosition,
  useDeletePosition,
} from '@/api/mutations/position.mutations';
import { useToast } from '@/components/ui/use-toast';
import type { Position } from '@/api/queries/position.queries';

interface PositionManageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PositionManageDialog({ open, onOpenChange }: PositionManageDialogProps) {
  const [newPositionName, setNewPositionName] = useState('');
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [editName, setEditName] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [positionToDelete, setPositionToDelete] = useState<Position | null>(null);
  const { toast } = useToast();

  const { data: positions = [], isLoading } = useGetMyPositions();
  const createPositionMutation = useCreatePosition();
  const updatePositionMutation = useUpdatePosition();
  const deletePositionMutation = useDeletePosition();

  const handleCreatePosition = async () => {
    if (!newPositionName.trim()) {
      toast({
        title: 'Error',
        description: 'Position name is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      console.log('Creating position with name:', newPositionName.trim());
      const result = await createPositionMutation.mutateAsync({ name: newPositionName.trim() });
      console.log('Position created successfully:', result);
      setNewPositionName('');
      toast({
        title: 'Success',
        description: 'Position created successfully',
      });
    } catch (error) {
      console.error('Failed to create position:', error);
      toast({
        title: 'Error',
        description: 'Failed to create position. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdatePosition = async () => {
    if (!editingPosition || !editName.trim()) return;

    try {
      await updatePositionMutation.mutateAsync({
        id: editingPosition.id,
        data: { name: editName.trim() },
      });
      setEditingPosition(null);
      setEditName('');
      toast({
        title: 'Success',
        description: 'Position updated successfully',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update position',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!positionToDelete) return;

    try {
      await deletePositionMutation.mutateAsync(positionToDelete.id);
      toast({
        title: 'Success',
        description: 'Position deleted successfully',
      });
      setDeleteConfirmOpen(false);
      setPositionToDelete(null);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete position',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteClick = (position: Position) => {
    setPositionToDelete(position);
    setDeleteConfirmOpen(true);
  };

  const startEdit = (position: Position) => {
    setEditingPosition(position);
    setEditName(position.name);
  };

  const cancelEdit = () => {
    setEditingPosition(null);
    setEditName('');
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='max-w-3xl'>
          <DialogHeader>
            <DialogTitle>Manage Positions</DialogTitle>
            <DialogDescription>Add, edit, or delete your company positions.</DialogDescription>
          </DialogHeader>

          <div className='space-y-6'>
            {/* Add New Position */}
            <div className='flex items-end gap-2'>
              <div className='flex-1'>
                <Label htmlFor='newPosition'>Add New Position</Label>
                <Input
                  id='newPosition'
                  value={newPositionName}
                  onChange={(e) => setNewPositionName(e.target.value)}
                  placeholder='Enter position name'
                  onKeyDown={(e) => e.key === 'Enter' && handleCreatePosition()}
                  disabled={createPositionMutation.isPending}
                />
              </div>
              <Button
                onClick={handleCreatePosition}
                disabled={createPositionMutation.isPending || !newPositionName.trim()}
              >
                {createPositionMutation.isPending ? (
                  <>
                    <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className='mr-2 h-4 w-4' />
                    Add
                  </>
                )}
              </Button>
            </div>

            {/* Positions Table */}
            <div className='rounded-lg border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Position Name</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={2} className='py-8 text-center'>
                        Loading positions...
                      </TableCell>
                    </TableRow>
                  ) : positions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} className='text-muted-foreground py-8 text-center'>
                        No positions found. Add your first position above.
                      </TableCell>
                    </TableRow>
                  ) : (
                    positions.map((position) => (
                      <TableRow key={position.id}>
                        <TableCell>
                          {editingPosition?.id === position.id ? (
                            <Input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleUpdatePosition();
                                if (e.key === 'Escape') cancelEdit();
                              }}
                              autoFocus
                            />
                          ) : (
                            <span className='font-medium'>{position.name}</span>
                          )}
                        </TableCell>
                        <TableCell className='text-right'>
                          {editingPosition?.id === position.id ? (
                            <div className='flex justify-end gap-2'>
                              <Button
                                size='sm'
                                onClick={handleUpdatePosition}
                                disabled={updatePositionMutation.isPending}
                              >
                                <Save className='h-4 w-4' />
                              </Button>
                              <Button size='sm' variant='outline' onClick={cancelEdit}>
                                <X className='h-4 w-4' />
                              </Button>
                            </div>
                          ) : (
                            <div className='flex justify-end gap-2'>
                              <Button
                                size='sm'
                                variant='outline'
                                onClick={() => startEdit(position)}
                              >
                                <Edit className='h-4 w-4' />
                              </Button>
                              <Button
                                size='sm'
                                variant='destructive'
                                onClick={() => handleDeleteClick(position)}
                                disabled={deletePositionMutation.isPending}
                              >
                                <Trash2 className='h-4 w-4' />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Position</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;<strong>{positionToDelete?.name}</strong>
              &rdquo;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPositionToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className='bg-red-600 hover:bg-red-700'
              disabled={deletePositionMutation.isPending}
            >
              {deletePositionMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
