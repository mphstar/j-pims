import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';
import CeritaFormBase from './CeritaFormBase';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Cerita', href: '/cerita' },
  { title: 'Tambah', href: '#' }
];

export default function CreateCerita() {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title='Tambah Cerita' />
      <CeritaFormBase 
        mode='create'
      />
    </AppLayout>
  );
}
