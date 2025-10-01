'use client';

import * as React from 'react';
import { useNotes } from '@/hooks/use-notes';
import type { Note } from '@/lib/definitions';
import { useLanguage } from '@/hooks/use-language';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from './ui/dialog';
import { Edit, ChevronRight } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

export function NoteForm({
  isOpen,
  onOpenChange,
  noteToEdit,
}: {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  noteToEdit: Note | null;
}) {
  const { addNote, updateNote } = useNotes();
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [title, setTitle] = React.useState('');
  const [content, setContent] = React.useState('');

  React.useEffect(() => {
    if (noteToEdit) {
      setTitle(noteToEdit.title);
      setContent(noteToEdit.content);
    } else {
      setTitle('');
      setContent('');
    }
  }, [noteToEdit, isOpen]);

  const handleSave = () => {
    if (!title.trim() && !content.trim()) {
      toast({
        variant: 'destructive',
        title: t('notes_empty_error_title'),
        description: t('notes_empty_error_desc'),
      });
      return;
    }

    if (noteToEdit) {
      updateNote(noteToEdit.id, title, content);
      toast({
        title: t('notes_updated_success'),
        className: 'bg-primary text-primary-foreground',
      });
    } else {
      addNote(title, content);
      toast({
        title: t('notes_saved_success'),
        className: 'bg-primary text-primary-foreground',
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {noteToEdit ? t('notes_edit_title') : t('notes_add_title')}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">{t('notes_title_label')}</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('notes_title_placeholder')}
              className="bg-input"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="content">{t('notes_content_label')}</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t('notes_placeholder')}
              className="min-h-[200px] bg-input"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{t('cancel_button')}</Button>
          </DialogClose>
          <Button onClick={handleSave}>{t('save_button')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NoteRow({ note }: { note: Note }) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = React.useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(note.content);
    toast({
      title: t('copy_success_title'),
      className: 'bg-primary text-primary-foreground',
    });
  };

  return (
    <>
      <div className="w-full text-left p-4 flex items-center gap-4">
        <div className="flex-grow min-w-0">
          <button
            onClick={handleCopy}
            className="w-full text-left block"
            title={t('copy_success_title')}
          >
            <p className="font-semibold truncate">{note.title}</p>
          </button>
          <button
            onClick={() => setIsFormOpen(true)}
            className="w-full text-left block"
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <p className="truncate">{note.content.replace(/\n/g, ' ')}</p>
            </div>
          </button>
        </div>
        <button onClick={() => setIsFormOpen(true)} className="flex-shrink-0 p-2 -mr-2">
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>
      <NoteForm isOpen={isFormOpen} onOpenChange={setIsFormOpen} noteToEdit={note} />
    </>
  );
}


export function NotesPage() {
  const { notes, isLoaded } = useNotes();
  const { t } = useLanguage();
  const [isNoteFormOpen, setIsNoteFormOpen] = React.useState(false);
  
  const sortedNotes = React.useMemo(() => 
    [...notes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [notes]
  );

  if (!isLoaded) {
      return (
          <div className="space-y-2">
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
          </div>
      )
  }

  return (
    <>
        <div className="space-y-4">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight">{t('notes_title')}</h1>
            <Button variant="ghost" size="icon" onClick={() => setIsNoteFormOpen(true)}>
                <Edit className="h-5 w-5" />
                <span className="sr-only">{t('notes_add_button')}</span>
            </Button>
        </div>
        
        {sortedNotes.length > 0 ? (
            <div className="bg-card rounded-lg divide-y">
            {sortedNotes.map(note => (
                <NoteRow key={note.id} note={note} />
            ))}
            </div>
        ) : (
            <div className="text-center py-20">
            <h2 className="text-2xl font-semibold mb-2">{t('notes_empty_state_title')}</h2>
            <p className="text-muted-foreground mb-4">{t('notes_empty_state_desc_ios')}</p>
            </div>
        )}
        </div>
        <NoteForm isOpen={isNoteFormOpen} onOpenChange={setIsNoteFormOpen} noteToEdit={null} />
    </>
  );
}
