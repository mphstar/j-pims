import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { ProductType, columns } from './columns';
import { router } from '@inertiajs/react';
import { DataTable } from './data-table';

export default function ProductList() {
  const { data, pariwisata } = usePage().props as unknown as { data: ProductType[]; pariwisata?: { id: number; title: string; slug: string } };
  const breadcrumbs: BreadcrumbItem[] = pariwisata
    ? [
        { title: 'Pariwisata', href: route('pariwisata.index') },
        { title: pariwisata.title, href: route('pariwisata.edit', pariwisata.id) },
        { title: 'Products', href: route('product.by-pariwisata', pariwisata.id) }
      ]
    : [ { title: 'Products', href: route('product.index') } ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={pariwisata ? `Products • ${pariwisata.title}` : 'Products'} />
      <div className="flex h-full w-full flex-col gap-4 rounded-xl p-4">
        <div className="mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{pariwisata ? `Products • ${pariwisata.title}` : 'Products'}</h2>
            <p className="text-muted-foreground">Kelola produk untuk {pariwisata ? `destinasi ini` : 'setiap destinasi'}.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => router.visit(pariwisata ? route('product.create-for-pariwisata', pariwisata.id) : route('product.create'))} className="space-x-1">
              <span>Create</span>
              <Plus size={18} />
            </Button>
          </div>
        </div>
        <DataTable columns={columns} data={data} />
      </div>
    </AppLayout>
  );
}
