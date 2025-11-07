import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage, router } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import ProductFormBase from './ProductFormBase';

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
    selectedVisitTimeIds,
    pariwisata
  } = usePage().props as any;
  const breadcrumbs: BreadcrumbItem[] = pariwisata
    ? [
        { title: 'Pariwisata', href: route('pariwisata.index') },
        { title: pariwisata.title, href: route('pariwisata.edit', pariwisata.id) },
        { title: 'Products', href: route('product.by-pariwisata', pariwisata.id) },
        { title: item?.title || 'Edit', href: '#' }
      ]
    : [
        { title: 'Products', href: route('product.index') },
        { title: item?.title || 'Edit', href: '#' }
      ];

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
