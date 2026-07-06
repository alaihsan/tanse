import { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Trash2, Edit, Plus, Scale, Search, Eye, AlertTriangle } from 'lucide-react';

interface Pasal {
    id: number;
    name: string;
    ayat: string | null;
    sub_ayat: string | null;
    deskripsi_ayat: string | null;
    description: string | null;
    keterangan: string | null;
    level: 'ringan' | 'sedang' | 'berat';
    sanction: string;
}

interface Props {
    pasals: Pasal[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Kelola Pasal',
        href: '/pasals',
    },
];

export default function PasalsIndex({ pasals }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [editingPasal, setEditingPasal] = useState<Pasal | null>(null);
    const [viewingPasal, setViewingPasal] = useState<Pasal | null>(null);
    const [deletingPasal, setDeletingPasal] = useState<Pasal | null>(null);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const form = useForm({
        name: '',
        ayat: '',
        sub_ayat: '',
        deskripsi_ayat: '',
        description: '',
        keterangan: '',
        level: 'ringan' as 'ringan' | 'sedang' | 'berat',
        sanction: '',
    });

    const handleOpenCreate = () => {
        setEditingPasal(null);
        form.setData({
            name: '',
            ayat: '',
            sub_ayat: '',
            deskripsi_ayat: '',
            description: '',
            keterangan: '',
            level: 'ringan',
            sanction: '',
        });
        form.clearErrors();
        setIsOpen(true);
    };

    const handleOpenEdit = (pasal: Pasal) => {
        setEditingPasal(pasal);
        form.setData({
            name: pasal.name,
            ayat: pasal.ayat || '',
            sub_ayat: pasal.sub_ayat || '',
            deskripsi_ayat: pasal.deskripsi_ayat || '',
            description: pasal.description || '',
            keterangan: pasal.keterangan || '',
            level: pasal.level,
            sanction: pasal.sanction,
        });
        form.clearErrors();
        setIsOpen(true);
    };

    const handleOpenView = (pasal: Pasal) => {
        setViewingPasal(pasal);
        setIsViewOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingPasal) {
            form.put(route('pasals.update', editingPasal.id), {
                onSuccess: () => {
                    setIsOpen(false);
                    form.reset();
                },
            });
        } else {
            form.post(route('pasals.store'), {
                onSuccess: () => {
                    setIsOpen(false);
                    form.reset();
                },
            });
        }
    };

    const handleOpenDelete = (pasal: Pasal) => {
        setDeletingPasal(pasal);
        setDeleteConfirmText('');
        setIsDeleteOpen(true);
    };

    const handleConfirmDelete = () => {
        if (deletingPasal) {
            router.delete(route('pasals.destroy', deletingPasal.id), {
                onSuccess: () => {
                    setIsDeleteOpen(false);
                    setDeletingPasal(null);
                    setDeleteConfirmText('');
                },
            });
        }
    };

    const filteredPasals = pasals.filter(pasal => {
        const query = searchQuery.toLowerCase();
        return (
            pasal.name.toLowerCase().includes(query) ||
            (pasal.ayat && pasal.ayat.toLowerCase().includes(query)) ||
            (pasal.sub_ayat && pasal.sub_ayat.toLowerCase().includes(query)) ||
            (pasal.deskripsi_ayat && pasal.deskripsi_ayat.toLowerCase().includes(query)) ||
            (pasal.description && pasal.description.toLowerCase().includes(query)) ||
            (pasal.keterangan && pasal.keterangan.toLowerCase().includes(query)) ||
            pasal.level.toLowerCase().includes(query) ||
            pasal.sanction.toLowerCase().includes(query)
        );
    });

    const getLevelBadge = (level: 'ringan' | 'sedang' | 'berat') => {
        switch (level) {
            case 'ringan':
                return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900/50">Ringan</Badge>;
            case 'sedang':
                return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50">Sedang</Badge>;
            case 'berat':
                return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50">Berat</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kelola Pasal & Sanksi" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">Kelola Pasal & Sanksi</h1>
                        <p className="text-neutral-500 dark:text-neutral-400">Atur aturan sekolah, klausul pasal/ayat, klasifikasi level pelanggaran, dan sanksinya.</p>
                    </div>

                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <Button onClick={handleOpenCreate} className="flex items-center gap-2 w-fit">
                            <Plus className="size-4" />
                            Tambah Pasal
                        </Button>
                        <DialogContent className="sm:max-w-[480px]">
                            <DialogHeader>
                                <DialogTitle>{editingPasal ? 'Edit Pasal & Sanksi' : 'Tambah Pasal Baru'}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Pasal</Label>
                                    <Input
                                        id="name"
                                        placeholder="Contoh: Pasal 1"
                                        value={form.data.name}
                                        onChange={e => form.setData('name', e.target.value)}
                                        required
                                    />
                                    {form.errors.name && <p className="text-xs text-red-500">{form.errors.name}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="ayat">Ayat</Label>
                                        <Input
                                            id="ayat"
                                            placeholder="Contoh: 1"
                                            value={form.data.ayat}
                                            onChange={e => form.setData('ayat', e.target.value)}
                                        />
                                        {form.errors.ayat && <p className="text-xs text-red-500">{form.errors.ayat}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="sub_ayat">Sub Ayat</Label>
                                        <Input
                                            id="sub_ayat"
                                            placeholder="Contoh: 1A"
                                            value={form.data.sub_ayat}
                                            onChange={e => form.setData('sub_ayat', e.target.value)}
                                        />
                                        {form.errors.sub_ayat && <p className="text-xs text-red-500">{form.errors.sub_ayat}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="level">Kategori Pelanggaran</Label>
                                    <select
                                        id="level"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                                        value={form.data.level}
                                        onChange={e => form.setData('level', e.target.value as 'ringan' | 'sedang' | 'berat')}
                                        required
                                    >
                                        <option value="ringan">Ringan</option>
                                        <option value="sedang">Sedang</option>
                                        <option value="berat">Berat</option>
                                    </select>
                                    {form.errors.level && <p className="text-xs text-red-500">{form.errors.level}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Isi Pasal</Label>
                                    <textarea
                                        id="description"
                                        placeholder="Tuliskan isi dari pasal..."
                                        className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                                        value={form.data.description}
                                        onChange={e => form.setData('description', e.target.value)}
                                    />
                                    {form.errors.description && <p className="text-xs text-red-500">{form.errors.description}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="deskripsi_ayat">Deskripsi Ayat (Detail Aturan)</Label>
                                    <textarea
                                        id="deskripsi_ayat"
                                        placeholder="Tuliskan deskripsi/aturan detail dari ayat..."
                                        className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                                        value={form.data.deskripsi_ayat}
                                        onChange={e => form.setData('deskripsi_ayat', e.target.value)}
                                    />
                                    {form.errors.deskripsi_ayat && <p className="text-xs text-red-500">{form.errors.deskripsi_ayat}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="keterangan">Keterangan</Label>
                                    <textarea
                                        id="keterangan"
                                        placeholder="Contoh: Bagian depan batasannya tidak menutup alis..."
                                        className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                                        value={form.data.keterangan}
                                        onChange={e => form.setData('keterangan', e.target.value)}
                                    />
                                    {form.errors.keterangan && <p className="text-xs text-red-500">{form.errors.keterangan}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="sanction">Mekanisme Pelanggaran</Label>
                                    <textarea
                                        id="sanction"
                                        placeholder="Tuliskan tindakan disiplin atau mekanisme sanksi..."
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                                        value={form.data.sanction}
                                        onChange={e => form.setData('sanction', e.target.value)}
                                        required
                                    />
                                    {form.errors.sanction && <p className="text-xs text-red-500">{form.errors.sanction}</p>}
                                </div>

                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                                        Batal
                                    </Button>
                                    <Button type="submit" disabled={form.processing}>
                                        Simpan
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <Card>
                    <CardHeader className="pb-4 border-b border-neutral-100 dark:border-neutral-800">
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
                            <Input
                                type="text"
                                placeholder="Cari pasal, ayat, sanksi..."
                                className="pl-9"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-sm">
                                <thead>
                                    <tr className="border-b border-neutral-150 bg-neutral-50/50 text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900/50">
                                        <th className="p-4 font-semibold">Pasal</th>
                                        <th className="p-4 font-semibold">Ayat</th>
                                        <th className="p-4 font-semibold">Sub Ayat</th>
                                        <th className="p-4 font-semibold">Isi Pasal</th>
                                        <th className="p-4 font-semibold">Deskripsi Ayat</th>
                                        <th className="p-4 font-semibold">Keterangan</th>
                                        <th className="p-4 font-semibold">Kategori Pelanggaran</th>
                                        <th className="p-4 font-semibold">Mekanisme Pelanggaran</th>
                                        <th className="p-4 font-semibold text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPasals.map(pasal => (
                                        <tr key={pasal.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/30 dark:border-neutral-800 dark:hover:bg-neutral-900/30">
                                            <td className="p-4 font-medium text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
                                                {pasal.name}
                                            </td>
                                            <td className="p-4 text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                                                {pasal.ayat || '-'}
                                            </td>
                                            <td className="p-4 text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                                                {pasal.sub_ayat || '-'}
                                            </td>
                                            <td className="p-4 text-neutral-600 dark:text-neutral-400 max-w-xs truncate" title={pasal.description || ''}>
                                                {pasal.description || '-'}
                                            </td>
                                            <td className="p-4 text-neutral-600 dark:text-neutral-400 max-w-xs truncate" title={pasal.deskripsi_ayat || ''}>
                                                {pasal.deskripsi_ayat || '-'}
                                            </td>
                                            <td className="p-4 text-neutral-600 dark:text-neutral-400 max-w-xs truncate" title={pasal.keterangan || ''}>
                                                {pasal.keterangan || '-'}
                                            </td>
                                            <td className="p-4 whitespace-nowrap">
                                                {getLevelBadge(pasal.level)}
                                            </td>
                                            <td className="p-4 text-neutral-600 dark:text-neutral-400 max-w-xs truncate" title={pasal.sanction}>
                                                {pasal.sanction}
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-1.5">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="size-8 text-neutral-400 hover:text-indigo-650 dark:hover:bg-neutral-800"
                                                        onClick={() => handleOpenView(pasal)}
                                                        title="Lihat Detail"
                                                    >
                                                        <Eye className="size-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="size-8 text-neutral-400 hover:text-indigo-600 dark:hover:bg-neutral-800"
                                                        onClick={() => handleOpenEdit(pasal)}
                                                    >
                                                        <Edit className="size-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="size-8 text-neutral-400 hover:text-red-500 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                                                        onClick={() => handleOpenDelete(pasal)}
                                                        title="Hapus Pasal"
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}

                                    {filteredPasals.length === 0 && (
                                        <tr>
                                            <td colSpan={9} className="p-8 text-center text-neutral-500 dark:text-neutral-400">
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    <Scale className="size-8 text-neutral-300 dark:text-neutral-700" />
                                                    <span>Tidak ada data pasal ditemukan.</span>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Modal to View Pasal Details */}
            <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl font-bold text-neutral-900 dark:text-neutral-100">
                            <Scale className="size-5 text-indigo-500" />
                            <span>Detail Aturan / Pasal</span>
                        </DialogTitle>
                    </DialogHeader>
                    
                    {viewingPasal && (
                        <div className="space-y-4 py-4">
                            <div className="flex items-center justify-between border-b pb-3 dark:border-neutral-800">
                                <div>
                                    <h4 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                                        {viewingPasal.name}
                                    </h4>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                                        {viewingPasal.ayat ? `Ayat: ${viewingPasal.ayat}` : ''}
                                        {viewingPasal.sub_ayat ? ` | Sub Ayat: ${viewingPasal.sub_ayat}` : ''}
                                    </p>
                                </div>
                                <div className="ml-4">
                                    {getLevelBadge(viewingPasal.level)}
                                </div>
                            </div>

                            {viewingPasal.description && (
                                <div className="space-y-1">
                                    <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Isi Pasal:</span>
                                    <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">
                                        {viewingPasal.description}
                                    </div>
                                </div>
                            )}

                            {viewingPasal.deskripsi_ayat && (
                                <div className="space-y-1">
                                    <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Deskripsi Ayat:</span>
                                    <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">
                                        {viewingPasal.deskripsi_ayat}
                                    </div>
                                </div>
                            )}

                            {viewingPasal.keterangan && (
                                <div className="space-y-1">
                                    <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Keterangan:</span>
                                    <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">
                                        {viewingPasal.keterangan}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1">
                                <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Mekanisme Pelanggaran (Sanksi):</span>
                                <div className="p-3 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 text-sm font-medium text-indigo-900 dark:text-indigo-300 whitespace-pre-wrap">
                                    {viewingPasal.sanction}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Modal for Professional Delete Confirmation */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent className="sm:max-w-[450px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-500 text-lg font-bold">
                            <AlertTriangle className="size-5" />
                            <span>Konfirmasi Hapus Pasal</span>
                        </DialogTitle>
                    </DialogHeader>

                    {deletingPasal && (
                        <div className="space-y-4 py-3">
                            <p className="text-sm text-neutral-600 dark:text-neutral-350 leading-relaxed">
                                Apakah Anda yakin ingin menghapus pasal ini? Tindakan ini bersifat permanen dan data pelanggaran yang terhubung dengan pasal ini tidak dapat diakses lagi.
                            </p>

                            <div className="p-3.5 rounded-lg bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/30">
                                <span className="block text-[11px] font-semibold text-red-500 uppercase tracking-wider mb-1">
                                    Aturan yang Akan Dihapus
                                </span>
                                <span className="font-bold text-sm text-neutral-800 dark:text-neutral-200">
                                    {deletingPasal.name}
                                    {deletingPasal.ayat ? ` Ayat ${deletingPasal.ayat}` : ''}
                                    {deletingPasal.sub_ayat ? ` Sub ${deletingPasal.sub_ayat}` : ''}
                                </span>
                                {deletingPasal.description && (
                                    <span className="block text-xs text-neutral-500 dark:text-neutral-400 mt-1 truncate">
                                        {deletingPasal.description}
                                    </span>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="delete-confirm" className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                                    Ketik <span className="font-bold select-all text-neutral-800 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">
                                        {deletingPasal.name}
                                        {deletingPasal.ayat ? ` Ayat ${deletingPasal.ayat}` : ''}
                                        {deletingPasal.sub_ayat ? ` Sub ${deletingPasal.sub_ayat}` : ''}
                                    </span> untuk menyetujui:
                                </Label>
                                <Input
                                    id="delete-confirm"
                                    type="text"
                                    placeholder="Masukkan nama aturan..."
                                    className="w-full border-red-200 focus-visible:ring-red-500 dark:border-red-900/50 text-neutral-900 dark:text-neutral-100"
                                    value={deleteConfirmText}
                                    onChange={e => setDeleteConfirmText(e.target.value)}
                                    autoComplete="off"
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setIsDeleteOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            disabled={!deletingPasal || deleteConfirmText !== (
                                deletingPasal.name + 
                                (deletingPasal.ayat ? ` Ayat ${deletingPasal.ayat}` : '') + 
                                (deletingPasal.sub_ayat ? ` Sub ${deletingPasal.sub_ayat}` : '')
                            )}
                            onClick={handleConfirmDelete}
                        >
                            Hapus Permanen
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
