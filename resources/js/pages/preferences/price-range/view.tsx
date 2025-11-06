import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import useProductStore from '@/stores/useProduct';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { PriceRangeType, columns } from './columns';
import { DataTable } from './data-table';
import FormDialog from './form';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Preference Price Ranges',
        href: '/preference-price-ranges',
    },
];

export default function PreferencePriceRange() {
    const store = useProductStore();
    const { data } = usePage().props as unknown as { data: PriceRangeType[] };


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Preference Price Ranges" />
            <FormDialog />
            <div className="flex h-full w-full flex-col gap-4 rounded-xl p-4">
                <div className="mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Preference Price Ranges</h2>
                        <p className="text-muted-foreground">Manage price range preferences for tourism products</p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={() => {
                                store.setDialog('create');
                                store.setOpen(true);
                                store.setCurrentRow({})
                            }}
                            className="space-x-1"
                        >
                            <span>Create</span> <Plus size={18} />
                        </Button>
                    </div>
                </div>
                <DataTable columns={columns} data={data} />
            </div>
        </AppLayout>
    );
}
