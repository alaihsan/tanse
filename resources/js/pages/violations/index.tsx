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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Trash2, AlertTriangle, Calendar, BookOpen, User, Users, Info, FileUp, FileText, Image, Printer, ChevronLeft, ChevronRight, Edit, X, Eye, MoreVertical, Search, Plus, Film } from 'lucide-react';

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
    sub_ayat: string | null;
    deskripsi_ayat: string | null;
    description: string | null;
    keterangan: string | null;
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
    const [isAttachmentOpen, setIsAttachmentOpen] = useState(false);
    const [activeAttachments, setActiveAttachments] = useState<string[]>([]);
    const [activeAttachmentIndex, setActiveAttachmentIndex] = useState<number>(0);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [viewingViolation, setViewingViolation] = useState<Violation | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingViolation, setEditingViolation] = useState<Violation | null>(null);
    const [editClassId, setEditClassId] = useState<string>('');
    const [editAvailableStudents, setEditAvailableStudents] = useState<Student[]>([]);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState(() => {
        if (typeof window !== 'undefined') {
            return new URLSearchParams(window.location.search).get('q') || '';
        }
        return '';
    });

    const form = useForm({
        student_id: '',
        pasal_id: '',
        violation_date: today,
        notes: '',
        attachments: [] as File[],
    });

    const editForm = useForm({
        student_id: '',
        pasal_id: '',
        violation_date: '',
        notes: '',
        attachments: [] as File[],
        existing_attachments: [] as string[],
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

    // Update students dropdown when edit class is selected
    useEffect(() => {
        if (editClassId) {
            const classroom = classrooms.find(c => c.id === Number(editClassId));
            setEditAvailableStudents(classroom ? classroom.students : []);
        } else {
            setEditAvailableStudents([]);
        }
    }, [editClassId, classrooms]);

    const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedClassId(e.target.value);
    };

    const handleOpenView = (violation: Violation) => {
        setViewingViolation(violation);
        setIsViewOpen(true);
    };

    const handleOpenEdit = (violation: Violation) => {
        setEditingViolation(violation);
        
        // Find student class and populate available students synchronously
        const studentClassId = violation.student?.classroom_id?.toString() || '';
        setEditClassId(studentClassId);

        if (studentClassId) {
            const classroom = classrooms.find(c => c.id === Number(studentClassId));
            setEditAvailableStudents(classroom ? classroom.students : []);
        } else {
            setEditAvailableStudents([]);
        }
        
        // Format date string to YYYY-MM-DD for the HTML5 date input element
        const dateOnly = violation.violation_date ? violation.violation_date.split('T')[0].split(' ')[0] : '';
        
        editForm.setData({
            student_id: violation.student_id.toString(),
            pasal_id: violation.pasal_id.toString(),
            violation_date: dateOnly,
            notes: violation.notes || '',
            attachments: [],
            existing_attachments: violation.attachments || [],
        });
        
        editForm.clearErrors();
        setIsEditOpen(true);
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingViolation) {
            return;
        }

        editForm.transform((data) => {
            const transformed = {
                ...data,
                _method: 'PUT',
            };
            // Omit attachments if no new files are uploaded to prevent validation issues with empty files
            if (data.attachments.length === 0) {
                delete (transformed as any).attachments;
            }
            return transformed;
        });

        editForm.post(route('violations.update', editingViolation.id), {
            onSuccess: () => {
                setIsEditOpen(false);
                setEditingViolation(null);
                editForm.reset();
            },
        });
    };

    const handleOpenAttachments = (attachments: string[], startIndex: number) => {
        setActiveAttachments(attachments);
        setActiveAttachmentIndex(startIndex);
        setIsAttachmentOpen(true);
    };

    const handlePrevAttachment = () => {
        setActiveAttachmentIndex((prev) => (prev === 0 ? activeAttachments.length - 1 : prev - 1));
    };

    const handleNextAttachment = () => {
        setActiveAttachmentIndex((prev) => (prev === activeAttachments.length - 1 ? 0 : prev + 1));
    };

    // Keyboard navigation for attachment carousel
    useEffect(() => {
        if (!isAttachmentOpen) {
            return;
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') {
                handlePrevAttachment();
            } else if (e.key === 'ArrowRight') {
                handleNextAttachment();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isAttachmentOpen, activeAttachments]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route('violations.store'), {
            onSuccess: () => {
                form.reset('student_id', 'notes', 'attachments');
                const fileInput = document.getElementById('attachments') as HTMLInputElement;
                if (fileInput) {
                    fileInput.value = '';
                }
                setIsCreateOpen(false);
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

    const selectedPasal = pasals.find(p => p.id === Number(form.data.pasal_id));

    // Dynamic client-side search filtering
    const filteredViolations = violations.filter(v => {
        const query = searchQuery.toLowerCase();
        const studentName = (v.student?.name || '').toLowerCase();
        const className = (v.student?.classroom?.name || '').toLowerCase();
        const pasalName = (v.pasal?.name || '').toLowerCase();
        const notes = (v.notes || '').toLowerCase();
        return studentName.includes(query) || 
               className.includes(query) || 
               pasalName.includes(query) || 
               notes.includes(query);
    });

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

                <div className="space-y-6">
                    <Card>
                        <CardHeader className="pb-4 border-b border-neutral-100 dark:border-neutral-850">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <CardTitle className="text-lg font-bold">Daftar Pelanggaran Terkini</CardTitle>
                                    <CardDescription>Catatan pelanggaran disiplin murid secara real-time.</CardDescription>
                                </div>
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                    <div className="relative w-full sm:w-64">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
                                        <Input
                                            type="text"
                                            placeholder="Cari pelanggaran..."
                                            className="pl-8 h-9 text-sm"
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                        />
                                        {searchQuery && (
                                            <button
                                                type="button"
                                                onClick={() => setSearchQuery('')}
                                                className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                                            >
                                                <X className="size-4" />
                                            </button>
                                        )}
                                    </div>
                                    <Button 
                                        type="button"
                                        onClick={() => setIsCreateOpen(true)} 
                                        className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer"
                                    >
                                        <Plus className="size-4" />
                                        <span>Catat Pelanggaran</span>
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-sm">
                                    <thead>
                                        <tr className="border-b border-neutral-150 bg-neutral-50/50 text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900/50">
                                            <th className="p-4 font-semibold w-[10%]">Tanggal</th>
                                            <th className="p-4 font-semibold w-[16%]">Murid & Kelas</th>
                                            <th className="p-4 font-semibold w-[16%]">Pelanggaran</th>
                                            <th className="p-4 font-semibold w-[22%]">Catatan</th>
                                            <th className="p-4 font-semibold w-[10%]">Lampiran</th>
                                            <th className="p-4 font-semibold w-[22%]">Level & Sanksi</th>
                                            <th className="p-4 font-semibold text-right w-[4%]">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredViolations.map(violation => (
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
                                                            {violation.pasal.ayat} {violation.pasal.sub_ayat ? ` - ${violation.pasal.sub_ayat}` : ''}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-4 align-top text-neutral-700 dark:text-neutral-300">
                                                    {violation.notes ? (
                                                        <div className="max-w-[220px] text-xs break-words whitespace-pre-wrap">
                                                            {violation.notes}
                                                        </div>
                                                    ) : (
                                                        <span className="text-neutral-400 dark:text-neutral-600">-</span>
                                                    )}
                                                </td>
                                                <td className="p-4 align-top">
                                                    {violation.attachments && violation.attachments.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1.5 max-w-[150px]">
                                                            {violation.attachments.map((filePath, idx) => {
                                                                const isPdf = filePath.toLowerCase().endsWith('.pdf');
                                                                const isVideo = filePath.toLowerCase().match(/\.(mp4|mov|webm|ogg|3gp)$/);
                                                                return (
                                                                    <button
                                                                        key={idx}
                                                                        type="button"
                                                                        onClick={() => handleOpenAttachments(violation.attachments || [], idx)}
                                                                        className="inline-flex items-center gap-1 text-[10px] bg-neutral-50 hover:bg-neutral-100 text-indigo-600 hover:text-indigo-800 font-semibold border px-2 py-0.5 rounded-md transition-all dark:bg-neutral-900 dark:hover:bg-neutral-850 dark:text-indigo-400 dark:border-neutral-800 cursor-pointer"
                                                                        title="Klik untuk membuka lampiran"
                                                                    >
                                                                        {isPdf ? (
                                                                            <FileText className="size-3 text-red-500" />
                                                                        ) : isVideo ? (
                                                                            <Film className="size-3 text-amber-500" />
                                                                        ) : (
                                                                            <Image className="size-3 text-blue-500" />
                                                                        )}
                                                                        <span>Berkas {idx + 1}</span>
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    ) : (
                                                        <span className="text-neutral-400 dark:text-neutral-600">-</span>
                                                    )}
                                                </td>
                                                <td className="p-4 align-top space-y-1">
                                                    <div>
                                                        {violation.pasal && getLevelBadge(violation.pasal.level)}
                                                    </div>
                                                    <div className="text-xs text-neutral-600 dark:text-neutral-400 font-medium leading-relaxed">
                                                        Sanksi: {violation.pasal?.sanction || '-'}
                                                    </div>
                                                    <div className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-1 flex items-center gap-1">
                                                        <User className="size-3 text-neutral-400" />
                                                        <span>Oleh: <strong>{violation.user?.name || 'Sistem'}</strong></span>
                                                    </div>
                                                </td>
                                                <td className="p-4 align-top text-right whitespace-nowrap">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="size-8">
                                                                <MoreVertical className="size-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-40">
                                                            <DropdownMenuItem onClick={() => handleOpenView(violation)} className="cursor-pointer flex items-center gap-2">
                                                                <Eye className="size-4 text-indigo-500" />
                                                                <span>Lihat Detail</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleOpenEdit(violation)} className="cursor-pointer flex items-center gap-2">
                                                                <Edit className="size-4 text-amber-500" />
                                                                <span>Ubah</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem asChild className="cursor-pointer">
                                                                <a
                                                                    href={route('violations.print', violation.id)}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center gap-2 w-full text-neutral-700 dark:text-neutral-300"
                                                                >
                                                                    <Printer className="size-4 text-green-500" />
                                                                    <span>Cetak SP</span>
                                                                </a>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem onClick={() => handleDelete(violation)} className="cursor-pointer flex items-center gap-2 text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20">
                                                                <Trash2 className="size-4 text-red-500" />
                                                                <span className="text-red-600 dark:text-red-400">Hapus</span>
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </td>
                                            </tr>
                                        ))}

                                        {filteredViolations.length === 0 && (
                                            <tr>
                                                <td colSpan={7} className="p-12 text-center text-neutral-500 dark:text-neutral-400">
                                                    <div className="flex flex-col items-center justify-center gap-2">
                                                        <AlertTriangle className="size-8 text-neutral-300 dark:text-neutral-700" />
                                                        <span>
                                                            {searchQuery 
                                                                ? `Pencarian "${searchQuery}" tidak cocok dengan data apapun.`
                                                                : 'Belum ada log pelanggaran disiplin murid yang tercatat.'}
                                                        </span>
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

                {/* Drawer (Sheet) for Log Violation Form */}
                <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <SheetContent className="w-full sm:max-w-[480px] overflow-y-auto text-neutral-900 dark:text-neutral-100">
                        <SheetHeader className="pb-4 border-b border-neutral-100 dark:border-neutral-800">
                            <SheetTitle className="text-xl font-bold flex items-center gap-2">
                                <Plus className="size-5 text-indigo-500" />
                                <span>Input Pelanggaran Baru</span>
                            </SheetTitle>
                            <SheetDescription>
                                Catat pelanggaran disiplin murid ke sistem.
                            </SheetDescription>
                        </SheetHeader>
                        
                        <form onSubmit={handleSubmit} className="space-y-4 py-4">
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
                                            {p.name} {p.ayat ? `(${p.ayat}${p.sub_ayat ? ` - ${p.sub_ayat}` : ''})` : ''}
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
                                    {selectedPasal.description && (
                                        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-neutral-100 dark:border-neutral-800">
                                            <span className="text-neutral-500">Isi Pasal:</span>
                                            <span className="col-span-2 font-medium text-neutral-800 dark:text-neutral-200">{selectedPasal.description}</span>
                                        </div>
                                    )}
                                    {selectedPasal.deskripsi_ayat && (
                                        <div className="grid grid-cols-3 gap-2">
                                            <span className="text-neutral-500">Deskripsi Ayat:</span>
                                            <span className="col-span-2 font-medium text-neutral-800 dark:text-neutral-200">{selectedPasal.deskripsi_ayat}</span>
                                        </div>
                                    )}
                                    {selectedPasal.keterangan && (
                                        <div className="grid grid-cols-3 gap-2">
                                            <span className="text-neutral-500">Keterangan:</span>
                                            <span className="col-span-2 font-medium text-neutral-800 dark:text-neutral-200">{selectedPasal.keterangan}</span>
                                        </div>
                                    )}
                                    <div className="grid grid-cols-3 gap-2">
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
                                    <span>Upload Bukti (Foto / PDF / Video - Bisa lebih dari 1)</span>
                                </Label>
                                <Input
                                    id="attachments"
                                    type="file"
                                    accept="image/*,application/pdf,video/*"
                                    multiple
                                    onChange={e => {
                                        const files = Array.from(e.target.files || []);
                                        form.setData('attachments', files);
                                    }}
                                />
                                <p className="text-[10px] text-neutral-450">Diterima: PDF, Gambar (JPG, PNG), Video (MP4, WEBM) - Maks. 20MB per berkas</p>
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

                            <Button type="submit" className="w-full flex items-center justify-center gap-2 cursor-pointer mt-2" disabled={form.processing}>
                                <AlertTriangle className="size-4" />
                                Log Pelanggaran
                            </Button>
                        </form>
                    </SheetContent>
                </Sheet>

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

                {/* Dialog for Carousel Attachment Preview */}
                <Dialog open={isAttachmentOpen} onOpenChange={setIsAttachmentOpen}>
                    <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden bg-neutral-950 text-white border-neutral-800">
                        {activeAttachments.length > 0 && (
                            <div className="flex flex-col h-full">
                                {/* Header */}
                                <div className="p-4 flex items-center justify-between bg-neutral-900 border-b border-neutral-800 gap-4">
                                    <div className="flex items-center gap-2">
                                        <a
                                            href={`/storage/${activeAttachments[activeAttachmentIndex]}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs bg-neutral-850 hover:bg-neutral-750 text-neutral-205 hover:text-white px-3 py-1.5 rounded-md transition-all font-semibold cursor-pointer"
                                        >
                                            Buka Tab Baru
                                        </a>
                                        <a
                                            href={`/storage/${activeAttachments[activeAttachmentIndex]}`}
                                            download
                                            className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-md transition-all font-semibold cursor-pointer"
                                        >
                                            Download
                                        </a>
                                    </div>
                                    <div className="text-right">
                                        <h3 className="text-sm font-bold tracking-wide">Lampiran Bukti Pelanggaran</h3>
                                        <p className="text-[10px] text-neutral-400 mt-0.5">
                                            Berkas {activeAttachmentIndex + 1} dari {activeAttachments.length}
                                        </p>
                                    </div>
                                </div>

                                {/* Carousel Stage */}
                                <div className="relative w-full h-[60vh] flex items-center justify-center p-2 bg-black select-none">
                                    {/* Left Arrow */}
                                    {activeAttachments.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={handlePrevAttachment}
                                            className="absolute left-4 z-10 size-10 rounded-full flex items-center justify-center bg-neutral-900/60 hover:bg-neutral-800/80 text-white transition-all cursor-pointer border border-white/10 hover:scale-105 active:scale-95"
                                            title="Sebelumnya"
                                        >
                                            <ChevronLeft className="size-6" />
                                        </button>
                                    )}

                                    {/* Content (PDF / Video / Image) */}
                                    <div className="w-full h-full flex items-center justify-center overflow-hidden">
                                        {activeAttachments[activeAttachmentIndex].toLowerCase().endsWith('.pdf') ? (
                                            <iframe
                                                src={`/storage/${activeAttachments[activeAttachmentIndex]}`}
                                                className="w-full h-full border-0 bg-white rounded-md"
                                                title={`Berkas ${activeAttachmentIndex + 1}`}
                                            />
                                        ) : activeAttachments[activeAttachmentIndex].toLowerCase().match(/\.(mp4|mov|webm|ogg|3gp)$/) ? (
                                            <video
                                                key={activeAttachmentIndex}
                                                src={`/storage/${activeAttachments[activeAttachmentIndex]}`}
                                                controls
                                                className="max-w-full max-h-full rounded-md object-contain"
                                                style={{ outline: 'none' }}
                                            />
                                        ) : (
                                            <img
                                                key={activeAttachmentIndex}
                                                src={`/storage/${activeAttachments[activeAttachmentIndex]}`}
                                                alt={`Lampiran ${activeAttachmentIndex + 1}`}
                                                className="max-w-full max-h-full object-contain rounded-md transition-all duration-300 animate-in fade-in zoom-in-95 duration-200"
                                            />
                                        )}
                                    </div>

                                    {/* Right Arrow */}
                                    {activeAttachments.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={handleNextAttachment}
                                            className="absolute right-4 z-10 size-10 rounded-full flex items-center justify-center bg-neutral-900/60 hover:bg-neutral-800/80 text-white transition-all cursor-pointer border border-white/10 hover:scale-105 active:scale-95"
                                            title="Selanjutnya"
                                        >
                                            <ChevronRight className="size-6" />
                                        </button>
                                    )}
                                </div>

                                {/* Indicators / Dots */}
                                {activeAttachments.length > 1 && (
                                    <div className="flex justify-center items-center gap-2 p-3 bg-neutral-900 border-t border-neutral-800">
                                        {activeAttachments.map((_, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => setActiveAttachmentIndex(idx)}
                                                className={`size-2.5 rounded-full transition-all duration-200 cursor-pointer ${
                                                    idx === activeAttachmentIndex
                                                        ? 'bg-indigo-500 scale-125'
                                                        : 'bg-neutral-600 hover:bg-neutral-500'
                                                }`}
                                                title={`Pindah ke Berkas ${idx + 1}`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Dialog for Violation Detail View */}
                <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
                    <DialogContent className="sm:max-w-[550px] text-neutral-900 dark:text-neutral-100">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                                <BookOpen className="size-5 text-indigo-500" />
                                <span>Detail Catatan Pelanggaran</span>
                            </DialogTitle>
                        </DialogHeader>

                        {viewingViolation && (
                            <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-1">
                                {/* Student & Date Details */}
                                <div className="p-3.5 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 space-y-2 text-sm">
                                    <div className="grid grid-cols-3 gap-2">
                                        <span className="text-neutral-500 dark:text-neutral-400">Nama Siswa:</span>
                                        <span className="col-span-2 font-bold text-neutral-900 dark:text-neutral-100">
                                            {viewingViolation.student?.name || 'Terhapus'}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <span className="text-neutral-500 dark:text-neutral-400">NIS:</span>
                                        <span className="col-span-2 font-mono text-neutral-850 dark:text-neutral-300">
                                            {viewingViolation.student?.nis || '-'}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <span className="text-neutral-500 dark:text-neutral-400">Kelas:</span>
                                        <span className="col-span-2 text-neutral-850 dark:text-neutral-300">
                                            {viewingViolation.student?.classroom?.name || '-'}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 border-t pt-2 border-neutral-100 dark:border-neutral-800">
                                        <span className="text-neutral-500 dark:text-neutral-400 font-semibold">Tanggal Kejadian:</span>
                                        <span className="col-span-2 font-bold text-indigo-600 dark:text-indigo-400">
                                            {formatDate(viewingViolation.violation_date)}
                                        </span>
                                    </div>
                                </div>

                                {/* Violation Article Details */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Rincian Pelanggaran & Pasal</h4>
                                    
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <span className="font-bold text-neutral-900 dark:text-neutral-100">
                                                    {viewingViolation.pasal?.name || 'Terhapus'}
                                                </span>
                                                <span className="text-xs text-neutral-500 dark:text-neutral-400 block mt-0.5">
                                                    {viewingViolation.pasal?.ayat ? `Ayat: ${viewingViolation.pasal.ayat}` : ''}
                                                    {viewingViolation.pasal?.sub_ayat ? ` | Sub Ayat: ${viewingViolation.pasal.sub_ayat}` : ''}
                                                </span>
                                            </div>
                                            <div>
                                                {viewingViolation.pasal && getLevelBadge(viewingViolation.pasal.level)}
                                            </div>
                                        </div>

                                        {viewingViolation.pasal?.description && (
                                            <div className="space-y-0.5">
                                                <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Isi Pasal:</span>
                                                <p className="text-neutral-700 dark:text-neutral-300 text-xs italic pl-2 border-l-2 border-neutral-300 dark:border-neutral-700">
                                                    {viewingViolation.pasal.description}
                                                </p>
                                            </div>
                                        )}

                                        {viewingViolation.pasal?.deskripsi_ayat && (
                                            <div className="space-y-0.5 mt-1.5">
                                                <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Deskripsi Ayat:</span>
                                                <p className="text-neutral-700 dark:text-neutral-300 text-xs pl-2 border-l-2 border-neutral-300 dark:border-neutral-700">
                                                    {viewingViolation.pasal.deskripsi_ayat}
                                                </p>
                                            </div>
                                        )}

                                        {viewingViolation.pasal?.keterangan && (
                                            <div className="space-y-0.5 mt-1.5">
                                                <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Keterangan:</span>
                                                <p className="text-neutral-700 dark:text-neutral-300 text-xs pl-2 border-l-2 border-neutral-300 dark:border-neutral-700">
                                                    {viewingViolation.pasal.keterangan}
                                                </p>
                                            </div>
                                        )}

                                        <div className="p-3 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30">
                                            <span className="block text-[11px] font-semibold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider mb-0.5">
                                                Sanksi Disiplin
                                            </span>
                                            <p className="text-neutral-800 dark:text-neutral-200 font-medium">
                                                {viewingViolation.pasal?.sanction || '-'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Teacher Notes */}
                                <div className="space-y-1">
                                    <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Catatan Guru:</span>
                                    <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 text-xs text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">
                                        {viewingViolation.notes || 'Tidak ada catatan.'}
                                    </div>
                                </div>

                                {/* Attachments */}
                                {viewingViolation.attachments && viewingViolation.attachments.length > 0 && (
                                    <div className="space-y-1.5">
                                        <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                                            Lampiran Bukti ({viewingViolation.attachments.length}):
                                        </span>
                                        <div className="flex flex-wrap gap-2">
                                            {viewingViolation.attachments.map((filePath, idx) => {
                                                const isPdf = filePath.toLowerCase().endsWith('.pdf');
                                                const isVideo = filePath.toLowerCase().match(/\.(mp4|mov|webm|ogg|3gp)$/);
                                                return (
                                                    <button
                                                        key={idx}
                                                        type="button"
                                                        onClick={() => {
                                                            setIsViewOpen(false); // Close view details first
                                                            handleOpenAttachments(viewingViolation.attachments || [], idx);
                                                        }}
                                                        className="inline-flex items-center gap-1 text-[11px] bg-neutral-50 hover:bg-neutral-100 text-indigo-600 hover:text-indigo-800 font-semibold border px-2 py-1 rounded-md transition-all dark:bg-neutral-900 dark:hover:bg-neutral-850 dark:text-indigo-400 dark:border-neutral-800 cursor-pointer"
                                                    >
                                                        {isPdf ? (
                                                            <FileText className="size-3 text-red-500" />
                                                        ) : isVideo ? (
                                                            <Film className="size-3 text-amber-500" />
                                                        ) : (
                                                            <Image className="size-3 text-blue-500" />
                                                        )}
                                                        <span>Berkas {idx + 1}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Admin Info */}
                                <div className="text-[10px] text-neutral-400 dark:text-neutral-500 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                                    Dicatat oleh: <strong>{viewingViolation.user?.name || 'Sistem'}</strong>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Dialog for Edit Violation */}
                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogContent className="sm:max-w-[500px] text-neutral-900 dark:text-neutral-100">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                                <Edit className="size-5 text-indigo-500" />
                                <span>Perbaiki Input Pelanggaran</span>
                            </DialogTitle>
                        </DialogHeader>

                        {editingViolation && (
                            <form onSubmit={handleEditSubmit} className="space-y-4 py-4">
                                {/* Class Selection */}
                                <div className="space-y-2">
                                    <Label htmlFor="edit_class_id">Pilih Kelas</Label>
                                    <select
                                        id="edit_class_id"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm"
                                        value={editClassId}
                                        onChange={e => {
                                            setEditClassId(e.target.value);
                                            editForm.setData('student_id', '');
                                        }}
                                        required
                                    >
                                        <option value="">-- Pilih Kelas --</option>
                                        {classrooms.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Student Selection */}
                                <div className="space-y-2">
                                    <Label htmlFor="edit_student_id">Pilih Siswa / Murid</Label>
                                    <select
                                        id="edit_student_id"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm"
                                        value={editForm.data.student_id}
                                        onChange={e => editForm.setData('student_id', e.target.value)}
                                        required
                                    >
                                        <option value="">-- Pilih Siswa --</option>
                                        {editAvailableStudents.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                    {editForm.errors.student_id && <p className="text-xs text-red-500">{editForm.errors.student_id}</p>}
                                </div>

                                {/* Pasal Selection */}
                                <div className="space-y-2">
                                    <Label htmlFor="edit_pasal_id">Pilih Pasal Pelanggaran</Label>
                                    <select
                                        id="edit_pasal_id"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm"
                                        value={editForm.data.pasal_id}
                                        onChange={e => editForm.setData('pasal_id', e.target.value)}
                                        required
                                    >
                                        <option value="">-- Pilih Pasal --</option>
                                        {pasals.map(p => (
                                            <option key={p.id} value={p.id}>
                                                {p.name} {p.ayat ? `(${p.ayat}${p.sub_ayat ? ` - ${p.sub_ayat}` : ''})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                    {editForm.errors.pasal_id && <p className="text-xs text-red-500">{editForm.errors.pasal_id}</p>}
                                </div>

                                {/* Date */}
                                <div className="space-y-2">
                                    <Label htmlFor="edit_violation_date">Tanggal Pelanggaran</Label>
                                    <Input
                                        id="edit_violation_date"
                                        type="date"
                                        value={editForm.data.violation_date}
                                        onChange={e => editForm.setData('violation_date', e.target.value)}
                                        required
                                    />
                                    {editForm.errors.violation_date && <p className="text-xs text-red-500">{editForm.errors.violation_date}</p>}
                                </div>

                                {/* Notes */}
                                <div className="space-y-2">
                                    <Label htmlFor="edit_notes">Catatan Tambahan / Guru</Label>
                                    <textarea
                                        id="edit_notes"
                                        placeholder="Tuliskan catatan tambahan mengenai pelanggaran..."
                                        className="flex min-h-[70px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                                        value={editForm.data.notes}
                                        onChange={e => editForm.setData('notes', e.target.value)}
                                    />
                                    {editForm.errors.notes && <p className="text-xs text-red-500">{editForm.errors.notes}</p>}
                                </div>

                                {/* Existing Attachments list with a remove button */}
                                {editForm.data.existing_attachments.length > 0 && (
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                                            Lampiran Aktif ({editForm.data.existing_attachments.length}):
                                        </Label>
                                        <div className="flex flex-wrap gap-2 max-h-[100px] overflow-y-auto p-1.5 border border-dashed rounded-md">
                                            {editForm.data.existing_attachments.map((filePath, idx) => (
                                                <div 
                                                    key={idx} 
                                                    className="inline-flex items-center gap-1.5 bg-neutral-50 dark:bg-neutral-900 border px-2 py-1 rounded-md text-[11px]"
                                                >
                                                    <span className="truncate max-w-[120px]">Berkas {idx + 1}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const remaining = editForm.data.existing_attachments.filter((_, i) => i !== idx);
                                                            editForm.setData('existing_attachments', remaining);
                                                        }}
                                                        className="text-red-500 hover:text-red-700 cursor-pointer"
                                                        title="Hapus Lampiran"
                                                    >
                                                        <X className="size-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* New Attachments Upload */}
                                <div className="space-y-2">
                                    <Label htmlFor="edit_attachments" className="flex items-center gap-1">
                                        <FileUp className="size-4 text-neutral-500" />
                                        <span>Unggah Bukti Baru (Foto / PDF / Video)</span>
                                    </Label>
                                    <Input
                                        id="edit_attachments"
                                        type="file"
                                        multiple
                                        accept="image/*,application/pdf,video/*"
                                        className="cursor-pointer"
                                        onChange={e => {
                                            if (e.target.files) {
                                                editForm.setData('attachments', Array.from(e.target.files));
                                            }
                                        }}
                                    />
                                    {editForm.errors.attachments && <p className="text-xs text-red-500">{editForm.errors.attachments}</p>}
                                    
                                    {editForm.data.attachments.length > 0 && (
                                        <div className="p-2 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-lg text-xs space-y-1">
                                            <p className="font-semibold text-indigo-700 dark:text-indigo-400">Berkas Baru Ditambahkan:</p>
                                            <div className="space-y-0.5">
                                                {editForm.data.attachments.map((file, index) => (
                                                    <div key={index} className="flex justify-between items-center text-[10px] text-neutral-600 dark:text-neutral-400">
                                                        <span className="truncate max-w-[200px]">{file.name}</span>
                                                        <span>({(file.size / 1024).toFixed(0)} KB)</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <DialogFooter>
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        onClick={() => {
                                            setIsEditOpen(false);
                                            setEditingViolation(null);
                                            editForm.reset();
                                        }}
                                    >
                                        Batal
                                    </Button>
                                    <Button type="submit" disabled={editForm.processing}>
                                        Simpan Perubahan
                                    </Button>
                                </DialogFooter>
                            </form>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
