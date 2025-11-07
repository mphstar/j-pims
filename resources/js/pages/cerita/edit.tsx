import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';
import CeritaFormBase from './CeritaFormBase';
import { type BreadcrumbItem } from '@/types';

const useBreadcrumbs = (item: any, pariwisata?: { id: number; title: string }) => {
  const arr: BreadcrumbItem[] = [];
  if (pariwisata?.id) {
    arr.push({ title: 'Pariwisata', href: route('pariwisata.index') });
    arr.push({ title: pariwisata.title, href: route('cerita.by-pariwisata', pariwisata.id) });
    arr.push({ title: 'Cerita', href: route('cerita.by-pariwisata', pariwisata.id) });
    arr.push({ title: item?.title || 'Edit', href: '#' });
  } else {
    arr.push({ title: 'Cerita', href: route('cerita.index') });
    arr.push({ title: item?.title || 'Edit', href: '#' });
  }
  return arr;
};

export default function EditCerita() {
  const { item, overlays, pariwisata } = usePage().props as any;
  const breadcrumbs = useBreadcrumbs(item, pariwisata as { id: number; title: string } | undefined);
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
