import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import PreferenceValueForm from './PreferenceValueForm';

export default function CreatePreferenceValue() {
  return (
    <AppLayout breadcrumbs={[{ title: 'Preferences', href: '/preferences' }, { title: 'Create', href: '#' }]}> 
      <Head title='Create Preference' />
      <h1 className='text-xl font-semibold mb-4'>Tambah Preference</h1>
      <PreferenceValueForm mode='create' item={null} />
    </AppLayout>
  );
}
