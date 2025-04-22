import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { ColumnDef } from '@tanstack/react-table';
import { LoaderCircle } from 'lucide-react';
import { PaginatedDataTable } from '../ui/data-table-paginated';
import { Tag } from '@/types/tag';
import {
  fetchAllTags,
  selectAllTags,
  selectError,
  selectLoading,
  deleteTag,
  updateTag,
} from '@/store/slices/tagSlice';
import AddTagModal from './AddTagModal';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '../ui/input';
import { toast } from 'sonner';
import TagDelete from './TagDelete';

const TagList = () => {
  const dispatch = useAppDispatch();
  const tags = useAppSelector(selectAllTags);
  const loading = useAppSelector(selectLoading);
  const error = useAppSelector(selectError);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editTag, setEditTag] = useState<Tag | null>(null);
  const [editNameFi, setEditNameFi] = useState('');
  const [editNameEn, setEditNameEn] = useState('');

  useEffect(() => {
    dispatch(fetchAllTags());
  }, [dispatch]);

  const handleEditClick = (tag: Tag) => {
    setEditTag(tag);
    setEditNameFi(tag.translations?.fi?.name || '');
    setEditNameEn(tag.translations?.en?.name || '');
  };

  const handleUpdate = async () => {
    if (!editTag) return;
    setIsSubmitting(true);

    const updatedTag = {
      ...editTag,
      translations: {
        fi: { name: editNameFi },
        en: { name: editNameEn },
      },
    };

    try {
      await dispatch(updateTag({ id: editTag.id, tagData: updatedTag })).unwrap();
      toast.success('Tag updated successfully');
      setIsSubmitting(false);
      dispatch(fetchAllTags());
      setEditTag(null);
    } catch (err) {
      toast.error('Failed to update tag');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: ColumnDef<Tag>[] = [
    {
      header: 'Tag Name (FI)',
      accessorFn: row => row.translations?.fi?.name ?? '—',
      cell: ({ row }) => row.original.translations?.fi?.name ?? '—',
    },
    {
      header: 'Tag Name (EN)',
      accessorFn: row => row.translations?.en?.name ?? '—',
      cell: ({ row }) => row.original.translations?.en?.name ?? '—',
    },
    {
      header: 'Created At',
      accessorKey: 'created_at',
      cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const tag = row.original;
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleEditClick(tag)}
              className="bg-background rounded-2xl px-6 text-highlight2 border-highlight2 border-1 hover:text-background hover:bg-highlight2"
            >
              Edit
            </Button>
            <TagDelete
              id={tag.id}
              onDeleted={() => {
                dispatch(fetchAllTags());
              }}
            />
          </div>
        );
      },
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <LoaderCircle className="animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-destructive">{error}</div>;
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl">Manage Tags</h1>
        <AddTagModal>
          <Button className="bg-highlight2 text-background rounded-2xl px-6">
            Add New Tag
          </Button>
        </AddTagModal>
      </div>

      <PaginatedDataTable columns={columns} data={tags} />

      {/* Edit Modal */}
      {editTag && (
        <Dialog open onOpenChange={() => setEditTag(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Tag</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <label className="text-sm font-medium">Finnish Name</label>
                <Input
                  value={editNameFi}
                  onChange={(e) => setEditNameFi(e.target.value)}
                  placeholder="Tag name in Finnish"
                />
              </div>
              <div>
                <label className="text-sm font-medium">English Name</label>
                <Input
                  value={editNameEn}
                  onChange={(e) => setEditNameEn(e.target.value)}
                  placeholder="Tag name in English"
                />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button variant="ghost" onClick={() => setEditTag(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdate}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default TagList;
