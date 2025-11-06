import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';
import CeritaFormBase from './CeritaFormBase';
import { type BreadcrumbItem } from '@/types';

const breadcrumbsBase: BreadcrumbItem[] = [
  { title: 'Cerita', href: '/cerita' }
];

export default function EditCerita() {
  const { item, overlays } = usePage().props as any;
  const breadcrumbs: BreadcrumbItem[] = [...breadcrumbsBase, { title: 'Edit', href: '#' }];
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={'Edit: ' + (item?.title || '')} />
      <CeritaFormBase 
        mode='edit' 
        item={item} 
        overlays={overlays || []}
      />
    </AppLayout>
  );
}
