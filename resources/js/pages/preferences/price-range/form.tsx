import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import useProductStore from '@/stores/useProduct';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';

const FormDialog = () => {
    const context = useProductStore();

    const { data, setData, post, processing, errors, reset } = useForm({
        id: context.currentRow?.id ?? 0,
        icon: context.currentRow?.icon ?? '',
        title: context.currentRow?.title ?? '',
        subtitle: context.currentRow?.subtitle ?? '',
    });

    useEffect(() => {
        if (context.open) {
            if (context.dialog === 'update' && context.currentRow) {
                setData({
                    id: context.currentRow.id,
                    icon: context.currentRow.icon || '',
                    title: context.currentRow.title || '',
                    subtitle: context.currentRow.subtitle || '',
                });
            } else if (context.dialog === 'create') {
                setData({
                    id: 0,
                    icon: '',
                    title: '',
                    subtitle: '',
                });
            }
        }
    }, [context.open, context.dialog]);

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (context.dialog == 'create') {
            
            post(route('preference-price-ranges.store'), {
                onSuccess: () => {
                    handleClose();

                    toast({
                        title: 'Success',
                        description: 'Price range created successfully',
                    });
                },
                onError: (errors) => {
                    toast({
                        title: 'Error',
                        description: 'Cek kembali data yang anda masukkan',
                    });
                },
            });
        } else {
            post(route('preference-price-ranges.update'), {
                onSuccess: () => {
                    handleClose();

                    toast({
                        title: 'Success',
                        description: 'Price range updated successfully',
                    });
                },
                onError: (errors) => {
                    toast({
                        title: 'Error',
                        description: 'Cek kembali data yang anda masukkan',
                    });
                },
            });
        }
    };

    const handleClose = () => {
        reset();
        context.setCurrentRow({});
        context.setOpen(false);
    };

    return (
        <Dialog
            open={context.open}
            onOpenChange={(state) => {
                if (!state) {
                    handleClose();
                }
            }}
            modal={true}
        >
            <DialogContent className="sm:max-w-lg">
                <DialogHeader className="text-left">
                    <DialogTitle>{`${context.dialog == 'create' ? 'Add' : 'Update'} Price Range`}</DialogTitle>
                    <DialogDescription>
                        {`${context.dialog == 'create' ? 'Create new' : 'Update'} price range here. `}
                        Click save when you&apos;re done.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="-mr-4 h-[26.25rem] w-full py-1 pr-4">
                    <form id="price-range-form" onSubmit={onSubmit} className="space-y-4 p-0.5">
                        <div className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                            <Label className="col-span-2 text-right">Icon</Label>
                            <Input
                                value={data.icon}
                                onChange={(e) => {
                                    setData('icon', e.target.value);
                                }}
                                placeholder="💸"
                                className="col-span-4"
                            />
                            <div className="col-span-6">
                                <InputError message={errors.icon} />
                            </div>
                        </div>
                        <div className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                            <Label className="col-span-2 text-right">Title</Label>
                            <Input
                                value={data.title}
                                onChange={(e) => {
                                    setData('title', e.target.value);
                                }}
                                placeholder="Hemat"
                                className="col-span-4"
                            />
                            <div className="col-span-6">
                                <InputError message={errors.title} />
                            </div>
                        </div>
                        <div className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                            <Label className="col-span-2 text-right">Subtitle</Label>
                            <Input
                                value={data.subtitle}
                                onChange={(e) => {
                                    setData('subtitle', e.target.value);
                                }}
                                placeholder="Budget friendly"
                                className="col-span-4"
                            />
                            <div className="col-span-6">
                                <InputError message={errors.subtitle} />
                            </div>
                        </div>
                    </form>
                </ScrollArea>
                <DialogFooter>
                    <Button disabled={processing} form="price-range-form" type="submit">
                        Save changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default FormDialog;
