import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GraduationCap, Users, AlertTriangle, HeartHandshake, Plus, ArrowRight, ShieldCheck, Scale, Search, X, FileText, ClipboardList, User } from 'lucide-react';

interface DashboardStats {
    classrooms: number;
    students: number;
    activeViolations: number;
    remisedViolations: number;
}

interface Student {
    id: number;
    name: string;
    nis: string | null;
    classroom_id: number;
    classroom?: {
        id: number;
        name: string;
    };
}

interface Classroom {
    id: number;
    name: string;
}

interface Violation {
    id: number;
    student_id: number;
    pasal_id: number;
    notes: string | null;
    violation_date: string;
    student?: {
        id: number;
        name: string;
        classroom?: {
            id: number;
            name: string;
        };
    };
    pasal?: {
        id: number;
        name: string;
        ayat: string | null;
        level: 'ringan' | 'sedang' | 'berat';
        sanction: string;
    };
    user?: {
        id: number;
        name: string;
    };
}

interface SearchResults {
    students: Student[];
    classrooms: Classroom[];
    violations: Violation[];
}

interface Props {
    stats: DashboardStats;
    searchResults: SearchResults | null;
    searchQuery: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard({ stats, searchResults, searchQuery }: Props) {
    const [searchQ, setSearchQ] = useState(searchQuery || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQ.trim()) {
            router.get(route('dashboard'), { q: searchQ }, { preserveState: true });
        } else {
            router.get(route('dashboard'));
        }
    };

    const handleClearSearch = () => {
        setSearchQ('');
        router.get(route('dashboard'));
    };

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

    const hasResults = searchResults && (
        searchResults.students.length > 0 ||
        searchResults.classrooms.length > 0 ||
        searchResults.violations.length > 0
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                
                {/* Google-like Search Bar Card */}
                <div className="flex flex-col items-center justify-center py-6 text-center">
                    <h2 className="text-xl font-bold text-neutral-850 dark:text-neutral-100 flex items-center gap-1.5 mb-4">
                        <Search className="size-5 text-indigo-500" />
                        <span>Pencarian Cepat Tanse Alsen 22</span>
                    </h2>
                    
                    <form onSubmit={handleSearch} className="w-full max-w-2xl relative px-1">
                        <div className="relative flex items-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 rounded-full shadow-xs hover:shadow-md focus-within:shadow-md focus-within:border-indigo-400 dark:focus-within:border-indigo-500 transition-all">
                            <Search className="absolute left-4 size-5 text-neutral-400" />
                            <input
                                type="text"
                                className="w-full h-12 pl-12 pr-24 bg-transparent rounded-full text-sm outline-none border-none focus:ring-0 focus:outline-hidden dark:text-neutral-50"
                                placeholder="Masukkan nama murid, kelas, atau jenis pelanggaran..."
                                value={searchQ}
                                onChange={e => setSearchQ(e.target.value)}
                            />
                            {searchQ && (
                                <button
                                    type="button"
                                    onClick={handleClearSearch}
                                    className="absolute right-14 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 p-1 rounded-full transition-all"
                                    title="Bersihkan Pencarian"
                                >
                                    <X className="size-4" />
                                </button>
                            )}
                            <button
                                type="submit"
                                className="absolute right-2.5 p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-650 dark:hover:bg-indigo-750 transition-all"
                            >
                                <Search className="size-4" />
                            </button>
                        </div>
                    </form>
                    <p className="text-[10px] text-neutral-400 mt-2">Cari murid disiplin, nama kelas, pasal aturan, atau catatan log dengan sekali ketik.</p>
                </div>

                {/* Conditional rendering for Search Results vs Normal Dashboard view */}
                {searchResults !== null ? (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between border-b pb-3 border-neutral-200 dark:border-neutral-800">
                            <div>
                                <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-50">Hasil Pencarian untuk: <span className="text-indigo-600 dark:text-indigo-400">"{searchQuery}"</span></h3>
                                <p className="text-xs text-neutral-500">Menemukan {
                                    (searchResults.students.length) + 
                                    (searchResults.classrooms.length) + 
                                    (searchResults.violations.length)
                                } hasil kecocokan data.</p>
                            </div>
                            <Button variant="outline" size="sm" onClick={handleClearSearch}>
                                Kembali ke Dashboard
                            </Button>
                        </div>

                        {!hasResults ? (
                            <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-xl bg-neutral-50/50 dark:border-neutral-850">
                                <X className="size-10 text-neutral-300 dark:text-neutral-700 mb-2" />
                                <h4 className="font-semibold text-sm text-neutral-850 dark:text-neutral-150">Tidak ada data cocok</h4>
                                <p className="text-xs text-neutral-500 mt-1 max-w-sm text-center">Silakan periksa kembali ejaan kata kunci pencarian Anda untuk mencari kelas, nama murid, atau poin pelanggaran.</p>
                            </div>
                        ) : (
                            <div className="grid gap-6 md:grid-cols-3">
                                {/* Students Result */}
                                <Card className="border">
                                    <CardHeader className="pb-3 border-b border-neutral-100 dark:border-neutral-850">
                                        <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                                            <Users className="size-4.5 text-indigo-500" />
                                            <span>Siswa/Murid ({searchResults.students.length})</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-3 divide-y divide-neutral-100 dark:divide-neutral-800">
                                        {searchResults.students.map(student => (
                                            <div key={student.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between">
                                                <div>
                                                    <div className="text-xs font-semibold text-neutral-850 dark:text-neutral-150">{student.name}</div>
                                                    <div className="text-[10px] text-neutral-500">NIS: {student.nis || '-'} • Kelas: {student.classroom?.name || '-'}</div>
                                                </div>
                                                <Link 
                                                    href={`/violations?q=${encodeURIComponent(student.name)}`}
                                                    className="inline-flex items-center gap-1 text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold dark:text-indigo-400"
                                                >
                                                    Kelola / Log <ArrowRight className="size-3" />
                                                </Link>
                                            </div>
                                        ))}
                                        {searchResults.students.length === 0 && (
                                            <p className="text-[11px] text-neutral-500 py-4 text-center">Siswa tidak ditemukan.</p>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Classrooms Result */}
                                <Card className="border">
                                    <CardHeader className="pb-3 border-b border-neutral-100 dark:border-neutral-850">
                                        <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                                            <GraduationCap className="size-4.5 text-indigo-500" />
                                            <span>Kelas ({searchResults.classrooms.length})</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-3 divide-y divide-neutral-100 dark:divide-neutral-800">
                                        {searchResults.classrooms.map(classroom => (
                                            <div key={classroom.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between">
                                                <div className="text-xs font-semibold text-neutral-850 dark:text-neutral-150">Kelas {classroom.name}</div>
                                                <Link 
                                                    href={`/violations?q=${encodeURIComponent(classroom.name)}`}
                                                    className="inline-flex items-center gap-1 text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold dark:text-indigo-400"
                                                >
                                                    Lihat Log Kelas <ArrowRight className="size-3" />
                                                </Link>
                                            </div>
                                        ))}
                                        {searchResults.classrooms.length === 0 && (
                                            <p className="text-[11px] text-neutral-500 py-4 text-center">Kelas tidak ditemukan.</p>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Violations Result */}
                                <Card className="border md:col-span-1">
                                    <CardHeader className="pb-3 border-b border-neutral-100 dark:border-neutral-850">
                                        <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                                            <AlertTriangle className="size-4.5 text-indigo-500" />
                                            <span>Kasus Pelanggaran ({searchResults.violations.length})</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-3 divide-y divide-neutral-100 dark:divide-neutral-800 max-h-[350px] overflow-y-auto pr-1">
                                        {searchResults.violations.map(v => (
                                            <div key={v.id} className="py-3 first:pt-0 last:pb-0 space-y-1.5 border-b last:border-0 pb-3 last:pb-0 border-neutral-100 dark:border-neutral-850">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <div className="text-xs font-bold text-neutral-900 dark:text-neutral-100">{v.student?.name}</div>
                                                        <div className="text-[10px] text-neutral-500">Kelas: {v.student?.classroom?.name} • {formatDate(v.violation_date)}</div>
                                                    </div>
                                                    {v.pasal && getLevelBadge(v.pasal.level)}
                                                </div>
                                                <div className="text-xs text-neutral-700 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-900 p-2 rounded-md border border-neutral-100 dark:border-neutral-850">
                                                    <strong>Pasal:</strong> {v.pasal?.name} {v.pasal?.ayat && `(${v.pasal.ayat})`}
                                                    {v.notes && <div className="mt-1 text-[11px] italic">"{v.notes}"</div>}
                                                </div>
                                                <div className="flex justify-end">
                                                    <Link 
                                                        href={`/violations?q=${encodeURIComponent(v.student?.name || '')}`}
                                                        className="inline-flex items-center gap-1 text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold dark:text-indigo-400"
                                                    >
                                                        Lihat Detail <ArrowRight className="size-3" />
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                        {searchResults.violations.length === 0 && (
                                            <p className="text-[11px] text-neutral-500 py-4 text-center">Log pelanggaran tidak ditemukan.</p>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Welcome Card */}
                        <div className="rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 p-6 md:p-8 text-white shadow-md relative overflow-hidden">
                            <div className="absolute top-0 right-0 transform translate-x-1/6 -translate-y-1/6 opacity-10">
                                <Scale className="w-80 h-80" />
                            </div>
                            <div className="relative z-10 max-w-2xl space-y-2.5">
                                <div className="inline-flex items-center rounded-full px-2.5 py-0.5 bg-white/20 hover:bg-white/20 border-0 text-white font-semibold text-xs tracking-wider uppercase backdrop-blur-xs">
                                    Sistem Disiplin & Konseling
                                </div>
                                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Selamat Datang di Tanse Alsen 22</h1>
                                <p className="text-indigo-100 text-sm md:text-base leading-relaxed">
                                    Aplikasi pemantauan perilaku dan pembinaan kedisiplinan siswa secara berkeadilan restoratif. Catat pelanggaran, kelola kelas, kelola pasal, dan pantau perkembangan karakter murid dengan mudah.
                                </p>
                            </div>
                        </div>

                        {/* Informative Stats Row */}
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {/* Classrooms */}
                            <Card className="border hover:shadow-md transition-all">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Jumlah Kelas</CardTitle>
                                    <div className="rounded-lg bg-indigo-50 p-2 text-indigo-650 dark:bg-indigo-950/30 dark:text-indigo-400">
                                        <GraduationCap className="size-4" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.classrooms}</div>
                                    <Link href="/classrooms" className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-0.5 mt-1 dark:text-indigo-400 dark:hover:text-indigo-300">
                                        Kelola Kelas <ArrowRight className="size-3" />
                                    </Link>
                                </CardContent>
                            </Card>

                            {/* Students */}
                            <Card className="border hover:shadow-md transition-all">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Jumlah Murid</CardTitle>
                                    <div className="rounded-lg bg-indigo-50 p-2 text-indigo-650 dark:bg-indigo-950/30 dark:text-indigo-400">
                                        <Users className="size-4" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.students}</div>
                                    <Link href="/classrooms" className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-0.5 mt-1 dark:text-indigo-400 dark:hover:text-indigo-300">
                                        Lihat Siswa <ArrowRight className="size-3" />
                                    </Link>
                                </CardContent>
                            </Card>

                            {/* Active Violations */}
                            <Card className="border hover:shadow-md transition-all">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Pelanggaran Aktif</CardTitle>
                                    <div className="rounded-lg bg-red-50 p-2 text-red-650 dark:bg-red-950/30 dark:text-red-400">
                                        <AlertTriangle className="size-4 animate-pulse" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-red-605 dark:text-red-400">{stats.activeViolations}</div>
                                    <Link href="/violations" className="text-[11px] text-red-600 hover:text-red-800 font-semibold inline-flex items-center gap-0.5 mt-1 dark:text-red-400 dark:hover:text-red-300">
                                        Log Pelanggaran <ArrowRight className="size-3" />
                                    </Link>
                                </CardContent>
                            </Card>

                            {/* Remised Violations */}
                            <Card className="border hover:shadow-md transition-all">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Kasus Diremisi</CardTitle>
                                    <div className="rounded-lg bg-green-50 p-2 text-green-650 dark:bg-green-950/30 dark:text-green-400">
                                        <HeartHandshake className="size-4" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-green-650 dark:text-green-400">{stats.remisedViolations}</div>
                                    <Link href="/remissions" className="text-[11px] text-green-600 hover:text-green-800 font-semibold inline-flex items-center gap-0.5 mt-1 dark:text-green-400 dark:hover:text-green-300">
                                        Lihat Remisi <ArrowRight className="size-3" />
                                    </Link>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Quick Actions Grid */}
                        <Card className="border">
                            <CardHeader>
                                <CardTitle className="text-base font-bold">Aksi Cepat & Navigasi</CardTitle>
                                <CardDescription className="text-xs">Jalan pintas menuju halaman utama pengelolaan sekolah.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <Link href="/violations" className="group flex flex-col p-4 rounded-xl border border-neutral-200 hover:border-indigo-300 hover:bg-neutral-50/50 transition-all dark:border-neutral-800 dark:hover:bg-neutral-900/50 text-left">
                                    <div className="size-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform dark:bg-indigo-950/30 dark:text-indigo-400">
                                        <Plus className="size-4" />
                                    </div>
                                    <div className="text-xs font-bold text-neutral-900 dark:text-neutral-50">Catat Pelanggaran</div>
                                    <div className="text-[10px] text-neutral-505 mt-1">Input kasus pelanggaran aturan sekolah baru siswa.</div>
                                </Link>

                                <Link href="/classrooms" className="group flex flex-col p-4 rounded-xl border border-neutral-200 hover:border-indigo-300 hover:bg-neutral-50/50 transition-all dark:border-neutral-800 dark:hover:bg-neutral-900/50 text-left">
                                    <div className="size-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform dark:bg-indigo-950/30 dark:text-indigo-400">
                                        <GraduationCap className="size-4" />
                                    </div>
                                    <div className="text-xs font-bold text-neutral-900 dark:text-neutral-50">Kelola Kelas & Siswa</div>
                                    <div className="text-[10px] text-neutral-505 mt-1">Registrasi kelas dan import daftar nama dari Excel.</div>
                                </Link>

                                <Link href="/remissions" className="group flex flex-col p-4 rounded-xl border border-neutral-200 hover:border-indigo-300 hover:bg-neutral-50/50 transition-all dark:border-neutral-800 dark:hover:bg-neutral-900/50 text-left">
                                    <div className="size-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform dark:bg-indigo-950/30 dark:text-indigo-400">
                                        <HeartHandshake className="size-4" />
                                    </div>
                                    <div className="text-xs font-bold text-neutral-900 dark:text-neutral-50">Proses Remisi</div>
                                    <div className="text-[10px] text-neutral-550 mt-1">Beri keringanan status pelanggaran aktif murid.</div>
                                </Link>

                                <Link href="/statistics" className="group flex flex-col p-4 rounded-xl border border-neutral-200 hover:border-indigo-300 hover:bg-neutral-50/50 transition-all dark:border-neutral-800 dark:hover:bg-neutral-900/50 text-left">
                                    <div className="size-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform dark:bg-indigo-950/30 dark:text-indigo-400">
                                        <ShieldCheck className="size-4" />
                                    </div>
                                    <div className="text-xs font-bold text-neutral-900 dark:text-neutral-50">Statistik Pelanggaran</div>
                                    <div className="text-[10px] text-neutral-550 mt-1">Analisis perkembangan, rasio remisi, dan laporan bulanan.</div>
                                </Link>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
