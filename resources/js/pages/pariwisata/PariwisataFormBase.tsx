import React, { useEffect, useMemo, useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';

interface OverlayType {
    id: number;
    overlay_url: string;
    position_horizontal: 'left' | 'center' | 'right' | null;
    position_vertical: 'top' | 'center' | 'bottom' | null;
    object_fit: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down' | 'crop' | null;
    width?: number | null;
    height?: number | null;
    __file?: File;
    __unsaved?: boolean;
    __deleted?: boolean;
    __dirty?: boolean;
}

interface MetadataType {
    id?: number;
    activity_level?: 'easy' | 'moderate' | 'challenging' | null;
    price_range?: 'budget' | 'moderate' | 'expensive' | 'luxury' | null;
    best_season?: string | null;
    tags?: string[] | null;
    duration_hours?: number | null;
    target_age_group?: string[] | null;
    facilities?: string[] | null;
    accessibility?: 'wheelchair_friendly' | 'child_friendly' | 'elderly_friendly' | 'all_accessible' | null;
}

interface Props {
    item?: any | null;
    mode: 'create' | 'edit';
    overlays?: OverlayType[];
    metadata?: MetadataType | null;
}

const defaultValues = {
    title: '',
    label: '',
    subtitle: '',
    slug: '',
    content: '',
    background_url: '',
    cta_href: '',
    cta_label: '',
    align: 'left'
};

export default function PariwisataFormBase({ item, mode, overlays = [], metadata = null }: Props) {
    const editing = mode === 'edit' && !!item;
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

    const { data, setData, processing, errors, clearErrors } = useForm<{ [K in keyof typeof defaultValues]: (typeof defaultValues)[K] } & { background_image?: File | null }>({ ...defaultValues, background_image: null });
    const [bgPreview, setBgPreview] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [uploadingBg, setUploadingBg] = useState(false);
    const [bgError, setBgError] = useState<string | null>(null);
    
    // Metadata state
    const [metadataData, setMetadataData] = useState<MetadataType>({
        activity_level: metadata?.activity_level || null,
        price_range: metadata?.price_range || null,
        best_season: metadata?.best_season || null,
        tags: metadata?.tags || [],
        duration_hours: metadata?.duration_hours || null,
        target_age_group: metadata?.target_age_group || [],
        facilities: metadata?.facilities || [],
        accessibility: metadata?.accessibility || null,
    });
    const [savingMetadata, setSavingMetadata] = useState(false);
    const [tagsInput, setTagsInput] = useState('');
    const [ageGroupInput, setAgeGroupInput] = useState('');
    const [facilitiesInput, setFacilitiesInput] = useState('');
    
    // Overlays state
    const [overlayList, setOverlayList] = useState<OverlayType[]>(overlays.map(o => ({ ...o, __dirty: false })));
    // overlay editor now inline (no dialog)
    const [addingOverlay, setAddingOverlay] = useState(false);
    const [overlayUploadError, setOverlayUploadError] = useState<string | null>(null);
    const [draggingId, setDraggingId] = useState<number | null>(null);
    const [savingPositions, setSavingPositions] = useState(false);
    const overlayContainerRef = useState<HTMLDivElement | null>(null)[0];
    const [activeOverlayId, setActiveOverlayId] = useState<number | null>(null);
    const [overlayPanelOpen, setOverlayPanelOpen] = useState(true);

    // Sync overlays from props after Inertia responses
    useEffect(() => {
        setOverlayList(overlays.map(o => ({ ...o, __dirty: false })));
    }, [overlays.map(o => o.id).join(','), overlays.length]);

    // Helper: wrap router.post in a promise for sequential batch operations
    const inertiaPost = (url: string, data: any, options: any = {}) => new Promise<void>((resolve, reject) => {
        router.post(url, data, {
            preserveScroll: true,
            ...options,
            onSuccess: () => { options.onSuccess?.(); resolve(); },
            onError: (errors: any) => { options.onError?.(errors); reject(errors); }
        });
    });

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 1024); // < lg
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    useEffect(() => {
        if (editing) {
            setData({ ...defaultValues, ...item });
        }
    }, [editing, item]);

    useEffect(() => {
        if (!editing) {
            setData({ ...defaultValues });
        }
    }, [mode]);

    useEffect(() => {
        if (!slugManuallyEdited) {
            const s = data.title
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .trim()
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-');
            setData('slug', s);
        }
    }, [data.title, slugManuallyEdited]);

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        clearErrors();
        const routeName = editing ? 'pariwisata.update' : 'pariwisata.store';
        const url = editing ? route(routeName, item.id) : route(routeName);
        // Use FormData if file present
        let submitData: any = data;
        let options: any = {};
        if (data.background_image) {
            const fd = new FormData();
            Object.entries(data).forEach(([k, v]) => {
                if (k === 'background_image') return; // add below
                fd.append(k, v as any ?? '');
            });
            fd.append('background_image', data.background_image);
            submitData = fd;
            options.forceFormData = true;
        }
        router.post(url, submitData, {
            onSuccess: () => {
                toast.success(editing ? 'Data updated' : 'Data created');
                // Jangan paksa ke index; biarkan redirect dari server (store -> edit) agar bisa lanjut tambah overlay.
            },
            onError: () => {
                toast.error('Gagal menyimpan');
            },
            ...options
        });
    };

    const dirtyRef = React.useRef<Set<number>>(new Set());

    const uploadOverlay = (file: File) => {
        setOverlayUploadError(null);
        if (!item?.id) {
            setOverlayUploadError('Item belum tersimpan. Simpan dulu sebelum tambah overlay.');
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            setOverlayUploadError('Ukuran maksimal 2MB');
            return;
        }
        const blobUrl = URL.createObjectURL(file);
        setOverlayList(prev => [...prev, {
            id: -Date.now(),
            overlay_url: blobUrl,
            position_horizontal: null,
            position_vertical: null,
            object_fit: null,
            width: null,
            height: null,
            __file: file,
            __unsaved: true,
            __dirty: true
        }]);
        toast.info('Overlay ditambahkan (belum disimpan)');
    };

    const deleteOverlay = (id: number) => {
        const target = overlayList.find(o => o.id === id);
        if (!target) return;
        // Unsaved local overlay: just remove
        if (target.__unsaved) {
            setOverlayList(prev => prev.filter(o => o.id !== id));
            if (activeOverlayId === id) setActiveOverlayId(null);
            toast.success('Overlay lokal dibuang');
            return;
        }
        // Existing overlay: optimistic remove then Inertia request
        const snapshot = overlayList;
        setOverlayList(prev => prev.filter(o => o.id !== id));
        if (activeOverlayId === id) setActiveOverlayId(null);
        router.post(route('pariwisata.overlays.delete', id), {}, {
            preserveScroll: true,
            onSuccess: () => toast.success('Overlay dihapus'),
            onError: () => {
                toast.error('Gagal hapus overlay');
                // revert
                setOverlayList(snapshot);
            }
        });
    };

    const updateOverlayLocal = (id: number, partial: Partial<OverlayType>) => {
        setOverlayList(prev => prev.map(o => o.id === id ? { ...o, ...partial, __dirty: true } : o));
        dirtyRef.current.add(id);
    };

    const handleOverlayDragEnd = (id: number) => {
        // Only mark dirty; actual save deferred until Save or Simpan Semua
        if (!dirtyRef.current.has(id)) return;
        toast.message?.('Posisi diubah (belum disimpan)');
    };

    const saveOverlay = async (id: number) => {
        const overlay = overlayList.find(o => o.id === id);
        if (!overlay) return;
        if (overlay.__deleted) {
            // process delete only for existing overlay
            if (overlay.id > 0) {
                        router.post(route('pariwisata.overlays.delete', overlay.id), {}, {
                            onError: () => toast.error('Gagal hapus overlay'),
                            onSuccess: () => { toast.success('Overlay dihapus'); },
                            preserveScroll: true,
                        });
            }
            setOverlayList(prev => prev.filter(o => o.id !== id)); // local immediate feedback; server will refresh props
            return;
        }
        if (overlay.__unsaved) {
            // create new
            const formData = new FormData();
            formData.append('overlay', overlay.__file as File);
            if (overlay.position_horizontal) formData.append('position_horizontal', overlay.position_horizontal);
            if (overlay.position_vertical) formData.append('position_vertical', overlay.position_vertical);
            if (overlay.object_fit) formData.append('object_fit', overlay.object_fit);
            if (overlay.width) formData.append('width', overlay.width.toString());
            if (overlay.height) formData.append('height', overlay.height.toString());
                    router.post(route('pariwisata.overlays.store', item.id), formData, {
                        onError: () => toast.error('Gagal simpan overlay baru'),
                        onSuccess: () => toast.success('Overlay dibuat'),
                        preserveScroll: true,
                        forceFormData: true,
                    });
            // optimistic local reset (actual overlay data will re-sync when page props refresh)
            setOverlayList(prev => prev.map(o => o.id === overlay.id ? { ...o, __unsaved: false, __dirty: false } : o));
            dirtyRef.current.delete(id);
        } else if (overlay.__dirty) {
                    router.post(route('pariwisata.overlays.update', overlay.id), {
                position_horizontal: overlay.position_horizontal,
                position_vertical: overlay.position_vertical,
                object_fit: overlay.object_fit,
                width: overlay.width,
                height: overlay.height
            }, {
                        onError: () => toast.error('Gagal update overlay'),
                        onSuccess: () => toast.success('Overlay disimpan'),
                        preserveScroll: true,
            });
            setOverlayList(prev => prev.map(o => o.id === overlay.id ? { ...o, __dirty: false } : o));
            dirtyRef.current.delete(id);
        } else {
            toast.info('Tidak ada perubahan');
        }
    };

    const saveAllPositions = async () => {
        const creations = overlayList.filter(o => o.__unsaved);
        const updates = overlayList.filter(o => !o.__unsaved && o.__dirty);
        if (creations.length === 0 && updates.length === 0) {
            toast.info('Tidak ada perubahan');
            return;
        }
        setSavingPositions(true);
        try {
            for (const c of creations) {
                if (!c.__file) continue;
                const formData = new FormData();
                formData.append('overlay', c.__file);
                if (c.position_horizontal) formData.append('position_horizontal', c.position_horizontal);
                if (c.position_vertical) formData.append('position_vertical', c.position_vertical);
                if (c.object_fit) formData.append('object_fit', c.object_fit);
                if (c.width) formData.append('width', c.width.toString());
                if (c.height) formData.append('height', c.height.toString());
                await inertiaPost(route('pariwisata.overlays.store', item.id), formData, { forceFormData: true, onError: () => toast.error('Gagal simpan overlay baru') }).then(() => {
                    dirtyRef.current.delete(c.id);
                    setOverlayList(prev => prev.map(o => o.id === c.id ? { ...o, __unsaved: false, __dirty: false } : o));
                }).catch(() => { });
            }
            for (const u of updates) {
                await inertiaPost(route('pariwisata.overlays.update', u.id), {
                    position_horizontal: u.position_horizontal,
                    position_vertical: u.position_vertical,
                    object_fit: u.object_fit,
                    width: u.width,
                    height: u.height
                }, { onError: () => toast.error('Gagal update overlay #' + u.id) }).then(() => {
                    dirtyRef.current.delete(u.id);
                    setOverlayList(prev => prev.map(o => o.id === u.id ? { ...o, __dirty: false } : o));
                }).catch(() => { });
            }
            toast.success('Perubahan disimpan');
        } catch (e) {
            toast.error('Gagal menyimpan batch');
        } finally {
            setSavingPositions(false);
        }
    };

    const saveMetadata = () => {
        if (!editing || !item?.id) {
            toast.error('Simpan destinasi dulu sebelum menambahkan metadata');
            return;
        }
        
        setSavingMetadata(true);
        router.post(route('pariwisata.metadata.store', item.id), metadataData as any, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Metadata tersimpan');
            },
            onError: () => {
                toast.error('Gagal menyimpan metadata');
            },
            onFinish: () => {
                setSavingMetadata(false);
            }
        });
    };

    const addTag = () => {
        if (tagsInput.trim()) {
            setMetadataData(prev => ({
                ...prev,
                tags: [...(prev.tags || []), tagsInput.trim()]
            }));
            setTagsInput('');
        }
    };

    const removeTag = (index: number) => {
        setMetadataData(prev => ({
            ...prev,
            tags: (prev.tags || []).filter((_, i) => i !== index)
        }));
    };

    const addAgeGroup = () => {
        if (ageGroupInput.trim()) {
            setMetadataData(prev => ({
                ...prev,
                target_age_group: [...(prev.target_age_group || []), ageGroupInput.trim()]
            }));
            setAgeGroupInput('');
        }
    };

    const removeAgeGroup = (index: number) => {
        setMetadataData(prev => ({
            ...prev,
            target_age_group: (prev.target_age_group || []).filter((_, i) => i !== index)
        }));
    };

    const addFacility = () => {
        if (facilitiesInput.trim()) {
            setMetadataData(prev => ({
                ...prev,
                facilities: [...(prev.facilities || []), facilitiesInput.trim()]
            }));
            setFacilitiesInput('');
        }
    };

    const removeFacility = (index: number) => {
        setMetadataData(prev => ({
            ...prev,
            facilities: (prev.facilities || []).filter((_, i) => i !== index)
        }));
    };

    const preview = useMemo(() => {
        return (
            <div className='relative w-full h-screen snap-start flex items-center justify-center overflow-hidden bg-muted'>
                <div className={cn(
                    'relative w-full h-full flex flex-col justify-center px-10 overflow-hidden transition-colors',
                    data.align === 'left' ? 'items-start text-left' : 'items-end text-right'
                )} style={{
                    backgroundImage: (bgPreview || data.background_url) ? `url(${bgPreview || data.background_url})` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}>
                    <div className='max-w-xl p-6 rounded-md text-white space-y-3 z-10 relative'>
                        {data.label && <span className='text-xs uppercase tracking-wider bg-white/20 px-2 py-1 rounded'>{data.label}</span>}
                        <h1 className='text-7xl font-extrabold leading-none'>{data.title || 'Judul Belum Diisi'}</h1>
                        {data.subtitle && <h2 className='text-lg opacity-80'>{data.subtitle}</h2>}
                        {data.content && <p className='text-sm leading-relaxed whitespace-pre-line'>{data.content}</p>}
                        {(data.cta_label || data.cta_href) && (
                            <a href={data.cta_href || '#'} className='inline-block bg-transparent border-[2px] mt-3 border-white px-4 py-2 rounded shadow hover:opacity-90 transition'>
                                {data.cta_label || 'Lanjut'}
                            </a>
                        )}
                    </div>
                    {editing && (
                        <div className='pointer-events-none absolute inset-0'>
                            {overlayList.map(o => (
                                <OverlayAligned key={o.id} overlay={o} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        )
    }, [data, bgPreview, overlayList, editing]);

    return (
        <div className='flex h-full w-full flex-col'>
            <div className='border-b px-4 lg:px-6 py-4 flex flex-wrap gap-3 items-center justify-between bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
                <div className='min-w-[200px]'>
                    <h1 className='text-lg lg:text-xl font-semibold'>{editing ? 'Edit Pariwisata' : 'Tambah Pariwisata'}</h1>
                    <p className='text-[11px] lg:text-xs text-muted-foreground'>Form + live preview (mobile pakai dialog).</p>
                </div>
                <div className='flex gap-2 ml-auto'>
                    {isMobile && (
                        <Button type='button' variant='secondary' onClick={() => setPreviewOpen(true)}>Preview</Button>
                    )}
                    <Button variant='outline' type='button' onClick={() => router.visit(route('pariwisata.index'))}>Kembali</Button>
                    <Button type='submit' form='pariwisata-form' disabled={processing}>{processing ? 'Menyimpan...' : 'Simpan'}</Button>
                </div>
            </div>
            <div className={cn('flex flex-1 overflow-hidden', isMobile ? 'flex-col' : '')}>
                <form id='pariwisata-form' onSubmit={onSubmit} className={cn('shrink-0 overflow-y-auto border-r p-4 lg:p-6 space-y-4 bg-background', isMobile ? 'w-full border-r-0' : 'w-[430px]')}>
                    <div className='space-y-2'>
                        <Label className='text-sm font-medium required'>Title</Label>
                        <Input value={data.title} onChange={e => setData('title', e.target.value)} required />
                        {errors.title && <p className='text-xs text-red-500'>{errors.title}</p>}
                    </div>
                    <div className='space-y-2'>
                        <Label className='text-sm font-medium'>Slug</Label>
                        <Input value={data.slug} onChange={e => { setData('slug', e.target.value); setSlugManuallyEdited(true); }} />
                        {errors.slug && <p className='text-xs text-red-500'>{errors.slug}</p>}
                    </div>
                    <div className='space-y-2'>
                        <Label className='text-sm font-medium'>Label</Label>
                        <Input value={data.label} onChange={e => setData('label', e.target.value)} />
                    </div>
                    <div className='space-y-2'>
                        <Label className='text-sm font-medium'>Subtitle</Label>
                        <Input value={data.subtitle} onChange={e => setData('subtitle', e.target.value)} />
                    </div>
                    <div className='space-y-2'>
                        <Label className='text-sm font-medium'>Content</Label>
                        <Textarea value={data.content} rows={4} onChange={e => setData('content', e.target.value)} />
                    </div>
                    <div className='space-y-2'>
                        <Label className='text-sm font-medium'>Background Image</Label>
                        <Input type='file' accept='image/*' onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                                setData('background_image', file as any);
                                const blob = URL.createObjectURL(file);
                                setBgPreview(prev => { if (prev) URL.revokeObjectURL(prev); return blob; });
                            }
                        }} />
                        {(bgPreview || data.background_url) && (
                            <div className='relative group border rounded overflow-hidden w-full aspect-video mt-2'>
                                <img src={bgPreview || data.background_url} className='object-cover w-full h-full' />
                                <button type='button' onClick={() => { setBgPreview(null); setData('background_image', null as any); }} className='absolute top-1 right-1 text-[10px] bg-black/50 text-white px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition'>Clear</button>
                            </div>
                        )}
                        {!bgPreview && !data.background_url && <p className='text-xs text-muted-foreground'>Belum ada gambar.</p>}
                    </div>
                    <div className='flex gap-2'>
                        <div className='space-y-2 flex-1'>
                            <Label className='text-sm font-medium'>CTA Href</Label>
                            <Input value={data.cta_href} onChange={e => setData('cta_href', e.target.value)} />
                        </div>
                        <div className='space-y-2 flex-1'>
                            <Label className='text-sm font-medium'>CTA Label</Label>
                            <Input value={data.cta_label} onChange={e => setData('cta_label', e.target.value)} />
                        </div>
                    </div>
                    <div className='space-y-2'>
                        <Label className='text-sm font-medium'>Align</Label>
                        <select value={data.align} onChange={e => setData('align', e.target.value)} className='border rounded h-9 px-3 text-sm bg-background'>
                            <option value='left'>Left</option>
                            <option value='right'>Right</option>
                        </select>
                    </div>

                    <div className='space-y-4 pt-4 border-t'>
                        <div className='flex items-center justify-between'>
                            <h3 className='text-sm font-semibold'>Metadata Personalisasi</h3>
                            {editing && (
                                <Button type='button' size='sm' onClick={saveMetadata} disabled={savingMetadata}>
                                    {savingMetadata ? 'Menyimpan...' : 'Simpan Metadata'}
                                </Button>
                            )}
                        </div>
                        {!editing && (
                            <p className='text-xs text-muted-foreground'>Simpan destinasi dulu untuk bisa menyimpan metadata</p>
                        )}
                        
                        <div className='space-y-2'>
                            <Label className='text-sm font-medium'>Activity Level</Label>
                            <Select value={metadataData.activity_level || 'unset'} onValueChange={(val) => setMetadataData(prev => ({ ...prev, activity_level: val === 'unset' ? null : val as any }))}>
                                <SelectTrigger className='h-9'>
                                    <SelectValue placeholder='Pilih tingkat aktivitas' />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='unset'>-- Tidak diset --</SelectItem>
                                    <SelectItem value='easy'>Easy (Santai)</SelectItem>
                                    <SelectItem value='moderate'>Moderate (Sedang)</SelectItem>
                                    <SelectItem value='challenging'>Challenging (Menantang)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className='space-y-2'>
                            <Label className='text-sm font-medium'>Price Range</Label>
                            <Select value={metadataData.price_range || 'unset'} onValueChange={(val) => setMetadataData(prev => ({ ...prev, price_range: val === 'unset' ? null : val as any }))}>
                                <SelectTrigger className='h-9'>
                                    <SelectValue placeholder='Pilih rentang harga' />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='unset'>-- Tidak diset --</SelectItem>
                                    <SelectItem value='budget'>Budget (Hemat)</SelectItem>
                                    <SelectItem value='moderate'>Moderate (Menengah)</SelectItem>
                                    <SelectItem value='expensive'>Expensive (Mahal)</SelectItem>
                                    <SelectItem value='luxury'>Luxury (Mewah)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className='space-y-2'>
                            <Label className='text-sm font-medium'>Best Season</Label>
                            <Input 
                                value={metadataData.best_season || ''} 
                                onChange={e => setMetadataData(prev => ({ ...prev, best_season: e.target.value || null }))}
                                placeholder='e.g., Mei-Oktober, Musim Kemarau'
                            />
                            <p className='text-xs text-muted-foreground'>Waktu terbaik berkunjung</p>
                        </div>

                        <div className='space-y-2'>
                            <Label className='text-sm font-medium'>Duration (Jam)</Label>
                            <Input 
                                type='number' 
                                step='0.5'
                                value={metadataData.duration_hours || ''} 
                                onChange={e => setMetadataData(prev => ({ ...prev, duration_hours: e.target.value ? parseFloat(e.target.value) : null }))}
                                placeholder='e.g., 2.5'
                            />
                            <p className='text-xs text-muted-foreground'>Durasi ideal kunjungan dalam jam</p>
                        </div>

                        <div className='space-y-2'>
                            <Label className='text-sm font-medium'>Tags</Label>
                            <div className='flex gap-2'>
                                <Input 
                                    value={tagsInput} 
                                    onChange={e => setTagsInput(e.target.value)}
                                    onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                    placeholder='Tambah tag (Enter)'
                                />
                                <Button type='button' size='sm' onClick={addTag}>+</Button>
                            </div>
                            <div className='flex flex-wrap gap-1'>
                                {(metadataData.tags || []).map((tag, i) => (
                                    <span key={i} className='inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 rounded text-xs'>
                                        {tag}
                                        <button type='button' onClick={() => removeTag(i)} className='text-red-500 hover:text-red-700'>×</button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className='space-y-2'>
                            <Label className='text-sm font-medium'>Target Age Group</Label>
                            <div className='flex gap-2'>
                                <Input 
                                    value={ageGroupInput} 
                                    onChange={e => setAgeGroupInput(e.target.value)}
                                    onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addAgeGroup())}
                                    placeholder='e.g., children, adults (Enter)'
                                />
                                <Button type='button' size='sm' onClick={addAgeGroup}>+</Button>
                            </div>
                            <div className='flex flex-wrap gap-1'>
                                {(metadataData.target_age_group || []).map((group, i) => (
                                    <span key={i} className='inline-flex items-center gap-1 px-2 py-0.5 bg-secondary rounded text-xs'>
                                        {group}
                                        <button type='button' onClick={() => removeAgeGroup(i)} className='text-red-500 hover:text-red-700'>×</button>
                                    </span>
                                ))}
                            </div>
                            <p className='text-xs text-muted-foreground'>e.g., children, teens, adults, elderly</p>
                        </div>

                        <div className='pt-3 border-t'>
                            <p className='text-xs font-semibold text-muted-foreground mb-3'>Specific untuk Destinasi</p>
                            
                            <div className='space-y-2'>
                                <Label className='text-sm font-medium'>Facilities</Label>
                                <div className='flex gap-2'>
                                    <Input 
                                        value={facilitiesInput} 
                                        onChange={e => setFacilitiesInput(e.target.value)}
                                        onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addFacility())}
                                        placeholder='e.g., parking, toilet (Enter)'
                                    />
                                    <Button type='button' size='sm' onClick={addFacility}>+</Button>
                                </div>
                                <div className='flex flex-wrap gap-1'>
                                    {(metadataData.facilities || []).map((facility, i) => (
                                        <span key={i} className='inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 rounded text-xs'>
                                            {facility}
                                            <button type='button' onClick={() => removeFacility(i)} className='text-red-500 hover:text-red-700'>×</button>
                                        </span>
                                    ))}
                                </div>
                                <p className='text-xs text-muted-foreground'>e.g., parking, toilet, restaurant, wifi, ATM</p>
                            </div>

                            <div className='space-y-2 mt-3'>
                                <Label className='text-sm font-medium'>Accessibility</Label>
                                <Select value={metadataData.accessibility || 'unset'} onValueChange={(val) => setMetadataData(prev => ({ ...prev, accessibility: val === 'unset' ? null : val as any }))}>
                                    <SelectTrigger className='h-9'>
                                        <SelectValue placeholder='Pilih aksesibilitas' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='unset'>-- Tidak diset --</SelectItem>
                                        <SelectItem value='wheelchair_friendly'>Wheelchair Friendly</SelectItem>
                                        <SelectItem value='child_friendly'>Child Friendly</SelectItem>
                                        <SelectItem value='elderly_friendly'>Elderly Friendly</SelectItem>
                                        <SelectItem value='all_accessible'>All Accessible</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </form>
                {!isMobile && (
                    <div className='flex-1 h-full overflow-y-auto snap-y snap-mandatory bg-muted relative'>
                        {preview}
                        {editing && (
                            <div className={cn('absolute top-4 left-4 z-[200] transition-all', overlayPanelOpen ? 'w-64' : 'w-8')}>
                                <div className='bg-background/90 backdrop-blur border rounded shadow-sm overflow-hidden'>
                                    <div className='flex items-center justify-between px-2 h-8 border-b'>
                                        <span className='text-[11px] font-medium'>{overlayPanelOpen ? 'Overlays' : 'O'}</span>
                                        <div className='flex gap-1'>
                                            <Button size='sm' variant='ghost' className='h-6 px-2 text-[10px]' onClick={() => setOverlayPanelOpen(o => !o)}>{overlayPanelOpen ? '−' : '+'}</Button>
                                        </div>
                                    </div>
                                    {overlayPanelOpen && (
                                        <div className='p-2 space-y-3 max-h-[70vh] overflow-y-auto'>
                                            <div className='text-[10px] bg-muted/40 border rounded p-2 leading-snug'>
                                                <ul className='list-disc ml-4 space-y-1'>
                                                    <li>Upload gambar</li>
                                                    <li>Klik list → edit</li>
                                                    <li>Drag di area</li>
                                                    <li>Save satu / Simpan semua</li>
                                                </ul>
                                            </div>
                                            <div>
                                                <Label className='text-[10px] font-medium mb-1 block'>Tambah</Label>
                                                <Input type='file' accept='image/*' disabled={addingOverlay} onChange={e => { const file = e.target.files?.[0]; if (file) uploadOverlay(file); }} className='h-7 text-[10px] p-1' />
                                                {overlayUploadError && <p className='text-[10px] text-red-500 mt-1'>{overlayUploadError}</p>}
                                            </div>
                                            <div className='space-y-1'>
                                                <Label className='text-[10px] font-medium'>Daftar</Label>
                                                <div className='flex flex-col gap-1'>
                                                    {overlayList.map(o => (
                                                        <div key={o.id} onClick={() => setActiveOverlayId(o.id)} className={cn('group border rounded px-2 py-1 flex items-center gap-2 justify-between cursor-pointer', activeOverlayId === o.id ? 'bg-primary/10 ring-1 ring-primary' : 'bg-background/60')}>
                                                            <img src={o.overlay_url} className='w-6 h-6 object-contain' />
                                                            <span className='text-[10px]'>#{o.id}</span>
                                                            <Button size='icon' variant='ghost' className='h-5 w-5 ml-auto opacity-0 group-hover:opacity-100' onClick={(e) => { e.stopPropagation(); deleteOverlay(o.id); }}>
                                                                <span className='text-[10px]'>✕</span>
                                                            </Button>
                                                        </div>
                                                    ))}
                                                    {overlayList.length === 0 && <p className='text-[10px] text-muted-foreground'>Kosong</p>}
                                                </div>
                                            </div>
                                            {activeOverlayId && (() => {
                                                const ov = overlayList.find(o => o.id === activeOverlayId); if (!ov) return null; return (
                                                    <div className='space-y-2 border-t pt-2'>
                                                        <Label className='text-[10px] font-medium'>Detail #{ov.id}</Label>
                                                        <div className='grid gap-2'>
                                                            <div className='space-y-1'>
                                                                <Label className='text-[10px]'>Horizontal</Label>
                                                                <Select value={ov.position_horizontal ?? 'unset'} onValueChange={(val) => updateOverlayLocal(ov.id, { position_horizontal: val === 'unset' ? null : val as any })}>
                                                                    <SelectTrigger className='h-7 text-[10px] px-2'>
                                                                        <SelectValue placeholder='(none)' />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value='unset'>—</SelectItem>
                                                                        <SelectItem value='left'>left</SelectItem>
                                                                        <SelectItem value='center'>center</SelectItem>
                                                                        <SelectItem value='right'>right</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <div className='space-y-1'>
                                                                <Label className='text-[10px]'>Vertical</Label>
                                                                <Select value={ov.position_vertical ?? 'unset'} onValueChange={(val) => updateOverlayLocal(ov.id, { position_vertical: val === 'unset' ? null : val as any })}>
                                                                    <SelectTrigger className='h-7 text-[10px] px-2'>
                                                                        <SelectValue placeholder='(none)' />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value='unset'>—</SelectItem>
                                                                        <SelectItem value='top'>top</SelectItem>
                                                                        <SelectItem value='center'>center</SelectItem>
                                                                        <SelectItem value='bottom'>bottom</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <div className='space-y-1'>
                                                                <Label className='text-[10px]'>Object Fit</Label>
                                                                <Select value={ov.object_fit ?? 'unset'} onValueChange={(val) => updateOverlayLocal(ov.id, { object_fit: val === 'unset' ? null : val as any })}>
                                                                    <SelectTrigger className='h-7 text-[10px] px-2'>
                                                                        <SelectValue placeholder='(none)' />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value='unset'>—</SelectItem>
                                                                        <SelectItem value='contain'>contain</SelectItem>
                                                                        <SelectItem value='cover'>cover</SelectItem>
                                                                        <SelectItem value='fill'>fill</SelectItem>
                                                                        <SelectItem value='none'>none</SelectItem>
                                                                        <SelectItem value='scale-down'>scale-down</SelectItem>
                                                                        <SelectItem value='crop'>crop</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <div className='grid grid-cols-2 gap-2'>
                                                                <div className='space-y-1'>
                                                                    <Label className='text-[10px]'>Width (px)</Label>
                                                                    <Input
                                                                        type='number'
                                                                        min='1'
                                                                        value={ov.width ?? ''}
                                                                        onChange={(e) => updateOverlayLocal(ov.id, { width: e.target.value ? parseInt(e.target.value) : null })}
                                                                        className='h-7 text-[10px] px-2'
                                                                        placeholder='Auto'
                                                                    />
                                                                </div>
                                                                <div className='space-y-1'>
                                                                    <Label className='text-[10px]'>Height (px)</Label>
                                                                    <Input
                                                                        type='number'
                                                                        min='1'
                                                                        value={ov.height ?? ''}
                                                                        onChange={(e) => updateOverlayLocal(ov.id, { height: e.target.value ? parseInt(e.target.value) : null })}
                                                                        className='h-7 text-[10px] px-2'
                                                                        placeholder='Auto'
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className='flex gap-1 pt-1'>
                                                            <Button size='sm' variant='outline' onClick={() => saveOverlay(ov.id)} className='h-6 px-2 text-[10px]'>Save</Button>
                                                            <Button size='sm' variant='ghost' onClick={() => setActiveOverlayId(null)} className='h-6 px-2 text-[10px]'>Close</Button>
                                                        </div>
                                                    </div>
                                                )
                                            })()}
                                            <div>
                                                <Button size='sm' variant='secondary' disabled={savingPositions} onClick={saveAllPositions} className='h-6 text-[10px] w-full'>{savingPositions ? 'Saving...' : 'Simpan Semua'}</Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                <DialogContent className='max-w-full w-full h-[100vh] p-0 overflow-hidden'>
                    <DialogHeader className='px-4 pt-4 pb-2 text-left'>
                        <DialogTitle>Preview</DialogTitle>
                        <p className='text-xs text-muted-foreground'>Tampilan penuh section saat ini. Tutup untuk kembali mengedit.</p>
                    </DialogHeader>
                    <div className='flex flex-col h-[calc(100%-70px)]'>

                        <div className='flex-1 overflow-y-auto bg-muted'>
                            {preview}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            {/* overlay editor dialog removed (integrated inline) */}
        </div>
    );
}

interface OverlayDraggableProps {
    overlay: OverlayType;
    onChange: (partial: Partial<OverlayType>) => void;
    onDragStart: () => void;
    onDragEnd: () => void;
}

const OverlayAligned: React.FC<{ overlay: OverlayType }> = ({ overlay }) => {
    const style: React.CSSProperties = { position: 'absolute' };
    // Horizontal
    if (overlay.position_horizontal === 'left') {
        style.left = '0';
    } else if (overlay.position_horizontal === 'right') {
        style.right = '0';
    } else if (overlay.position_horizontal === 'center') {
        style.left = '50%';
    } else {
        // default center if nothing chosen (optional fallback visually)
        style.left = '50%';
    }
    // Vertical
    if (overlay.position_vertical === 'top') {
        style.top = '0';
    } else if (overlay.position_vertical === 'bottom') {
        style.bottom = '0';
    } else if (overlay.position_vertical === 'center') {
        style.top = '50%';
    } else {
        // default top
        style.top = '0';
    }
    // Translate adjustments if centered
    const translateX = overlay.position_horizontal === 'center' || overlay.position_horizontal == null ? '-50%' : '0';
    const translateY = overlay.position_vertical === 'center' ? '-50%' : '0';
    style.transform = `translate(${translateX}, ${translateY})`;
    
    // Size
    if (overlay.width) style.width = `${overlay.width}px`;
    if (overlay.height) style.height = `${overlay.height}px`;
    
    // Map custom 'crop' semantic to 'cover' for CSS object-fit
    const fit = overlay.object_fit === 'crop' ? 'cover' : (overlay.object_fit ?? 'contain');
    
    // Image styling
    const imgStyle: React.CSSProperties = {
        objectFit: fit,
        width: '100%',
        height: '100%'
    };
    
    // Fallback max size if no explicit size set
    const containerClass = overlay.width || overlay.height ? '' : 'max-w-[240px] max-h-[240px]';
    
    return (
        <div style={style} className={`select-none ${containerClass}`}>
            <img src={overlay.overlay_url} draggable={false} style={imgStyle} className='pointer-events-none' />
        </div>
    );
};

// Helper functions placed after component definition
// (Could refactor to custom hooks if grows larger)
