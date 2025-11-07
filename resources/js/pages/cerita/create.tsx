import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';
import CeritaFormBase from './CeritaFormBase';
import { type BreadcrumbItem } from '@/types';

const useBreadcrumbs = (pariwisata?: { id: number; title: string }) => {
  const items: BreadcrumbItem[] = [];
  if (pariwisata?.id) {
    items.push({ title: 'Pariwisata', href: route('pariwisata.index') });
    items.push({ title: pariwisata.title, href: route('cerita.by-pariwisata', pariwisata.id) });
    items.push({ title: 'Cerita', href: route('cerita.by-pariwisata', pariwisata.id) });
    items.push({ title: 'Tambah', href: '#' });
  } else {
    items.push({ title: 'Cerita', href: route('cerita.index') });
    items.push({ title: 'Tambah', href: '#' });
  }
  return items;
};

export default function CreateCerita() {
  const { pariwisata } = usePage().props as any;
  const breadcrumbs = useBreadcrumbs(pariwisata as { id: number; title: string } | undefined);
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title='Tambah Cerita' />
      <CeritaFormBase 
        mode='create'
      />
    </AppLayout>
  );
}
