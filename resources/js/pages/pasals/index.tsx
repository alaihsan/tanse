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
import { Trash2, Edit, Plus, Scale, Search } from 'lucide-react';

interface Pasal {
    id: number;
    name: string;
    ayat: string | null;
    description: string | null;
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
    const [editingPasal, setEditingPasal] = useState<Pasal | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const form = useForm({
        name: '',
        ayat: '',
        description: '',
        level: 'ringan' as 'ringan' | 'sedang' | 'berat',
        sanction: '',
    });

    const handleOpenCreate = () => {
        setEditingPasal(null);
        form.setData({
            name: '',
            ayat: '',
            description: '',
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
            description: pasal.description || '',
            level: pasal.level,
            sanction: pasal.sanction,
        });
        form.clearErrors();
        setIsOpen(true);
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

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus pasal ini?')) {
            router.delete(route('pasals.destroy', id));
        }
    };

    const filteredPasals = pasals.filter(pasal => {
        const query = searchQuery.toLowerCase();
        return (
            pasal.name.toLowerCase().includes(query) ||
            (pasal.ayat && pasal.ayat.toLowerCase().includes(query)) ||
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
                                    <Label htmlFor="name">Nama Pasal / Jenis Pelanggaran</Label>
                                    <Input
                                        id="name"
                                        placeholder="Contoh: Merokok di Lingkungan Sekolah"
                                        value={form.data.name}
                                        onChange={e => form.setData('name', e.target.value)}
                                        required
                                    />
                                    {form.errors.name && <p className="text-xs text-red-500">{form.errors.name}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="ayat">Ayat / Klausul</Label>
                                        <Input
                                            id="ayat"
                                            placeholder="Contoh: Ayat 1"
                                            value={form.data.ayat}
                                            onChange={e => form.setData('ayat', e.target.value)}
                                        />
                                        {form.errors.ayat && <p className="text-xs text-red-500">{form.errors.ayat}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="level">Level Pelanggaran</Label>
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
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Deskripsi Ayat (Detail Pelanggaran)</Label>
                                    <textarea
                                        id="description"
                                        placeholder="Contoh: Siswa dilarang membawa atau merokok di lingkungan sekolah..."
                                        className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                                        value={form.data.description}
                                        onChange={e => form.setData('description', e.target.value)}
                                    />
                                    {form.errors.description && <p className="text-xs text-red-500">{form.errors.description}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="sanction">Sanksi</Label>
                                    <textarea
                                        id="sanction"
                                        placeholder="Tuliskan tindakan disiplin atau sanksi..."
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
                                        <th className="p-4 font-semibold">Nama Pasal / Aturan</th>
                                        <th className="p-4 font-semibold">Ayat</th>
                                        <th className="p-4 font-semibold">Deskripsi</th>
                                        <th className="p-4 font-semibold">Level</th>
                                        <th className="p-4 font-semibold">Sanksi</th>
                                        <th className="p-4 font-semibold text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPasals.map(pasal => (
                                        <tr key={pasal.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/30 dark:border-neutral-800 dark:hover:bg-neutral-900/30">
                                            <td className="p-4 font-medium text-neutral-900 dark:text-neutral-150">
                                                {pasal.name}
                                            </td>
                                            <td className="p-4 text-neutral-600 dark:text-neutral-400">
                                                {pasal.ayat || '-'}
                                            </td>
                                            <td className="p-4 text-neutral-600 dark:text-neutral-400 max-w-xs truncate" title={pasal.description || ''}>
                                                {pasal.description || '-'}
                                            </td>
                                            <td className="p-4">
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
                                                        className="size-8 text-neutral-400 hover:text-indigo-600 dark:hover:bg-neutral-800"
                                                        onClick={() => handleOpenEdit(pasal)}
                                                    >
                                                        <Edit className="size-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="size-8 text-neutral-400 hover:text-red-500 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                                                        onClick={() => handleDelete(pasal.id)}
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}

                                    {filteredPasals.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-neutral-500 dark:text-neutral-400">
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
        </AppLayout>
    );
}
