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
import { useGetMyBranches } from '@/api/queries/branch.queries';
import {
  useCreateBranch,
  useUpdateBranch,
  useDeleteBranch,
} from '@/api/mutations/branch.mutations';
import { useToast } from '@/components/ui/use-toast';
import type { Branch } from '@/api/queries/branch.queries';

interface BranchManageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BranchManageDialog({ open, onOpenChange }: BranchManageDialogProps) {
  const [newBranchName, setNewBranchName] = useState('');
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [editName, setEditName] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState<Branch | null>(null);
  const { toast } = useToast();

  const { data: branches = [], isLoading } = useGetMyBranches();
  const createBranchMutation = useCreateBranch();
  const updateBranchMutation = useUpdateBranch();
  const deleteBranchMutation = useDeleteBranch();

  const handleCreateBranch = async () => {
    if (!newBranchName.trim()) {
      toast({
        title: 'Error',
        description: 'Branch name is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      console.log('Creating branch with name:', newBranchName.trim());
      const result = await createBranchMutation.mutateAsync({ name: newBranchName.trim() });
      console.log('Branch created successfully:', result);
      setNewBranchName('');
      toast({
        title: 'Success',
        description: 'Branch created successfully',
      });
    } catch (error) {
      console.error('Failed to create branch:', error);
      toast({
        title: 'Error',
        description: 'Failed to create branch. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateBranch = async () => {
    if (!editingBranch || !editName.trim()) return;

    try {
      await updateBranchMutation.mutateAsync({
        id: editingBranch.id,
        data: { name: editName.trim() },
      });
      setEditingBranch(null);
      setEditName('');
      toast({
        title: 'Success',
        description: 'Branch updated successfully',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update branch',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!branchToDelete) return;

    try {
      await deleteBranchMutation.mutateAsync(branchToDelete.id);
      toast({
        title: 'Success',
        description: 'Branch deleted successfully',
      });
      setDeleteConfirmOpen(false);
      setBranchToDelete(null);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete branch',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteClick = (branch: Branch) => {
    setBranchToDelete(branch);
    setDeleteConfirmOpen(true);
  };

  const startEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setEditName(branch.name);
  };

  const cancelEdit = () => {
    setEditingBranch(null);
    setEditName('');
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='max-w-3xl'>
          <DialogHeader>
            <DialogTitle>Manage Branches</DialogTitle>
            <DialogDescription>Add, edit, or delete your company branches.</DialogDescription>
          </DialogHeader>

          <div className='space-y-6'>
            {/* Add New Branch */}
            <div className='flex items-end gap-2'>
              <div className='flex-1'>
                <Label htmlFor='newBranch'>Add New Branch</Label>
                <Input
                  id='newBranch'
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  placeholder='Enter branch name'
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateBranch()}
                  disabled={createBranchMutation.isPending}
                />
              </div>
              <Button
                onClick={handleCreateBranch}
                disabled={createBranchMutation.isPending || !newBranchName.trim()}
              >
                {createBranchMutation.isPending ? (
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

            {/* Branches Table */}
            <div className='rounded-lg border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Branch Name</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={2} className='py-8 text-center'>
                        Loading branches...
                      </TableCell>
                    </TableRow>
                  ) : branches.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} className='text-muted-foreground py-8 text-center'>
                        No branches found. Add your first branch above.
                      </TableCell>
                    </TableRow>
                  ) : (
                    branches.map((branch) => (
                      <TableRow key={branch.id}>
                        <TableCell>
                          {editingBranch?.id === branch.id ? (
                            <Input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleUpdateBranch();
                                if (e.key === 'Escape') cancelEdit();
                              }}
                              autoFocus
                            />
                          ) : (
                            <span className='font-medium'>{branch.name}</span>
                          )}
                        </TableCell>
                        <TableCell className='text-right'>
                          {editingBranch?.id === branch.id ? (
                            <div className='flex justify-end gap-2'>
                              <Button
                                size='sm'
                                onClick={handleUpdateBranch}
                                disabled={updateBranchMutation.isPending}
                              >
                                <Save className='h-4 w-4' />
                              </Button>
                              <Button size='sm' variant='outline' onClick={cancelEdit}>
                                <X className='h-4 w-4' />
                              </Button>
                            </div>
                          ) : (
                            <div className='flex justify-end gap-2'>
                              <Button size='sm' variant='outline' onClick={() => startEdit(branch)}>
                                <Edit className='h-4 w-4' />
                              </Button>
                              <Button
                                size='sm'
                                variant='destructive'
                                onClick={() => handleDeleteClick(branch)}
                                disabled={deleteBranchMutation.isPending}
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
            <AlertDialogTitle>Delete Branch</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;<strong>{branchToDelete?.name}</strong>&rdquo;?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBranchToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className='bg-red-600 hover:bg-red-700'
              disabled={deleteBranchMutation.isPending}
            >
              {deleteBranchMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
