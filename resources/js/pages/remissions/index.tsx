import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { HeartHandshake, Search, FileText, Image, Calendar, User, AlertCircle, CheckCircle, Download, FileUp, Eye, Printer } from 'lucide-react';

interface Classroom {
    id: number;
    name: string;
}

interface Student {
    id: number;
    name: string;
    nis: string | null;
    classroom: Classroom;
}

interface Pasal {
    id: number;
    name: string;
    ayat: string | null;
    level: 'ringan' | 'sedang' | 'berat';
    sanction: string;
}

interface Teacher {
    id: number;
    name: string;
}

interface Violation {
    id: number;
    student_id: number;
    pasal_id: number;
    notes: string | null;
    violation_date: string;
    status: 'aktif' | 'diremisi';
    remission_date: string | null;
    remission_notes: string | null;
    remission_attachment: string | null;
    student: Student;
    pasal: Pasal;
    user: Teacher;
    remission_user?: Teacher | null;
}

interface Props {
    activeViolations: Violation[];
    remisedViolations: Violation[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Remisi Pelanggaran',
        href: '/remissions',
    },
];

export default function RemissionsIndex({ activeViolations, remisedViolations }: Props) {
    const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null);
    const [isRemitOpen, setIsRemitOpen] = useState(false);

    const form = useForm({
        remission_notes: '',
        remission_attachment: null as File | null,
    });

    const handleOpenRemit = (violation: Violation) => {
        setSelectedViolation(violation);
        form.setData({
            remission_notes: '',
            remission_attachment: null,
        });
        form.clearErrors();
        setIsRemitOpen(true);
    };

    const handleSubmitRemit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedViolation) return;

        form.post(route('violations.remit', selectedViolation.id), {
            onSuccess: () => {
                setIsRemitOpen(false);
                form.reset();
                setSelectedViolation(null);
            },
        });
    };

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

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const formatDateTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }) + ' WIB';
    };

    const filterViolations = (list: Violation[]) => {
        const query = searchQuery.toLowerCase();
        return list.filter(v => {
            return (
                v.student?.name.toLowerCase().includes(query) ||
                (v.student?.nis && v.student.nis.toLowerCase().includes(query)) ||
                v.student?.classroom?.name.toLowerCase().includes(query) ||
                v.pasal?.name.toLowerCase().includes(query) ||
                (v.pasal?.ayat && v.pasal.ayat.toLowerCase().includes(query)) ||
                (v.notes && v.notes.toLowerCase().includes(query))
            );
        });
    };

    const displayedActive = filterViolations(activeViolations);
    const displayedHistory = filterViolations(remisedViolations);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Remisi Pelanggaran" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
                            <HeartHandshake className="size-6 text-indigo-500" />
                            <span>Remisi Pelanggaran</span>
                        </h1>
                        <p className="text-neutral-500 dark:text-neutral-400">Pemberian keringanan atau penghapusan pelanggaran aktif murid dengan melampirkan berkas bukti.</p>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-2">
                        <div className="flex gap-2 bg-neutral-100 dark:bg-neutral-900 p-1 rounded-lg">
                            <button
                                className={`py-1.5 px-4 text-sm font-semibold rounded-md transition-all ${
                                    activeTab === 'active'
                                        ? 'bg-white text-indigo-650 shadow-xs dark:bg-neutral-800 dark:text-indigo-400'
                                        : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                                }`}
                                onClick={() => setActiveTab('active')}
                            >
                                Pelanggaran Aktif ({activeViolations.length})
                            </button>
                            <button
                                className={`py-1.5 px-4 text-sm font-semibold rounded-md transition-all ${
                                    activeTab === 'history'
                                        ? 'bg-white text-indigo-650 shadow-xs dark:bg-neutral-800 dark:text-indigo-400'
                                        : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                                }`}
                                onClick={() => setActiveTab('history')}
                            >
                                Riwayat Remisi ({remisedViolations.length})
                            </button>
                        </div>

                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
                            <Input
                                type="text"
                                placeholder="Cari nama murid, kelas, pasal..."
                                className="pl-9"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {activeTab === 'active' ? (
                        <div className="grid gap-6 md:grid-cols-2">
                            {displayedActive.map(violation => (
                                <Card key={violation.id} className="relative overflow-hidden border border-neutral-200 bg-white shadow-xs hover:shadow-md transition-all dark:border-neutral-800 dark:bg-neutral-950">
                                    <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500" />
                                    <CardHeader className="pb-3 pl-6">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle className="text-base font-bold text-neutral-900 dark:text-neutral-50">
                                                    {violation.student?.name}
                                                </CardTitle>
                                                <CardDescription className="text-xs font-mono mt-0.5">
                                                    NIS: {violation.student?.nis || '-'} • Kelas: {violation.student?.classroom?.name || '-'}
                                                </CardDescription>
                                            </div>
                                            {getLevelBadge(violation.pasal?.level)}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4 pl-6">
                                        <div className="p-3 rounded-lg bg-neutral-50 border text-xs space-y-1.5 dark:bg-neutral-900 dark:border-neutral-800">
                                            <div>
                                                <strong className="text-neutral-700 dark:text-neutral-300">Pasal:</strong> {violation.pasal?.name} {violation.pasal?.ayat && `(${violation.pasal.ayat})`}
                                            </div>
                                            {violation.notes && (
                                                <div>
                                                    <strong className="text-neutral-700 dark:text-neutral-300">Keterangan:</strong> <span className="italic">"{violation.notes}"</span>
                                                </div>
                                            )}
                                            <div className="border-t pt-1.5 mt-1.5 border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-500 flex justify-between">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="size-3" />
                                                    {formatDate(violation.violation_date)}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <User className="size-3" />
                                                    Diinput oleh: {violation.user?.name}
                                                </span>
                                            </div>
                                        </div>

                                        <Button
                                            className="w-full flex items-center gap-2"
                                            onClick={() => handleOpenRemit(violation)}
                                        >
                                            <HeartHandshake className="size-4" />
                                            Beri Remisi
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}

                            {displayedActive.length === 0 && (
                                <div className="col-span-full flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 p-8 text-center bg-green-55/5 dark:border-neutral-800">
                                    <CheckCircle className="size-12 text-green-500 animate-bounce" />
                                    <h3 className="mt-4 text-lg font-bold text-neutral-900 dark:text-neutral-50">Tidak ada pelanggaran aktif</h3>
                                    <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400 max-w-sm">
                                        Semua murid saat ini bersih dari pelanggaran disiplin yang aktif, atau pencarian Anda tidak menemukan hasil.
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2">
                            {displayedHistory.map(violation => (
                                <Card key={violation.id} className="relative overflow-hidden border border-green-200 bg-white shadow-xs dark:border-green-900/40 dark:bg-neutral-950">
                                    <div className="absolute top-0 left-0 w-1.5 h-full bg-green-500" />
                                    <CardHeader className="pb-3 pl-6">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle className="text-base font-bold text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
                                                    <span>{violation.student?.name}</span>
                                                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200 text-[10px] dark:bg-green-950/45 dark:text-green-400 dark:border-green-900/50">Diremisi</Badge>
                                                </CardTitle>
                                                <CardDescription className="text-xs font-mono mt-0.5">
                                                    NIS: {violation.student?.nis || '-'} • Kelas: {violation.student?.classroom?.name || '-'}
                                                </CardDescription>
                                            </div>
                                            {getLevelBadge(violation.pasal?.level)}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3 pl-6">
                                        <div className="p-3 rounded-lg bg-neutral-50 border text-xs space-y-1.5 dark:bg-neutral-900/60 dark:border-neutral-800/80">
                                            <div>
                                                <strong className="text-neutral-700 dark:text-neutral-300">Pasal Asal:</strong> {violation.pasal?.name} {violation.pasal?.ayat && `(${violation.pasal.ayat})`}
                                            </div>
                                            <div className="text-[11px] text-neutral-450 border-b pb-1.5 mb-1.5 border-neutral-200 dark:border-neutral-800">
                                                Melanggar pada: {formatDate(violation.violation_date)} (Diisi oleh: {violation.user?.name})
                                            </div>
                                            <div className="pt-0.5 text-neutral-805 dark:text-neutral-200">
                                                <strong className="text-green-700 dark:text-green-400 block font-semibold mb-0.5">Catatan Remisi:</strong>
                                                <span className="italic">"{violation.remission_notes}"</span>
                                            </div>
                                            <div className="border-t pt-1.5 mt-1.5 border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-500 flex justify-between items-center">
                                                <span className="flex items-center gap-1 font-medium text-green-650 dark:text-green-500">
                                                    <Calendar className="size-3" />
                                                    Remisi: {formatDateTime(violation.remission_date || '')}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <User className="size-3" />
                                                    Oleh: {violation.remission_user?.name || 'Sistem'}
                                                </span>
                                            </div>
                                        </div>

                                        {violation.remission_attachment && (
                                            <div className="flex items-center justify-between p-2 border border-neutral-200 rounded-md bg-neutral-50/50 dark:border-neutral-800 dark:bg-neutral-900/30">
                                                <span className="text-xs text-neutral-500 truncate max-w-[200px] flex items-center gap-1.5">
                                                    {violation.remission_attachment.toLowerCase().endsWith('.pdf') ? (
                                                        <FileText className="size-4 text-red-500" />
                                                    ) : (
                                                        <Image className="size-4 text-blue-500" />
                                                    )}
                                                    <span>Lampiran Bukti</span>
                                                </span>
                                                <div className="flex gap-1.5">
                                                    <a
                                                        href={`/storage/${violation.remission_attachment}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold dark:text-indigo-400 dark:hover:text-indigo-300"
                                                    >
                                                        <Eye className="size-3.5" />
                                                        Lihat
                                                    </a>
                                                    <span className="text-neutral-300">|</span>
                                                    <a
                                                        href={`/storage/${violation.remission_attachment}`}
                                                        download
                                                        className="inline-flex items-center gap-1 text-xs text-indigo-650 hover:text-indigo-850 font-semibold dark:text-indigo-455 dark:hover:text-indigo-305"
                                                    >
                                                        <Download className="size-3.5" />
                                                        Unduh
                                                    </a>
                                                </div>
                                            </div>
                                        )}

                                        <a
                                            href={route('remissions.print', violation.id)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-indigo-50 text-indigo-650 hover:bg-indigo-100 hover:text-indigo-750 font-bold py-2 text-sm transition-colors border border-indigo-150 dark:bg-indigo-950/40 dark:text-indigo-400 dark:hover:bg-indigo-900/60 dark:border-indigo-900/50"
                                        >
                                            <Printer className="size-4" />
                                            Cetak Surat Remisi
                                        </a>
                                    </CardContent>
                                </Card>
                            ))}

                            {displayedHistory.length === 0 && (
                                <div className="col-span-full flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 p-8 text-center dark:border-neutral-800">
                                    <AlertCircle className="size-12 text-neutral-305 dark:text-neutral-700" />
                                    <h3 className="mt-4 text-lg font-bold text-neutral-900 dark:text-neutral-50">Belum ada riwayat remisi</h3>
                                    <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400 max-w-sm">
                                        Saat ini belum ada pelanggaran yang diberikan remisi atau dihapuskan.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Dialog to Submit Remission */}
                <Dialog open={isRemitOpen} onOpenChange={(open) => !open && setIsRemitOpen(false)}>
                    <DialogContent className="sm:max-w-[480px]">
                        {selectedViolation && (
                            <>
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                        <HeartHandshake className="size-5 text-indigo-500" />
                                        <span>Beri Remisi: {selectedViolation.student?.name}</span>
                                    </DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleSubmitRemit} className="space-y-4 py-4">
                                    <div className="text-xs p-3 border rounded-lg bg-neutral-50 dark:bg-neutral-900 space-y-1">
                                        <div><strong>Kelas:</strong> {selectedViolation.student?.classroom?.name}</div>
                                        <div><strong>Pelanggaran:</strong> {selectedViolation.pasal?.name}</div>
                                        <div><strong>Sanksi Terkait:</strong> {selectedViolation.pasal?.sanction}</div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="remission_notes">Alasan / Catatan Remisi</Label>
                                        <textarea
                                            id="remission_notes"
                                            placeholder="Tulis alasan mengapa pelanggaran ini diberikan remisi (misal: Siswa telah melakukan kerja bakti, berkelakuan baik selama sebulan)..."
                                            className="flex min-h-[90px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            value={form.data.remission_notes}
                                            onChange={e => form.setData('remission_notes', e.target.value)}
                                            required
                                        />
                                        {form.errors.remission_notes && (
                                            <p className="text-xs text-red-500">{form.errors.remission_notes}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="remission_attachment" className="flex items-center gap-1">
                                            <FileUp className="size-4 text-indigo-500" />
                                            <span>Upload Bukti (Gambar / PDF)</span>
                                        </Label>
                                        <Input
                                            id="remission_attachment"
                                            type="file"
                                            accept="image/*,application/pdf"
                                            onChange={e => form.setData('remission_attachment', e.target.files?.[0] || null)}
                                        />
                                        <p className="text-[10px] text-neutral-400">Diterima: PDF, JPG, JPEG, PNG (Maks. 2MB)</p>
                                        {form.errors.remission_attachment && (
                                            <p className="text-xs text-red-500">{form.errors.remission_attachment}</p>
                                        )}
                                    </div>

                                    <DialogFooter className="pt-2">
                                        <Button type="button" variant="outline" onClick={() => setIsRemitOpen(false)}>
                                            Batal
                                        </Button>
                                        <Button type="submit" disabled={form.processing}>
                                            Proses Remisi
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
