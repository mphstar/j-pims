import React, { useEffect } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface Props {
  item?: any | null;
  mode: 'create' | 'edit';
}

const defaultValues = {
  type: 'activity',
  key: '',
  label: '',
  sort: 0,
  active: true,
};

export default function PreferenceValueForm({ item, mode }: Props) {
  const editing = mode === 'edit' && !!item;
  const { data, setData, processing, errors } = useForm({ ...defaultValues });

  useEffect(() => {
    if (editing) {
      setData({ ...defaultValues, ...item });
    }
  }, [editing, item]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const routeName = editing ? 'preferences.update' : 'preferences.store';
    const url = editing ? route(routeName, item.id) : route(routeName);
    router.post(url, data, { preserveScroll: true });
  };

  return (
    <form onSubmit={onSubmit} className='space-y-4'>
      <div className='space-y-2'>
        <Label className='text-sm font-medium'>Type</Label>
        <select value={data.type as any} onChange={e => setData('type' as any, e.target.value)} className='border rounded h-9 px-3 text-sm bg-background w-full'>
          <option value='activity'>Activity</option>
          <option value='price'>Price</option>
          <option value='season'>Season</option>
          <option value='label'>Label</option>
        </select>
        {errors.type && <p className='text-xs text-red-500'>{errors.type as any}</p>}
      </div>
      <div className='space-y-2'>
        <Label className='text-sm font-medium'>Key</Label>
        <Input value={data.key as any} onChange={e => setData('key' as any, e.target.value)} />
        {errors.key && <p className='text-xs text-red-500'>{errors.key as any}</p>}
      </div>
      <div className='space-y-2'>
        <Label className='text-sm font-medium'>Label</Label>
        <Input value={data.label as any} onChange={e => setData('label' as any, e.target.value)} />
        {errors.label && <p className='text-xs text-red-500'>{errors.label as any}</p>}
      </div>
      <div className='flex gap-3'>
        <div className='space-y-2 flex-1'>
          <Label className='text-sm font-medium'>Sort</Label>
          <Input type='number' value={data.sort as any} onChange={e => setData('sort' as any, Number(e.target.value))} />
        </div>
        <div className='space-y-2'>
          <Label className='text-sm font-medium'>Active</Label>
          <div className='flex items-center h-9'>
            <input id='active' type='checkbox' checked={data.active as any} onChange={e => setData('active' as any, e.target.checked)} className='h-4 w-4' />
          </div>
        </div>
      </div>
      <div className='flex gap-2'>
        <Button type='button' variant='outline' onClick={() => router.visit(route('preferences.index'))}>Kembali</Button>
        <Button type='submit' disabled={processing}>{processing ? 'Menyimpan...' : 'Simpan'}</Button>
      </div>
    </form>
  );
}
