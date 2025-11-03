import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import ProductFormBase from './ProductFormBase';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Products', href: '/products' },
  { title: 'Tambah', href: '#' },
];

export default function CreateProduct() {
  const { destinations, selectedPariwisataId } = usePage().props as any;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Tambah Product" />
      <ProductFormBase mode='create' destinations={destinations || []} selectedPariwisataId={selectedPariwisataId || null} />
    </AppLayout>
  );
}
