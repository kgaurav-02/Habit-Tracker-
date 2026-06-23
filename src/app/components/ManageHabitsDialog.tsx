import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Trash2, GripVertical } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { getAllHabits, deleteHabit, Habit } from '../services/database';
import { toast } from 'sonner';

interface ManageHabitsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export function ManageHabitsDialog({ open, onOpenChange, onUpdate }: ManageHabitsDialogProps) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);

  useEffect(() => {
    if (open) {
      loadHabits();
    }
  }, [open]);

  async function loadHabits() {
    try {
      const habitsData = await getAllHabits();
      setHabits(habitsData);
    } catch (error) {
      console.error('Error loading habits:', error);
      toast.error('Failed to load habits');
    }
  }

  async function handleDelete() {
    if (!habitToDelete) return;

    try {
      await deleteHabit(habitToDelete.id);
      toast.success(`"${habitToDelete.name}" deleted`);
      setHabitToDelete(null);
      loadHabits();
      onUpdate();
    } catch (error) {
      console.error('Error deleting habit:', error);
      toast.error('Failed to delete habit');
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Habits</DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="max-h-[400px] pr-4">
            <div className="space-y-2">
              {habits.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No habits to manage
                </p>
              ) : (
                habits.map((habit) => (
                  <Card
                    key={habit.id}
                    className="p-3"
                    style={{ borderLeft: `4px solid ${habit.color}` }}
                  >
                    <div className="flex items-center gap-3">
                      <GripVertical className="w-4 h-4 text-muted-foreground" />
                      
                      <div className="flex-1">
                        <p className="font-medium">{habit.name}</p>
                        {habit.description && (
                          <p className="text-sm text-muted-foreground">{habit.description}</p>
                        )}
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => setHabitToDelete(habit)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!habitToDelete} onOpenChange={(open) => !open && setHabitToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Habit?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{habitToDelete?.name}" and all its completion history.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
