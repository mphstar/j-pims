import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import ProductFormBase from './ProductFormBase';

export default function CreateProduct() {
  const { 
    destinations, 
    selectedPariwisataId,
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
        { title: 'Tambah', href: '#' }
      ]
    : [
        { title: 'Products', href: route('product.index') },
        { title: 'Tambah', href: '#' }
      ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Tambah Product" />
      <ProductFormBase 
        mode='create' 
        destinations={destinations || []} 
        selectedPariwisataId={selectedPariwisataId || null}
        activityLevels={activityLevels || []}
        priceRanges={priceRanges || []}
        visitTimes={visitTimes || []}
        selectedActivityLevelIds={selectedActivityLevelIds || []}
        selectedPriceRangeIds={selectedPriceRangeIds || []}
        selectedVisitTimeIds={selectedVisitTimeIds || []}
      />
    </AppLayout>
  );
}
