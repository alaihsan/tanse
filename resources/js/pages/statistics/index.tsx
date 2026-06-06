import { useState } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, AlertTriangle, ShieldCheck, HeartHandshake, Award, Users, GraduationCap, ChevronRight, BookOpen } from 'lucide-react';

interface Classroom {
    id: number;
    name: string;
    violations_count?: number;
}

interface Student {
    id: number;
    name: string;
    classroom_id: number;
    violations_count?: number;
    classroom?: Classroom;
}

interface MonthlyTrend {
    label: string;
    count: number;
    month_val?: string;
}

interface LevelCounts {
    ringan: number;
    sedang: number;
    berat: number;
}

interface Props {
    totalViolations: number;
    activeViolations: number;
    remisedViolations: number;
    levelCounts: LevelCounts;
    topClassrooms: Classroom[];
    topStudents: Student[];
    monthlyTrends: MonthlyTrend[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Statistik Pelanggaran',
        href: '/statistics',
    },
];

export default function StatisticsIndex({
    totalViolations,
    activeViolations,
    remisedViolations,
    levelCounts,
    topClassrooms,
    topStudents,
    monthlyTrends
}: Props) {
    const remissionRate = totalViolations > 0 
        ? Math.round((remisedViolations / totalViolations) * 100) 
        : 0;

    const totalLevelCounts = levelCounts.ringan + levelCounts.sedang + levelCounts.berat || 1;
    const ringanPercent = Math.round((levelCounts.ringan / totalLevelCounts) * 100);
    const sedangPercent = Math.round((levelCounts.sedang / totalLevelCounts) * 100);
    const beratPercent = Math.round((levelCounts.berat / totalLevelCounts) * 100);

    const maxTrendCount = Math.max(...monthlyTrends.map(t => t.count), 1);
    const maxClassroomCount = Math.max(...topClassrooms.map(c => c.violations_count || 1), 1);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Statistik & Analisis Pelanggaran" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
                        <BarChart3 className="size-6 text-indigo-500" />
                        <span>Statistik Pelanggaran</span>
                    </h1>
                    <p className="text-neutral-500 dark:text-neutral-400">Analisis menyeluruh tentang tren kepatuhan, kategori tingkat pelanggaran, dan performa kedisiplinan kelas.</p>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="relative overflow-hidden border bg-white shadow-xs transition-all hover:shadow-md dark:bg-neutral-950">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Total Pelanggaran</CardTitle>
                            <div className="rounded-lg bg-neutral-100 p-2 text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400">
                                <AlertTriangle className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">{totalViolations}</div>
                            <p className="text-[10px] text-neutral-500 mt-1">Keseluruhan kasus yang tercatat di sistem</p>
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden border bg-white shadow-xs transition-all hover:shadow-md dark:bg-neutral-950">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Pelanggaran Aktif</CardTitle>
                            <div className="rounded-lg bg-red-50 p-2 text-red-650 dark:bg-red-950/30 dark:text-red-400">
                                <AlertTriangle className="size-4 animate-pulse" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-650 dark:text-red-400">{activeViolations}</div>
                            <p className="text-[10px] text-red-500 mt-1">Kasus aktif yang belum mendapatkan remisi</p>
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden border bg-white shadow-xs transition-all hover:shadow-md dark:bg-neutral-950">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Kasus Diremisi</CardTitle>
                            <div className="rounded-lg bg-green-50 p-2 text-green-650 dark:bg-green-950/30 dark:text-green-400">
                                <HeartHandshake className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-650 dark:text-green-400">{remisedViolations}</div>
                            <p className="text-[10px] text-green-500 mt-1">Siswa telah dibina dan status dipulihkan</p>
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden border bg-white shadow-xs transition-all hover:shadow-md dark:bg-neutral-950">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Rasio Remisi</CardTitle>
                            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400">
                                <ShieldCheck className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-indigo-650 dark:text-indigo-400">{remissionRate}%</div>
                            <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-1.5 rounded-full mt-2 overflow-hidden">
                                <div 
                                    className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                                    style={{ width: `${remissionRate}%` }} 
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Level Distribution & Monthly Trend */}
                <div className="grid gap-6 md:grid-cols-3">
                    {/* Level Distribution */}
                    <Card className="md:col-span-1 border bg-white shadow-xs dark:bg-neutral-950">
                        <CardHeader>
                            <CardTitle className="text-base font-bold">Kategori Pelanggaran</CardTitle>
                            <CardDescription className="text-xs">Distribusi kasus berdasarkan tingkat keseriusan</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-2">
                            {/* Ringan */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-xs font-semibold">
                                    <span className="text-green-700 dark:text-green-400 flex items-center gap-1.5">
                                        <span className="size-2 rounded-full bg-green-500" />
                                        Ringan
                                    </span>
                                    <span className="text-neutral-500">{levelCounts.ringan} Kasus ({ringanPercent}%)</span>
                                </div>
                                <div className="w-full bg-neutral-100 dark:bg-neutral-905 h-2 rounded-full overflow-hidden">
                                    <div 
                                        className="bg-green-500 h-full rounded-full transition-all" 
                                        style={{ width: `${ringanPercent}%` }} 
                                    />
                                </div>
                            </div>

                            {/* Sedang */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-xs font-semibold">
                                    <span className="text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                                        <span className="size-2 rounded-full bg-amber-500" />
                                        Sedang
                                    </span>
                                    <span className="text-neutral-500">{levelCounts.sedang} Kasus ({sedangPercent}%)</span>
                                </div>
                                <div className="w-full bg-neutral-100 dark:bg-neutral-905 h-2 rounded-full overflow-hidden">
                                    <div 
                                        className="bg-amber-500 h-full rounded-full transition-all" 
                                        style={{ width: `${sedangPercent}%` }} 
                                    />
                                </div>
                            </div>

                            {/* Berat */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-xs font-semibold">
                                    <span className="text-red-700 dark:text-red-400 flex items-center gap-1.5">
                                        <span className="size-2 rounded-full bg-red-500" />
                                        Berat
                                    </span>
                                    <span className="text-neutral-500">{levelCounts.berat} Kasus ({beratPercent}%)</span>
                                </div>
                                <div className="w-full bg-neutral-100 dark:bg-neutral-905 h-2 rounded-full overflow-hidden">
                                    <div 
                                        className="bg-red-500 h-full rounded-full transition-all" 
                                        style={{ width: `${beratPercent}%` }} 
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Monthly Trend */}
                    <Card className="md:col-span-2 border bg-white shadow-xs dark:bg-neutral-950">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <div>
                                <CardTitle className="text-base font-bold">Tren Pelanggaran Bulanan</CardTitle>
                                <CardDescription className="text-xs">Grafik perkembangan pelanggaran dari waktu ke waktu</CardDescription>
                            </div>
                            <div className="rounded-lg bg-indigo-50/50 p-2 text-indigo-650 dark:bg-indigo-950/20 dark:text-indigo-400">
                                <TrendingUp className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            {monthlyTrends.length > 0 ? (
                                <div className="h-48 flex items-end justify-between gap-4 px-2 pt-6 pb-2">
                                    {monthlyTrends.map((trend, idx) => {
                                        const percentHeight = (trend.count / maxTrendCount) * 100;
                                        return (
                                            <div key={idx} className="flex-1 h-full flex flex-col justify-end items-center relative group">
                                                {/* Tooltip on hover */}
                                                <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center pointer-events-none transition-all duration-200 z-10">
                                                    <div className="bg-neutral-900 text-white text-[10px] px-2 py-1 rounded shadow-md whitespace-nowrap">
                                                        {trend.count} Kasus
                                                    </div>
                                                    <div className="w-1.5 h-1.5 bg-neutral-900 rotate-45 -mt-1" />
                                                </div>

                                                {/* Chart bar */}
                                                <div className="w-full bg-neutral-50 dark:bg-neutral-900 rounded-t-md h-full flex flex-col justify-end overflow-hidden">
                                                    <div 
                                                        className="w-full bg-gradient-to-t from-indigo-500 to-indigo-600 dark:from-indigo-650 dark:to-indigo-500 rounded-t-md transition-all duration-500 hover:opacity-90"
                                                        style={{ height: `${percentHeight}%`, minHeight: trend.count > 0 ? '4px' : '0' }}
                                                    />
                                                </div>

                                                {/* Label */}
                                                <span className="text-[10px] text-neutral-550 mt-2 truncate w-full text-center block" title={trend.label}>
                                                    {trend.label}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="h-48 flex flex-col items-center justify-center text-neutral-400 text-sm">
                                    Belum ada data bulanan yang tercatat.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Rankings: Classes & Students */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Top Classrooms */}
                    <Card className="border bg-white shadow-xs dark:bg-neutral-950">
                        <CardHeader>
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <Users className="size-5 text-indigo-500" />
                                <span>Kelas dengan Pelanggaran Terbanyak</span>
                            </CardTitle>
                            <CardDescription className="text-xs">Daftar kelas yang membutuhkan pembinaan ekstra disiplin</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-2">
                            <div className="space-y-4">
                                {topClassrooms.map((classroom, idx) => {
                                    const widthPercent = ((classroom.violations_count || 0) / maxClassroomCount) * 100;
                                    return (
                                        <div key={classroom.id} className="flex items-center gap-4">
                                            {/* Rank Badge */}
                                            <div className={`flex size-6 items-center justify-center rounded-full text-xs font-bold ${
                                                idx === 0 
                                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400' 
                                                    : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-900 dark:text-neutral-400'
                                            }`}>
                                                {idx + 1}
                                            </div>
                                            
                                            {/* Class name & count */}
                                            <div className="flex-1 space-y-1">
                                                <div className="flex justify-between text-xs font-semibold">
                                                    <span>Kelas {classroom.name}</span>
                                                    <span>{classroom.violations_count} Pelanggaran</span>
                                                </div>
                                                <div className="w-full bg-neutral-100 dark:bg-neutral-900 h-1.5 rounded-full overflow-hidden">
                                                    <div 
                                                        className="bg-indigo-500 h-full rounded-full transition-all" 
                                                        style={{ width: `${widthPercent}%` }} 
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {topClassrooms.length === 0 && (
                                    <div className="text-center py-6 text-sm text-neutral-500">
                                        Belum ada data kelas pelanggaran.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Top Students */}
                    <Card className="border bg-white shadow-xs dark:bg-neutral-950">
                        <CardHeader>
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <Award className="size-5 text-indigo-500" />
                                <span>Murid Paling Sering Melanggar</span>
                            </CardTitle>
                            <CardDescription className="text-xs">Daftar siswa dengan frekuensi pelanggaran tertinggi untuk perhatian konselor</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-2">
                            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                {topStudents.map((student, idx) => (
                                    <div key={student.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                                        <div className="flex items-center gap-3">
                                            {/* Rank Indicator */}
                                            <div className={`flex size-6 items-center justify-center rounded-full text-xs font-bold ${
                                                idx === 0 
                                                    ? 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400' 
                                                    : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-900 dark:text-neutral-400'
                                            }`}>
                                                {idx + 1}
                                            </div>

                                            <div>
                                                <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-55">{student.name}</div>
                                                <div className="text-[10px] text-neutral-500">Kelas: {student.classroom?.name || '-'}</div>
                                            </div>
                                        </div>

                                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50">
                                            {student.violations_count} Pelanggaran
                                        </Badge>
                                    </div>
                                ))}

                                {topStudents.length === 0 && (
                                    <div className="text-center py-6 text-sm text-neutral-550">
                                        Belum ada data siswa pelanggaran.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
