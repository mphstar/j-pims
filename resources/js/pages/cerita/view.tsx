import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import useProductStore from '@/stores/useProduct';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { CeritaType, columns } from './columns';
import { router } from '@inertiajs/react';
import { DataTable } from './data-table';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Cerita',
        href: '/cerita',
    },
];

export default function CeritaView() {
    const store = useProductStore();
    const { items } = usePage().props as unknown as { items: CeritaType[] };


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Cerita" />
            <div className="flex h-full w-full flex-col gap-4 rounded-xl p-4">
                <div className="mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Cerita</h2>
                        <p className="text-muted-foreground">Kelola semua cerita di sini!</p>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={() => router.visit(route('cerita.create'))} className="space-x-1">
                            <span>Create</span> <Plus size={18} />
                        </Button>
                    </div>
                </div>
                <DataTable columns={columns} data={items} />
            </div>
        </AppLayout>
    );
}
