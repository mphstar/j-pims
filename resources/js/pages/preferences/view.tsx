import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

export default function PreferenceValuesView() {
  const { data } = usePage().props as any;
  return (
    <AppLayout breadcrumbs={[{ title: 'Preferences', href: '/preferences' }]}> 
      <Head title='Preference Values' />
      <div className='flex items-center justify-between mb-4'>
        <h1 className='text-xl font-semibold'>Preference Values</h1>
        <Button onClick={() => router.visit(route('preferences.create'))}>Tambah</Button>
      </div>
      <div className='border rounded overflow-hidden'>
        <table className='w-full text-sm'>
          <thead className='bg-muted text-left'>
            <tr>
              <th className='px-3 py-2'>Type</th>
              <th className='px-3 py-2'>Key</th>
              <th className='px-3 py-2'>Label</th>
              <th className='px-3 py-2'>Sort</th>
              <th className='px-3 py-2'>Active</th>
              <th className='px-3 py-2 text-right'>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((row: any) => (
              <tr key={row.id} className='border-t'>
                <td className='px-3 py-2 capitalize'>{row.type}</td>
                <td className='px-3 py-2'>{row.key}</td>
                <td className='px-3 py-2'>{row.label}</td>
                <td className='px-3 py-2'>{row.sort}</td>
                <td className='px-3 py-2'>{row.active ? 'Yes' : 'No'}</td>
                <td className='px-3 py-2 text-right'>
                  <Button size='sm' variant='outline' onClick={() => router.visit(route('preferences.edit', row.id))}>Edit</Button>
                </td>
              </tr>
            ))}
            {(!data || data.length === 0) && (
              <tr><td className='px-3 py-4 text-center text-muted-foreground' colSpan={6}>Belum ada data</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
}
