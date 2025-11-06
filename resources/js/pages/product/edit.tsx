import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage, router } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import ProductFormBase from './ProductFormBase';

const breadcrumbsBase: BreadcrumbItem[] = [
  { title: 'Products', href: '/products' },
];

export default function EditProduct() {
  const { 
    item, 
    destinations, 
    overlays,
    activityLevels,
    priceRanges,
    visitTimes,
    selectedActivityLevelIds,
    selectedPriceRangeIds,
    selectedVisitTimeIds
  } = usePage().props as any;

  const breadcrumbs: BreadcrumbItem[] = [...breadcrumbsBase, { title: 'Edit', href: '#' }];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={'Edit: ' + (item?.title || '')} />
      <div className="max-w-full">
        <ProductFormBase 
          mode='edit' 
          item={item} 
          overlays={overlays || []} 
          destinations={destinations || []}
          activityLevels={activityLevels || []}
          priceRanges={priceRanges || []}
          visitTimes={visitTimes || []}
          selectedActivityLevelIds={selectedActivityLevelIds || []}
          selectedPriceRangeIds={selectedPriceRangeIds || []}
          selectedVisitTimeIds={selectedVisitTimeIds || []}
        />
      </div>
    </AppLayout>
  );
}
