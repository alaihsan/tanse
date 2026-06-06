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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Trash2, Users, Plus, X, GraduationCap, ShieldCheck, AlertTriangle, Calendar, User, FileText, ClipboardList, ArrowLeftRight, Image } from 'lucide-react';

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
    pasal?: Pasal;
    user?: Teacher;
}

interface Student {
    id: number;
    nis: string | null;
    name: string;
    classroom_id: number;
    violations: Violation[];
}

interface Classroom {
    id: number;
    name: string;
    students: Student[];
}

interface Props {
    classrooms: Classroom[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Kelola Kelas',
        href: '/classrooms',
    },
];

export default function ClassroomsIndex({ classrooms }: Props) {
    const [isAddClassOpen, setIsAddClassOpen] = useState(false);
    const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);
    const [selectedStudentForHistory, setSelectedStudentForHistory] = useState<Student | null>(null);
    const [selectedStudentForMutation, setSelectedStudentForMutation] = useState<Student | null>(null);
    const [activeImportTab, setActiveImportTab] = useState<'single' | 'excel'>('single');
    const [excelText, setExcelText] = useState('');
    const [excelData, setExcelData] = useState<{ nis: string; name: string }[]>([]);

    // Form for Adding Class
    const classForm = useForm({
        name: '',
    });

    // Form for Adding Single Student
    const studentForm = useForm({
        nis: '',
        name: '',
    });

    // Form for Student Mutation
    const mutationForm = useForm({
        classroom_id: '',
    });

    const handleMutateStudent = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStudentForMutation) return;
        
        mutationForm.post(route('students.mutate', selectedStudentForMutation.id), {
            onSuccess: () => {
                setSelectedStudentForMutation(null);
                mutationForm.reset();
                setSelectedClassroom(null);
            },
        });
    };

    const handleCreateClass = (e: React.FormEvent) => {
        e.preventDefault();
        classForm.post(route('classrooms.store'), {
            onSuccess: () => {
                classForm.reset();
                setIsAddClassOpen(false);
            },
        });
    };

    const handleCreateStudent = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedClassroom) return;
        studentForm.post(route('classrooms.students.store', selectedClassroom.id), {
            onSuccess: () => {
                studentForm.reset();
                // Refresh local state for selected classroom
                const updatedClass = classrooms.find(c => c.id === selectedClassroom.id);
                if (updatedClass) {
                    setSelectedClassroom(updatedClass);
                }
            },
        });
    };

    const handleExcelParse = (text: string) => {
        setExcelText(text);
        const rows = text.split(/\r?\n/);
        const parsed: { nis: string; name: string }[] = [];
        rows.forEach(row => {
            if (row.trim() === '') return;
            const cols = row.split('\t');
            if (cols.length >= 2) {
                parsed.push({
                    nis: cols[0].trim(),
                    name: cols[1].trim(),
                });
            } else if (cols.length === 1) {
                parsed.push({
                    nis: '',
                    name: cols[0].trim(),
                });
            }
        });
        setExcelData(parsed);
    };

    const handleBulkSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedClassroom || excelData.length === 0) return;
        
        router.post(route('classrooms.students.bulk', selectedClassroom.id), {
            students: excelData
        }, {
            onSuccess: () => {
                setExcelData([]);
                setExcelText('');
                // Refresh local state
                const updatedClass = classrooms.find(c => c.id === selectedClassroom.id);
                if (updatedClass) {
                    setSelectedClassroom(updatedClass);
                }
            },
        });
    };

    const handleDeleteClass = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus kelas ini beserta seluruh data murid di dalamnya?')) {
            router.delete(route('classrooms.destroy', id));
        }
    };

    const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
    const [confirmDeleteInput, setConfirmDeleteInput] = useState('');

    const handleDeleteStudent = (student: Student) => {
        setStudentToDelete(student);
        setConfirmDeleteInput('');
    };

    const handleConfirmDeleteStudent = (e: React.FormEvent) => {
        e.preventDefault();
        if (confirmDeleteInput !== 'HAPUS' || !studentToDelete) return;
        
        router.delete(route('students.destroy', studentToDelete.id), {
            onSuccess: () => {
                setStudentToDelete(null);
                setConfirmDeleteInput('');
                if (selectedClassroom) {
                    const updatedClass = classrooms.find(c => c.id === selectedClassroom.id);
                    if (updatedClass) {
                        setSelectedClassroom(updatedClass);
                    }
                }
            }
        });
    };

    const handleShowHistory = (student: Student) => {
        setSelectedStudentForHistory(student);
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kelola Kelas" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">Kelola Kelas</h1>
                        <p className="text-neutral-500 dark:text-neutral-400">Buat dan kelola data kelas beserta daftar nama murid dan riwayat pelanggaran.</p>
                    </div>
                    
                    <Dialog open={isAddClassOpen} onOpenChange={setIsAddClassOpen}>
                        <DialogTrigger asChild>
                            <Button className="flex items-center gap-2">
                                <Plus className="size-4" />
                                Tambah Kelas
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Tambah Kelas Baru</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleCreateClass} className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="className">Nama Kelas</Label>
                                    <Input
                                        id="className"
                                        placeholder="Contoh: X IPA 1, XII IPS 2"
                                        value={classForm.data.name}
                                        onChange={e => classForm.setData('name', e.target.value)}
                                        required
                                        autoFocus
                                    />
                                    {classForm.errors.name && (
                                        <p className="text-sm text-red-500">{classForm.errors.name}</p>
                                    )}
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsAddClassOpen(false)}>
                                        Batal
                                    </Button>
                                    <Button type="submit" disabled={classForm.processing}>
                                        Simpan
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {classrooms.map(classroom => (
                        <Card key={classroom.id} className="relative overflow-hidden transition-all hover:shadow-md">
                            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                <div className="space-y-1">
                                    <CardTitle className="text-lg font-bold">{classroom.name}</CardTitle>
                                    <CardDescription className="flex items-center gap-1.5 mt-1">
                                        <Users className="size-4 text-neutral-400" />
                                        <span>{classroom.students.length} Murid</span>
                                    </CardDescription>
                                </div>
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                                    <GraduationCap className="size-5" />
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-2">
                                    <Button 
                                        variant="outline" 
                                        className="w-full"
                                        onClick={() => {
                                            setSelectedClassroom(classroom);
                                            setActiveImportTab('single');
                                        }}
                                    >
                                        Kelola Murid
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50"
                                        onClick={() => handleDeleteClass(classroom.id)}
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {classrooms.length === 0 && (
                        <div className="col-span-full flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 p-8 text-center dark:border-neutral-700">
                            <GraduationCap className="size-12 text-neutral-300 dark:text-neutral-700" />
                            <h3 className="mt-4 text-lg font-semibold text-neutral-900 dark:text-neutral-50">Belum ada kelas</h3>
                            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400 max-w-sm">
                                Silakan buat kelas baru untuk mulai menginput data murid.
                            </p>
                            <Button className="mt-4" onClick={() => setIsAddClassOpen(true)}>
                                Tambah Kelas Baru
                            </Button>
                        </div>
                    )}
                </div>

                {/* Sheet to manage students */}
                <Sheet open={selectedClassroom !== null} onOpenChange={(open) => !open && setSelectedClassroom(null)}>
                    {selectedClassroom && (
                        <SheetContent className="sm:max-w-lg overflow-y-auto">
                            <SheetHeader>
                                <SheetTitle>Kelola Murid: {selectedClassroom.name}</SheetTitle>
                                <SheetDescription>
                                    Tambah murid (manual atau import Excel) dan kelola daftarnya.
                                </SheetDescription>
                            </SheetHeader>
                            
                            <div className="space-y-6 py-6">
                                {/* Navigation for Import Mode */}
                                <div className="flex border-b border-neutral-200 dark:border-neutral-800">
                                    <button
                                        className={`py-2 px-4 text-sm font-semibold border-b-2 transition-all ${
                                            activeImportTab === 'single'
                                                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                                : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                                        }`}
                                        onClick={() => setActiveImportTab('single')}
                                    >
                                        Tambah Satu
                                    </button>
                                    <button
                                        className={`py-2 px-4 text-sm font-semibold border-b-2 transition-all ${
                                            activeImportTab === 'excel'
                                                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                                : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                                        }`}
                                        onClick={() => setActiveImportTab('excel')}
                                    >
                                        Import dari Excel
                                    </button>
                                </div>

                                {activeImportTab === 'single' ? (
                                    /* Form to Add Single Student */
                                    <form onSubmit={handleCreateStudent} className="space-y-4">
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="studentNis">NIS (Opsional)</Label>
                                                <Input
                                                    id="studentNis"
                                                    placeholder="Contoh: 10243"
                                                    value={studentForm.data.nis}
                                                    onChange={e => studentForm.setData('nis', e.target.value)}
                                                />
                                                {studentForm.errors.nis && (
                                                    <p className="text-xs text-red-500">{studentForm.errors.nis}</p>
                                                )}
                                            </div>
                                            <div className="col-span-2 space-y-2">
                                                <Label htmlFor="studentName">Nama Lengkap</Label>
                                                <Input
                                                    id="studentName"
                                                    placeholder="Nama lengkap murid..."
                                                    value={studentForm.data.name}
                                                    onChange={e => studentForm.setData('name', e.target.value)}
                                                    required
                                                />
                                                {studentForm.errors.name && (
                                                    <p className="text-xs text-red-500">{studentForm.errors.name}</p>
                                                )}
                                            </div>
                                        </div>
                                        <Button type="submit" disabled={studentForm.processing} className="w-full">
                                            <Plus className="size-4 mr-2" /> Tambah Murid
                                        </Button>
                                    </form>
                                ) : (
                                    /* Excel Bulk Import Interface */
                                    <form onSubmit={handleBulkSubmit} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="excel_textarea">Paste Data dari Excel (Kolom 1: NIS, Kolom 2: Nama)</Label>
                                            <Card className="p-2.5 bg-neutral-50 dark:bg-neutral-900 border border-dashed text-xs text-neutral-500 dark:text-neutral-400">
                                                <strong>Tip:</strong> Di Microsoft Excel, sorot kolom NIS dan Nama siswa, salin (Ctrl+C), kemudian paste di kotak teks di bawah ini.
                                            </Card>
                                            <textarea
                                                id="excel_textarea"
                                                rows={5}
                                                placeholder="Contoh format paste:&#10;10231&#9;Andi Wijaya&#10;10232&#9;Budi Prasetyo"
                                                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[120px]"
                                                value={excelText}
                                                onChange={e => handleExcelParse(e.target.value)}
                                                required
                                            />
                                        </div>

                                        {excelData.length > 0 && (
                                            <div className="space-y-2">
                                                <Label className="text-xs font-semibold text-neutral-500">Preview Data Terdeteksi ({excelData.length} siswa)</Label>
                                                <div className="max-h-[160px] overflow-y-auto border rounded-md">
                                                    <table className="w-full text-left text-xs border-collapse">
                                                        <thead>
                                                            <tr className="bg-neutral-50 border-b dark:bg-neutral-900 font-semibold text-neutral-500">
                                                                <th className="p-2 border-r">NIS</th>
                                                                <th className="p-2">Nama</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {excelData.map((row, idx) => (
                                                                <tr key={idx} className="border-b last:border-0">
                                                                    <td className="p-2 border-r font-mono text-neutral-600 dark:text-neutral-400">{row.nis || '-'}</td>
                                                                    <td className="p-2 font-medium">{row.name}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}

                                        <Button type="submit" className="w-full flex items-center justify-center gap-2" disabled={excelData.length === 0}>
                                            <Plus className="size-4" /> Import {excelData.length > 0 ? `${excelData.length} ` : ''}Siswa
                                        </Button>
                                    </form>
                                )}

                                <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4">
                                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50 mb-3 flex items-center justify-between">
                                        <span>Daftar Murid</span>
                                        <Badge variant="secondary">{selectedClassroom.students.length}</Badge>
                                    </h3>
                                    
                                    <div className="max-h-[50vh] overflow-y-auto space-y-2 pr-1">
                                        {selectedClassroom.students.map(student => (
                                            <div 
                                                key={student.id} 
                                                className="flex items-center justify-between p-3 rounded-lg border border-neutral-200 bg-white hover:border-indigo-200 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-indigo-900/50 transition-all"
                                            >
                                                <div 
                                                    className="flex flex-col cursor-pointer flex-1 mr-2"
                                                    onClick={() => handleShowHistory(student)}
                                                >
                                                    <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                                        {student.name}
                                                    </span>
                                                    {student.nis && (
                                                        <span className="text-xs text-neutral-500 font-mono mt-0.5">
                                                            NIS: {student.nis}
                                                        </span>
                                                    )}
                                                    <span className="text-xs text-indigo-500 mt-1 flex items-center gap-1 font-medium">
                                                        <ClipboardList className="size-3" />
                                                        <span>{student.violations.length} Pelanggaran (Klik untuk Riwayat)</span>
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="size-8 text-neutral-450 hover:text-indigo-500 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                                                        onClick={() => {
                                                            setSelectedStudentForMutation(student);
                                                            mutationForm.setData('classroom_id', String(student.classroom_id));
                                                        }}
                                                        title="Mutasi Kelas"
                                                    >
                                                        <ArrowLeftRight className="size-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="size-8 text-neutral-400 hover:text-red-500 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                                                        onClick={() => handleDeleteStudent(student)}
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}

                                        {selectedClassroom.students.length === 0 && (
                                            <p className="text-center text-sm text-neutral-500 py-6 dark:text-neutral-400">
                                                Belum ada murid di kelas ini.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </SheetContent>
                    )}
                </Sheet>

                {/* Dialog for Student Violation History */}
                <Dialog open={selectedStudentForHistory !== null} onOpenChange={(open) => !open && setSelectedStudentForHistory(null)}>
                    <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto">
                        {selectedStudentForHistory && (
                            <>
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                                        <AlertTriangle className="size-5 text-indigo-500" />
                                        <span>Riwayat Pelanggaran: {selectedStudentForHistory.name}</span>
                                    </DialogTitle>
                                    {selectedStudentForHistory.nis && (
                                        <p className="text-sm text-neutral-500 font-mono">NIS: {selectedStudentForHistory.nis}</p>
                                    )}
                                </DialogHeader>
                                
                                <div className="py-4 space-y-4">
                                    {selectedStudentForHistory.violations.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center border rounded-xl border-dashed p-10 text-center bg-green-50/20 border-green-200 dark:bg-green-950/10 dark:border-green-900/30">
                                            <ShieldCheck className="size-16 text-green-500 animate-pulse" />
                                            <h3 className="mt-4 text-lg font-bold text-green-700 dark:text-green-400">Bebas Pelanggaran</h3>
                                            <p className="mt-2 text-sm text-green-600/80 dark:text-green-500/80">
                                                Murid ini bebas pelanggaran. Disiplin yang sangat baik!
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <p className="text-sm text-neutral-500">Berikut adalah daftar pelanggaran yang dilakukan oleh siswa ini:</p>
                                            <div className="space-y-4 border-l border-indigo-100 dark:border-indigo-950 ml-3 pl-5 relative">
                                                {selectedStudentForHistory.violations.map((violation, idx) => (
                                                    <div key={violation.id} className="relative group">
                                                        {/* Icon node in timeline */}
                                                        <span className="absolute -left-[30px] top-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-50 text-indigo-500 border border-white dark:bg-indigo-950 dark:text-indigo-400 dark:border-neutral-950">
                                                            <Calendar className="size-3" />
                                                        </span>
                                                        
                                                        <div className="p-4 rounded-xl border bg-white dark:bg-neutral-900 space-y-2.5 shadow-xs transition-shadow hover:shadow-md">
                                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
                                                                <span className="text-xs font-semibold text-neutral-500 flex items-center gap-1.5">
                                                                    <span>{formatDate(violation.violation_date)}</span>
                                                                </span>
                                                                <div>
                                                                    {violation.pasal && getLevelBadge(violation.pasal.level)}
                                                                </div>
                                                            </div>
                                                            
                                                            <div>
                                                                <h4 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                                                                    {violation.pasal?.name || 'Pasal Terhapus'}
                                                                </h4>
                                                                {violation.pasal?.ayat && (
                                                                    <p className="text-xs text-neutral-500 mt-0.5">{violation.pasal.ayat}</p>
                                                                )}
                                                            </div>
                                                            
                                                            <div className="text-xs text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-950 p-2.5 rounded-md border">
                                                                <div className="font-semibold text-neutral-750 dark:text-neutral-300">Sanksi:</div>
                                                                <div>{violation.pasal?.sanction || '-'}</div>
                                                            </div>

                                                            {violation.notes && (
                                                                <div className="text-xs text-neutral-600 dark:text-neutral-400">
                                                                    <span className="font-semibold block mb-0.5">Catatan Guru:</span>
                                                                    <span className="italic">"{violation.notes}"</span>
                                                                </div>
                                                            )}

                                                            {violation.attachments && violation.attachments.length > 0 && (
                                                                <div className="text-xs space-y-1">
                                                                    <span className="font-semibold block">Lampiran Bukti ({violation.attachments.length}):</span>
                                                                    <div className="flex flex-wrap gap-2 pt-0.5">
                                                                        {violation.attachments.map((filePath, fileIdx) => {
                                                                            const isPdf = filePath.toLowerCase().endsWith('.pdf');
                                                                            return (
                                                                                <a
                                                                                    key={fileIdx}
                                                                                    href={`/storage/${filePath}`}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="inline-flex items-center gap-1.5 bg-neutral-50 hover:bg-neutral-100 text-indigo-650 hover:text-indigo-850 font-semibold border px-2 py-1 rounded-md transition-all text-[11px] dark:bg-neutral-900 dark:hover:bg-neutral-850 dark:text-indigo-400 dark:border-neutral-800"
                                                                                >
                                                                                    {isPdf ? (
                                                                                        <FileText className="size-3 text-red-500" />
                                                                                    ) : (
                                                                                        <Image className="size-3 text-blue-500" />
                                                                                    )}
                                                                                    <span>Berkas {fileIdx + 1}</span>
                                                                                </a>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            <div className="text-[11px] text-neutral-400 dark:text-neutral-500 pt-2 border-t flex items-center gap-1">
                                                                <User className="size-3 text-neutral-400" />
                                                                <span>Pelanggaran ini di isi oleh: <strong>{violation.user?.name || 'Sistem'}</strong></span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                <DialogFooter>
                                    <Button onClick={() => setSelectedStudentForHistory(null)}>
                                        Tutup
                                    </Button>
                                </DialogFooter>
                            </>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Dialog for Student Mutation */}
                <Dialog open={selectedStudentForMutation !== null} onOpenChange={(open) => !open && setSelectedStudentForMutation(null)}>
                    <DialogContent className="sm:max-w-[425px]">
                        {selectedStudentForMutation && (
                            <>
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                        <ArrowLeftRight className="size-5 text-indigo-500" />
                                        <span>Mutasi Kelas: {selectedStudentForMutation.name}</span>
                                    </DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleMutateStudent} className="space-y-4 py-4">
                                    <p className="text-sm text-neutral-500">
                                        Pindahkan siswa ini ke kelas lain. Riwayat pelanggaran yang ada akan tetap melekat pada siswa.
                                    </p>
                                    <div className="space-y-2">
                                        <Label htmlFor="destinationClass">Pilih Kelas Baru</Label>
                                        <select
                                            id="destinationClass"
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            value={mutationForm.data.classroom_id}
                                            onChange={e => mutationForm.setData('classroom_id', e.target.value)}
                                            required
                                        >
                                            <option value="" disabled>Pilih Kelas...</option>
                                            {classrooms
                                                .filter(c => c.id !== selectedStudentForMutation.classroom_id)
                                                .map(c => (
                                                    <option key={c.id} value={c.id}>
                                                        {c.name}
                                                    </option>
                                                ))
                                            }
                                        </select>
                                        {mutationForm.errors.classroom_id && (
                                            <p className="text-sm text-red-500">{mutationForm.errors.classroom_id}</p>
                                        )}
                                    </div>
                                    <DialogFooter>
                                        <Button type="button" variant="outline" onClick={() => setSelectedStudentForMutation(null)}>
                                            Batal
                                        </Button>
                                        <Button type="submit" disabled={mutationForm.processing}>
                                            Mutasi Siswa
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Dialog for Student Delete Confirmation */}
                <Dialog open={studentToDelete !== null} onOpenChange={(open) => !open && setStudentToDelete(null)}>
                    <DialogContent className="sm:max-w-[425px]">
                        {studentToDelete && (
                            <>
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2 text-red-600">
                                        <AlertTriangle className="size-5" />
                                        <span>Konfirmasi Hapus Murid</span>
                                    </DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleConfirmDeleteStudent} className="space-y-4 py-4">
                                    <p className="text-sm text-neutral-500">
                                        Apakah Anda yakin ingin menghapus data murid <strong>{studentToDelete.name}</strong>? Tindakan ini tidak dapat dibatalkan dan akan menghapus seluruh riwayat pelanggaran murid ini.
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
                                        <Button type="button" variant="outline" onClick={() => setStudentToDelete(null)}>
                                            Batal
                                        </Button>
                                        <Button 
                                            type="submit" 
                                            variant="destructive"
                                            disabled={confirmDeleteInput !== 'HAPUS'}
                                            className="bg-red-600 hover:bg-red-700 text-white"
                                        >
                                            Hapus Murid
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
