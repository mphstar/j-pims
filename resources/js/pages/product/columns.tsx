import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import useProductStore from '@/stores/useProduct';
import { router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

export type ProductType = {
  id: number;
  pariwisata_id: number;
  pariwisata?: { id: number; title: string; slug: string };
  title: string;
  label: string | null;
  subtitle: string | null;
  slug: string;
  content: string | null;
  background_url: string | null;
  cta_href: string | null;
  cta_label: string | null;
  align: 'left' | 'right';
  created_at: string;
};

const onDelete = (id: number) => {
  router.post(
    route('product.destroy', id),
    {},
    {
      onSuccess: () => {
        toast.success('Deleted!', { description: 'Product telah dihapus.' });
      },
      onError: () => {
        toast.error('Error!', { description: 'Gagal menghapus data.' });
      },
    },
  );
};

export const columns: ColumnDef<ProductType>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  { id: 'rowNumber', header: '#', cell: ({ row }) => row.index + 1 },
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="flex items-center gap-2">
        Title
        <ArrowUpDown className="h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: 'pariwisata.title',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="flex items-center gap-2">
        Destinasi
        <ArrowUpDown className="h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <span>{row.original.pariwisata?.title || '-'}</span>,
  },
  {
    accessorKey: 'label',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="flex items-center gap-2">
        Label
        <ArrowUpDown className="h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: 'slug',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="flex items-center gap-2">
        Slug
        <ArrowUpDown className="h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: 'align',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="flex items-center gap-2">
        Align
        <ArrowUpDown className="h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: 'created_at',
    header: 'Created At',
    cell: ({ cell }) => {
      const date = new Date(cell.getValue<string>());
      return <span>{date.toLocaleDateString('id-ID')}</span>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const item = row.original;
      const store = useProductStore();
      const [deleteOpen, setDeleteOpen] = React.useState(false);
      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onSelect={() => router.visit(route('product.edit', item.id))}>Edit Data</DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  if (store.open) store.setOpen(false);
                  requestAnimationFrame(() => setDeleteOpen(true));
                }}
              >
                Hapus Data
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <AlertDialogContent onOpenAutoFocus={(e) => { e.preventDefault(); }} onCloseAutoFocus={(e) => { e.preventDefault(); }}>
              <AlertDialogHeader>
                <AlertDialogTitle>Hapus Data?</AlertDialogTitle>
                <AlertDialogDescription>Tindakan ini tidak dapat dibatalkan dan akan menghapus data beserta file terkait.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setDeleteOpen(false)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => { onDelete(item.id); setDeleteOpen(false); }}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      );
    },
  },
];
