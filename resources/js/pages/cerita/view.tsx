import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import useProductStore from '@/stores/useProduct';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { CeritaType, columns } from './columns';
import { router } from '@inertiajs/react';
import { DataTable } from './data-table';

const useBreadcrumbs = (pariwisata?: { id: number; title: string }) => {
    const items: BreadcrumbItem[] = [];
    if (pariwisata?.id) {
        items.push({ title: 'Pariwisata', href: route('pariwisata.index') });
        items.push({ title: pariwisata.title, href: route('cerita.by-pariwisata', pariwisata.id) });
        items.push({ title: 'Cerita', href: '#' });
    } else {
        items.push({ title: 'Cerita', href: route('cerita.index') });
    }
    return items;
};

export default function CeritaView() {
    const store = useProductStore();
    const { items, pariwisata } = usePage().props as unknown as { items: CeritaType[]; pariwisata?: { id: number; title: string; slug: string } };
    const breadcrumbs = useBreadcrumbs(pariwisata);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={pariwisata ? `Cerita • ${pariwisata.title}` : 'Cerita'} />
            <div className="flex h-full w-full flex-col gap-4 rounded-xl p-4">
                <div className="mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Cerita</h2>
                        <p className="text-muted-foreground">
                            {pariwisata ? (
                                <>Kelola semua cerita untuk "{pariwisata.title}"</>
                            ) : (
                                <>Kelola semua cerita di sini!</>
                            )}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={() => router.visit(pariwisata ? route('cerita.create-for-pariwisata', pariwisata.id) : route('cerita.create'))} className="space-x-1">
                            <span>Create</span> <Plus size={18} />
                        </Button>
                    </div>
                </div>
                <DataTable columns={columns} data={items} />
            </div>
        </AppLayout>
    );
}
