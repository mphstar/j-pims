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
  const { item, destinations, overlays, metadata } = usePage().props as any;

  const breadcrumbs: BreadcrumbItem[] = [...breadcrumbsBase, { title: 'Edit', href: '#' }];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={'Edit: ' + (item?.title || '')} />
      <div className="max-w-full">
        <ProductFormBase mode='edit' item={item} overlays={overlays || []} destinations={destinations || []} metadata={metadata} />
      </div>
    </AppLayout>
  );
}
