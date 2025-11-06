import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';
import PreferenceValueForm from './PreferenceValueForm';

export default function EditPreferenceValue() {
  const { item } = usePage().props as any;
  return (
    <AppLayout breadcrumbs={[{ title: 'Preferences', href: '/preferences' }, { title: 'Edit', href: '#' }]}> 
      <Head title={'Edit: ' + (item?.label || '')} />
      <h1 className='text-xl font-semibold mb-4'>Edit Preference</h1>
      <PreferenceValueForm mode='edit' item={item} />
    </AppLayout>
  );
}
