import { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Trash2, AlertTriangle, Calendar, BookOpen, User, Users, Info, FileUp, FileText, Image, Printer } from 'lucide-react';

interface Student {
    id: number;
    name: string;
    classroom_id: number;
}

interface Classroom {
    id: number;
    name: string;
    students: Student[];
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
    attachments?: string[] | null;
    student?: Student & { classroom?: Classroom };
    pasal?: Pasal;
    user?: Teacher;
}

interface Props {
    violations: Violation[];
    classrooms: Classroom[];
    pasals: Pasal[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Input Pelanggaran',
        href: '/violations',
    },
];

export default function ViolationsIndex({ violations, classrooms, pasals }: Props) {
    const today = new Date().toISOString().split('T')[0];
    const [selectedClassId, setSelectedClassId] = useState<string>('');
    const [availableStudents, setAvailableStudents] = useState<Student[]>([]);

    const form = useForm({
        student_id: '',
        pasal_id: '',
        violation_date: today,
        notes: '',
        attachments: [] as File[],
    });

    // Update students dropdown when class is selected
    useEffect(() => {
        if (selectedClassId) {
            const classroom = classrooms.find(c => c.id === Number(selectedClassId));
            setAvailableStudents(classroom ? classroom.students : []);
            form.setData('student_id', ''); // Reset student selection
        } else {
            setAvailableStudents([]);
            form.setData('student_id', '');
        }
    }, [selectedClassId, classrooms]);

    const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedClassId(e.target.value);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route('violations.store'), {
            onSuccess: () => {
                form.reset('student_id', 'notes', 'attachments');
                const fileInput = document.getElementById('attachments') as HTMLInputElement;
                if (fileInput) {
                    fileInput.value = '';
                }
            },
        });
    };

    const [violationToDelete, setViolationToDelete] = useState<Violation | null>(null);
    const [confirmDeleteInput, setConfirmDeleteInput] = useState('');

    const handleDelete = (violation: Violation) => {
        setViolationToDelete(violation);
        setConfirmDeleteInput('');
    };

    const handleConfirmDelete = (e: React.FormEvent) => {
        e.preventDefault();
        if (confirmDeleteInput !== 'HAPUS' || !violationToDelete) return;
        
        router.delete(route('violations.destroy', violationToDelete.id), {
            onSuccess: () => {
                setViolationToDelete(null);
                setConfirmDeleteInput('');
            }
        });
    };

    // Find selected pasal details for live preview
    const selectedPasal = pasals.find(p => p.id === Number(form.data.pasal_id));

    const getLevelBadge = (level: 'ringan' | 'sedang' | 'berat') => {
        switch (level) {
            case 'ringan':
                return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900/50">Ringan</Badge>;
            case 'sedang':
                return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50">Sedang</Badge>;
            case 'berat':
                return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50">Berat</Badge>;
            default:
                return null;
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Input Pelanggaran" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">Log Pelanggaran Murid</h1>
                    <p className="text-neutral-500 dark:text-neutral-400">Catat dan tinjau pelanggaran disiplin siswa beserta sanksi yang ditetapkan.</p>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left & Middle Column: List of Violations */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader className="pb-4 border-b border-neutral-100 dark:border-neutral-800">
                                <CardTitle className="text-lg font-bold">Daftar Pelanggaran Terkini</CardTitle>
                                <CardDescription>Catatan pelanggaran disiplin murid secara real-time.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse text-sm">
                                        <thead>
                                            <tr className="border-b border-neutral-150 bg-neutral-50/50 text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900/50">
                                                <th className="p-4 font-semibold">Tanggal</th>
                                                <th className="p-4 font-semibold">Murid & Kelas</th>
                                                <th className="p-4 font-semibold">Pelanggaran</th>
                                                <th className="p-4 font-semibold">Level & Sanksi</th>
                                                <th className="p-4 font-semibold text-right">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {violations.map(violation => (
                                                <tr key={violation.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/30 dark:border-neutral-800 dark:hover:bg-neutral-900/30">
                                                    <td className="p-4 align-top text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                                                        <div className="flex items-center gap-1.5">
                                                            <Calendar className="size-4 text-neutral-400" />
                                                            <span>{formatDate(violation.violation_date)}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 align-top">
                                                        <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                                                            {violation.student?.name || 'Terhapus'}
                                                        </div>
                                                        <div className="text-xs text-neutral-500 mt-0.5 flex items-center gap-1">
                                                            <Users className="size-3" />
                                                            <span>{violation.student?.classroom?.name || '-'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 align-top">
                                                        <div className="font-medium text-neutral-900 dark:text-neutral-200">
                                                            {violation.pasal?.name || 'Terhapus'}
                                                        </div>
                                                        {violation.pasal?.ayat && (
                                                            <div className="text-xs text-neutral-500 mt-0.5">
                                                                {violation.pasal.ayat}
                                                            </div>
                                                        )}
                                                        {violation.notes && (
                                                            <div className="text-xs text-neutral-500 bg-neutral-50 dark:bg-neutral-900 p-2 rounded-md mt-2 border border-neutral-100 dark:border-neutral-850">
                                                                <strong>Catatan:</strong> {violation.notes}
                                                            </div>
                                                        )}
                                                        {violation.attachments && violation.attachments.length > 0 && (
                                                            <div className="mt-2.5 space-y-1.5">
                                                                <div className="text-[11px] font-semibold text-neutral-500">Lampiran Bukti ({violation.attachments.length}):</div>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {violation.attachments.map((filePath, idx) => {
                                                                        const isPdf = filePath.toLowerCase().endsWith('.pdf');
                                                                        return (
                                                                            <a
                                                                                key={idx}
                                                                                href={`/storage/${filePath}`}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="inline-flex items-center gap-1 text-[11px] bg-neutral-50 hover:bg-neutral-100 text-indigo-600 hover:text-indigo-800 font-semibold border px-2 py-1 rounded-md transition-all dark:bg-neutral-900 dark:hover:bg-neutral-850 dark:text-indigo-400 dark:border-neutral-800"
                                                                                title="Klik untuk membuka lampiran"
                                                                            >
                                                                                {isPdf ? (
                                                                                    <FileText className="size-3 text-red-500" />
                                                                                ) : (
                                                                                    <Image className="size-3 text-blue-500" />
                                                                                )}
                                                                                <span>Berkas {idx + 1}</span>
                                                                            </a>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="p-4 align-top space-y-1.5">
                                                        <div>
                                                            {violation.pasal && getLevelBadge(violation.pasal.level)}
                                                        </div>
                                                        <div className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">
                                                            Sanksi: {violation.pasal?.sanction || '-'}
                                                        </div>
                                                        <div className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1 flex items-center gap-1">
                                                            <User className="size-3 text-neutral-400" />
                                                            <span>Diisi oleh: <strong>{violation.user?.name || 'Sistem'}</strong></span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 align-top text-right whitespace-nowrap">
                                                        <div className="flex justify-end gap-1.5">
                                                            <a
                                                                href={route('violations.print', violation.id)}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-neutral-50 hover:text-indigo-650 dark:hover:bg-neutral-800 h-8 w-8 text-neutral-500 dark:text-neutral-400"
                                                                title="Cetak Surat Peringatan"
                                                            >
                                                                <Printer className="size-4" />
                                                            </a>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="size-8 text-neutral-400 hover:text-red-500 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                                                                onClick={() => handleDelete(violation)}
                                                            >
                                                                <Trash2 className="size-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}

                                            {violations.length === 0 && (
                                                <tr>
                                                    <td colSpan={5} className="p-12 text-center text-neutral-500 dark:text-neutral-400">
                                                        <div className="flex flex-col items-center justify-center gap-2">
                                                            <AlertTriangle className="size-8 text-neutral-300 dark:text-neutral-700" />
                                                            <span>Belum ada log pelanggaran disiplin murid yang tercatat.</span>
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

                    {/* Right Column: Log Violation Form */}
                    <div className="space-y-6">
                        <Card className="sticky top-6">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold">Input Pelanggaran Baru</CardTitle>
                                <CardDescription>Catat pelanggaran disiplin murid ke sistem.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* Select Class */}
                                    <div className="space-y-2">
                                        <Label htmlFor="classroom_select">Pilih Kelas</Label>
                                        <select
                                            id="classroom_select"
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm"
                                            value={selectedClassId}
                                            onChange={handleClassChange}
                                            required
                                        >
                                            <option value="">-- Pilih Kelas --</option>
                                            {classrooms.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Select Student */}
                                    <div className="space-y-2">
                                        <Label htmlFor="student_id">Pilih Murid</Label>
                                        <select
                                            id="student_id"
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 md:text-sm"
                                            value={form.data.student_id}
                                            onChange={e => form.setData('student_id', e.target.value)}
                                            required
                                            disabled={!selectedClassId}
                                        >
                                            <option value="">
                                                {selectedClassId ? '-- Pilih Murid --' : 'Silakan pilih kelas terlebih dahulu'}
                                            </option>
                                            {availableStudents.map(s => (
                                                <option key={s.id} value={s.id}>{s.name}</option>
                                            ))}
                                        </select>
                                        {form.errors.student_id && <p className="text-xs text-red-500">{form.errors.student_id}</p>}
                                    </div>

                                    {/* Select Pasal */}
                                    <div className="space-y-2">
                                        <Label htmlFor="pasal_id">Pilih Pasal Pelanggaran</Label>
                                        <select
                                            id="pasal_id"
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm"
                                            value={form.data.pasal_id}
                                            onChange={e => form.setData('pasal_id', e.target.value)}
                                            required
                                        >
                                            <option value="">-- Pilih Pasal --</option>
                                            {pasals.map(p => (
                                                <option key={p.id} value={p.id}>
                                                    {p.name} {p.ayat ? `(${p.ayat})` : ''}
                                                </option>
                                            ))}
                                        </select>
                                        {form.errors.pasal_id && <p className="text-xs text-red-500">{form.errors.pasal_id}</p>}
                                    </div>

                                    {/* Pasal Live Details */}
                                    {selectedPasal && (
                                        <div className="p-3.5 rounded-lg border border-neutral-100 bg-neutral-50/50 space-y-2 text-xs dark:border-neutral-800 dark:bg-neutral-900/50">
                                            <div className="flex items-center gap-1.5 font-semibold text-neutral-800 dark:text-neutral-200">
                                                <Info className="size-3.5 text-indigo-500" />
                                                <span>Detail Pasal Terpilih:</span>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-neutral-100 dark:border-neutral-800">
                                                <span className="text-neutral-500">Level:</span>
                                                <span className="col-span-2 font-medium">{getLevelBadge(selectedPasal.level)}</span>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2">
                                                <span className="text-neutral-500">Sanksi:</span>
                                                <span className="col-span-2 font-medium text-neutral-850 dark:text-neutral-300">{selectedPasal.sanction}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Date */}
                                    <div className="space-y-2">
                                        <Label htmlFor="violation_date">Tanggal Pelanggaran</Label>
                                        <Input
                                            id="violation_date"
                                            type="date"
                                            value={form.data.violation_date}
                                            onChange={e => form.setData('violation_date', e.target.value)}
                                            required
                                        />
                                        {form.errors.violation_date && <p className="text-xs text-red-500">{form.errors.violation_date}</p>}
                                    </div>

                                    {/* Notes */}
                                    <div className="space-y-2">
                                        <Label htmlFor="notes">Catatan Tambahan (Opsional)</Label>
                                        <textarea
                                            id="notes"
                                            placeholder="Misalnya: Pelanggaran dilakukan saat jam istirahat..."
                                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                                            value={form.data.notes}
                                            onChange={e => form.setData('notes', e.target.value)}
                                        />
                                        {form.errors.notes && <p className="text-xs text-red-550">{form.errors.notes}</p>}
                                    </div>

                                    {/* Multiple Attachments */}
                                    <div className="space-y-2">
                                        <Label htmlFor="attachments" className="flex items-center gap-1">
                                            <FileUp className="size-4 text-indigo-500" />
                                            <span>Upload Bukti (Bisa lebih dari 1)</span>
                                        </Label>
                                        <Input
                                            id="attachments"
                                            type="file"
                                            accept="image/*,application/pdf"
                                            multiple
                                            onChange={e => {
                                                const files = Array.from(e.target.files || []);
                                                form.setData('attachments', files);
                                            }}
                                        />
                                        <p className="text-[10px] text-neutral-455">Diterima: PDF, JPG, JPEG, PNG (Maks. 2MB per berkas)</p>
                                        {form.errors.attachments && <p className="text-xs text-red-500">{form.errors.attachments}</p>}
                                        {form.data.attachments.length > 0 && (
                                            <div className="space-y-1 mt-1 text-xs">
                                                <div className="font-semibold text-neutral-600 dark:text-neutral-400">Berkas terpilih ({form.data.attachments.length}):</div>
                                                <div className="max-h-[100px] overflow-y-auto border rounded p-1.5 bg-neutral-50 dark:bg-neutral-900 space-y-1">
                                                    {form.data.attachments.map((file, idx) => (
                                                        <div key={idx} className="flex justify-between items-center text-neutral-700 dark:text-neutral-300">
                                                            <span className="truncate max-w-[180px]">{file.name}</span>
                                                            <span className="text-[10px] text-neutral-400">({(file.size / 1024).toFixed(0)} KB)</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <Button type="submit" className="w-full flex items-center justify-center gap-2" disabled={form.processing}>
                                        <AlertTriangle className="size-4" />
                                        Log Pelanggaran
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Dialog for Violation Delete Confirmation */}
                <Dialog open={violationToDelete !== null} onOpenChange={(open) => !open && setViolationToDelete(null)}>
                    <DialogContent className="sm:max-w-[425px]">
                        {violationToDelete && (
                            <>
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2 text-red-650">
                                        <AlertTriangle className="size-5 text-red-600" />
                                        <span>Konfirmasi Hapus Pelanggaran</span>
                                    </DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleConfirmDelete} className="space-y-4 py-4">
                                    <p className="text-sm text-neutral-500">
                                        Apakah Anda yakin ingin menghapus catatan pelanggaran untuk murid <strong>{violationToDelete.student?.name}</strong>? Tindakan ini tidak dapat dibatalkan.
                                    </p>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmDeleteInput">
                                            Ketik <span className="font-bold text-red-600">HAPUS</span> untuk mengonfirmasi:
                                        </Label>
                                        <Input
                                            id="confirmDeleteInput"
                                            placeholder="HAPUS"
                                            value={confirmDeleteInput}
                                            onChange={e => setConfirmDeleteInput(e.target.value)}
                                            required
                                            autoFocus
                                        />
                                    </div>
                                    <DialogFooter>
                                        <Button type="button" variant="outline" onClick={() => setViolationToDelete(null)}>
                                            Batal
                                        </Button>
                                        <Button 
                                            type="submit" 
                                            variant="destructive"
                                            disabled={confirmDeleteInput !== 'HAPUS'}
                                            className="bg-red-600 hover:bg-red-700 text-white"
                                        >
                                            Hapus Pelanggaran
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
