import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    BarChart3, 
    TrendingUp, 
    AlertTriangle, 
    ShieldCheck, 
    HeartHandshake, 
    Award, 
    Users, 
    Calendar,
    ListOrdered,
    Grid3X3
} from 'lucide-react';

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

interface TrendData {
    label: string;
    count: number;
    date_val?: string;
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
    dailyTrends: TrendData[];
    monthlyTrends: TrendData[];
    classroomStats: Classroom[];
    topStudents: Student[];
    activePasals: { id: number; name: string }[];
    activeClassrooms: { id: number; name: string }[];
    heatmapData: { pasal_id: number; classroom_id: number; count: number }[];
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
    dailyTrends,
    monthlyTrends,
    classroomStats,
    topStudents,
    activePasals,
    activeClassrooms,
    heatmapData
}: Props) {
    const [trendPeriod, setTrendPeriod] = useState<'daily' | 'monthly'>('daily');
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const remissionRate = totalViolations > 0 
        ? Math.round((remisedViolations / totalViolations) * 100) 
        : 0;

    const totalLevelCounts = levelCounts.ringan + levelCounts.sedang + levelCounts.berat || 1;
    const ringanPercent = Math.round((levelCounts.ringan / totalLevelCounts) * 100);
    const sedangPercent = Math.round((levelCounts.sedang / totalLevelCounts) * 100);
    const beratPercent = Math.round((levelCounts.berat / totalLevelCounts) * 100);

    // Active trend data
    const activeTrendData = trendPeriod === 'daily' ? dailyTrends : monthlyTrends;
    const maxTrendCount = Math.max(...activeTrendData.map(t => t.count), 5);
    const maxClassroomCount = Math.max(...classroomStats.map(c => c.violations_count || 1), 1);

    // SVG Area Chart settings
    const svgWidth = 800;
    const svgHeight = 240;
    const chartMargin = { top: 20, right: 30, bottom: 40, left: 45 };
    const chartWidth = svgWidth - chartMargin.left - chartMargin.right;
    const chartHeight = svgHeight - chartMargin.top - chartMargin.bottom;

    // Calculate plotting points
    const points = activeTrendData.map((d, i) => {
        const x = chartMargin.left + (i / (activeTrendData.length - 1 || 1)) * chartWidth;
        const y = chartMargin.top + chartHeight - (d.count / maxTrendCount) * chartHeight;
        return { x, y, data: d };
    });

    // SVG Paths
    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaPath = points.length > 0 
        ? `${linePath} L ${points[points.length - 1].x} ${chartMargin.top + chartHeight} L ${points[0].x} ${chartMargin.top + chartHeight} Z`
        : '';

    // Handle mouse scrubbing/hovering over trend lines
    const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const svgX = (mouseX / rect.width) * svgWidth;
        const relativeX = svgX - chartMargin.left;
        const index = Math.round((relativeX / chartWidth) * (activeTrendData.length - 1));
        const clampedIndex = Math.max(0, Math.min(activeTrendData.length - 1, index));
        setHoveredIndex(clampedIndex);
    };

    // Lookup helper for heatmap counts
    const getHeatmapCount = (pasalId: number, classroomId: number) => {
        const match = heatmapData.find(d => d.pasal_id === pasalId && d.classroom_id === classroomId);
        return match ? match.count : 0;
    };

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
                            <div className="rounded-lg bg-red-50 p-2 text-red-655 dark:bg-red-955/30 dark:text-red-400">
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
                            <div className="rounded-lg bg-green-50 p-2 text-green-650 dark:bg-green-955/30 dark:text-green-400">
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

                {/* Level Distribution & Trends */}
                <div className="grid gap-6 md:grid-cols-3">
                    {/* Level Distribution */}
                    <Card className="md:col-span-1 border bg-white shadow-xs dark:bg-neutral-950 flex flex-col">
                        <CardHeader>
                            <CardTitle className="text-base font-bold">Kategori Pelanggaran</CardTitle>
                            <CardDescription className="text-xs">Distribusi kasus berdasarkan tingkat keseriusan</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5 pt-2 flex-1 flex flex-col justify-center">
                            {/* Ringan */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-xs font-semibold">
                                    <span className="text-green-700 dark:text-green-400 flex items-center gap-1.5">
                                        <span className="size-2.5 rounded-full bg-green-500" />
                                        Ringan
                                    </span>
                                    <span className="text-neutral-500">{levelCounts.ringan} Kasus ({ringanPercent}%)</span>
                                </div>
                                <div className="w-full bg-neutral-100 dark:bg-neutral-900 h-2.5 rounded-full overflow-hidden">
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
                                        <span className="size-2.5 rounded-full bg-amber-500" />
                                        Sedang
                                    </span>
                                    <span className="text-neutral-500">{levelCounts.sedang} Kasus ({sedangPercent}%)</span>
                                </div>
                                <div className="w-full bg-neutral-100 dark:bg-neutral-900 h-2.5 rounded-full overflow-hidden">
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
                                        <span className="size-2.5 rounded-full bg-red-500" />
                                        Berat
                                    </span>
                                    <span className="text-neutral-500">{levelCounts.berat} Kasus ({beratPercent}%)</span>
                                </div>
                                <div className="w-full bg-neutral-100 dark:bg-neutral-900 h-2.5 rounded-full overflow-hidden">
                                    <div 
                                        className="bg-red-500 h-full rounded-full transition-all" 
                                        style={{ width: `${beratPercent}%` }} 
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Trend Chart (Line/Area Chart with dynamic tooltip) */}
                    <Card className="md:col-span-2 border bg-white shadow-xs dark:bg-neutral-950 relative overflow-visible">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div>
                                <CardTitle className="text-base font-bold flex items-center gap-2">
                                    <TrendingUp className="size-5 text-indigo-500" />
                                    <span>Tren Perkembangan Pelanggaran</span>
                                </CardTitle>
                                <CardDescription className="text-xs">Grafik kasus dari waktu ke waktu (harian & bulanan)</CardDescription>
                            </div>
                            <div className="flex items-center bg-neutral-100 dark:bg-neutral-900 rounded-lg p-0.5 border dark:border-neutral-800">
                                <button
                                    onClick={() => { setTrendPeriod('daily'); setHoveredIndex(null); }}
                                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                                        trendPeriod === 'daily' 
                                            ? 'bg-white dark:bg-neutral-850 text-indigo-650 dark:text-indigo-400 shadow-sm border border-neutral-200/50 dark:border-neutral-800/50' 
                                            : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                                    }`}
                                >
                                    Harian
                                </button>
                                <button
                                    onClick={() => { setTrendPeriod('monthly'); setHoveredIndex(null); }}
                                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                                        trendPeriod === 'monthly' 
                                            ? 'bg-white dark:bg-neutral-850 text-indigo-650 dark:text-indigo-400 shadow-sm border border-neutral-200/50 dark:border-neutral-800/50' 
                                            : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                                    }`}
                                >
                                    Bulanan
                                </button>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4 relative">
                            {activeTrendData.length > 0 ? (
                                <div className="relative w-full h-56">
                                    {/* Responsive SVG */}
                                    <svg 
                                        viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
                                        className="w-full h-full overflow-visible"
                                        onMouseMove={handleMouseMove}
                                        onMouseLeave={() => setHoveredIndex(null)}
                                    >
                                        <defs>
                                            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.35" />
                                                <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                                            </linearGradient>
                                        </defs>

                                        {/* Y-Axis Grid Lines */}
                                        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
                                            const y = chartMargin.top + ratio * chartHeight;
                                            const gridVal = Math.round(maxTrendCount - ratio * maxTrendCount);
                                            return (
                                                <g key={index} className="opacity-40">
                                                    <line 
                                                        x1={chartMargin.left} 
                                                        y1={y} 
                                                        x2={svgWidth - chartMargin.right} 
                                                        y2={y} 
                                                        stroke="currentColor" 
                                                        strokeWidth={0.5} 
                                                        strokeDasharray="4 4"
                                                        className="text-neutral-300 dark:text-neutral-700" 
                                                    />
                                                    <text 
                                                        x={chartMargin.left - 10} 
                                                        y={y + 4} 
                                                        textAnchor="end" 
                                                        className="text-[9px] font-semibold text-neutral-400 dark:text-neutral-500 fill-current"
                                                    >
                                                        {gridVal}
                                                    </text>
                                                </g>
                                            );
                                        })}

                                        {/* X-Axis labels (only show subset if daily to avoid overcrowding) */}
                                        {points.map((p, idx) => {
                                            const shouldShowLabel = trendPeriod === 'monthly' || idx % 4 === 0 || idx === points.length - 1;
                                            if (!shouldShowLabel) return null;
                                            return (
                                                <text
                                                    key={idx}
                                                    x={p.x}
                                                    y={svgHeight - 15}
                                                    textAnchor="middle"
                                                    className="text-[9px] font-semibold text-neutral-400 dark:text-neutral-500 fill-current"
                                                >
                                                    {p.data.label}
                                                </text>
                                            );
                                        })}

                                        {/* Area Fill */}
                                        {areaPath && (
                                            <path 
                                                d={areaPath} 
                                                fill="url(#chartGradient)" 
                                                pointerEvents="none"
                                            />
                                        )}

                                        {/* Line Path */}
                                        {linePath && (
                                            <path 
                                                d={linePath} 
                                                fill="none" 
                                                stroke="#4f46e5" 
                                                strokeWidth={2.5} 
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                pointerEvents="none"
                                            />
                                        )}

                                        {/* Hover Indicator Line & Circles */}
                                        {hoveredIndex !== null && points[hoveredIndex] && (
                                            <g>
                                                <line 
                                                    x1={points[hoveredIndex].x} 
                                                    y1={chartMargin.top} 
                                                    x2={points[hoveredIndex].x} 
                                                    y2={chartMargin.top + chartHeight} 
                                                    stroke="#6366f1" 
                                                    strokeWidth={1.5} 
                                                    strokeDasharray="4 4"
                                                    pointerEvents="none"
                                                />
                                                <circle 
                                                    cx={points[hoveredIndex].x} 
                                                    cy={points[hoveredIndex].y} 
                                                    r={6} 
                                                    fill="#4f46e5" 
                                                    stroke="#ffffff" 
                                                    strokeWidth={2} 
                                                    pointerEvents="none"
                                                />
                                                <circle 
                                                    cx={points[hoveredIndex].x} 
                                                    cy={points[hoveredIndex].y} 
                                                    r={12} 
                                                    fill="#4f46e5" 
                                                    fillOpacity={0.2} 
                                                    pointerEvents="none"
                                                />
                                            </g>
                                        )}
                                    </svg>

                                    {/* HTML Tooltip on hover */}
                                    {hoveredIndex !== null && points[hoveredIndex] && (
                                        <div 
                                            className="absolute bg-neutral-900/95 dark:bg-neutral-850/95 text-white text-[11px] px-3 py-2 rounded-lg shadow-xl pointer-events-none border border-neutral-700/30 transition-all duration-150 z-20 w-32 text-center"
                                            style={{
                                                left: `${((points[hoveredIndex].x - chartMargin.left) / chartWidth) * 88 + 7}%`,
                                                top: `${((points[hoveredIndex].y - chartMargin.top) / chartHeight) * 60 + 5}%`,
                                                transform: 'translate(-50%, -130%)',
                                            }}
                                        >
                                            <p className="font-semibold text-neutral-300">{points[hoveredIndex].data.label}</p>
                                            <p className="text-indigo-400 font-bold text-xs mt-0.5">{points[hoveredIndex].data.count} Pelanggaran</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="h-56 flex flex-col items-center justify-center text-neutral-400 text-sm">
                                    Belum ada data trend yang tercatat.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Rankings: Classes & Students */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Classrooms Bar Chart Card */}
                    <Card className="border bg-white shadow-xs dark:bg-neutral-950">
                        <CardHeader>
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <Users className="size-5 text-indigo-500" />
                                <span>Jumlah Pelanggaran per Kelas</span>
                            </CardTitle>
                            <CardDescription className="text-xs">Statistik sebaran pelanggaran pada masing-masing kelas</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-2">
                            <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
                                {classroomStats.map((classroom, idx) => {
                                    const percentWidth = ((classroom.violations_count || 0) / maxClassroomCount) * 100;
                                    return (
                                        <div key={classroom.id} className="space-y-1 group">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="font-bold text-neutral-800 dark:text-neutral-200">Kelas {classroom.name}</span>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-semibold text-neutral-500">{classroom.violations_count} Kasus</span>
                                                    <Badge variant="secondary" className="text-[9px] py-0 px-1.5 font-bold bg-neutral-100 text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400 group-hover:bg-indigo-50 group-hover:text-indigo-650 dark:group-hover:bg-indigo-950/30 dark:group-hover:text-indigo-455 transition-colors">
                                                        {Math.round(percentWidth)}%
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="w-full bg-neutral-100 dark:bg-neutral-900 h-3 rounded-full overflow-hidden border dark:border-neutral-800/40 relative">
                                                <div 
                                                    className="bg-gradient-to-r from-indigo-500 to-violet-500 dark:from-indigo-600 dark:to-violet-650 h-full rounded-full transition-all duration-700" 
                                                    style={{ width: `${percentWidth || 1}%` }} 
                                                />
                                            </div>
                                        </div>
                                    );
                                })}

                                {classroomStats.length === 0 && (
                                    <div className="text-center py-6 text-sm text-neutral-500">
                                        Belum ada data statistik kelas.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Top Students Leaderboard */}
                    <Card className="border bg-white shadow-xs dark:bg-neutral-950">
                        <CardHeader>
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <Award className="size-5 text-indigo-500" />
                                <span>Ranking Siswa Paling Sering Melanggar</span>
                            </CardTitle>
                            <CardDescription className="text-xs">Leaderboard siswa dengan frekuensi pelanggaran tertinggi untuk perhatian konselor</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-2">
                            <div className="divide-y divide-neutral-100 dark:divide-neutral-900 max-h-[360px] overflow-y-auto pr-1">
                                {topStudents.map((student, idx) => {
                                    // Golden, silver, bronze medals for top 3
                                    let badgeStyle = "bg-neutral-100 text-neutral-800 dark:bg-neutral-900 dark:text-neutral-400";
                                    if (idx === 0) badgeStyle = "bg-amber-500 text-white font-bold animate-pulse";
                                    if (idx === 1) badgeStyle = "bg-slate-400 text-white font-bold";
                                    if (idx === 2) badgeStyle = "bg-amber-700 text-white font-bold";

                                    return (
                                        <div key={student.id} className="flex items-center justify-between py-2.5 hover:bg-neutral-50/50 dark:hover:bg-neutral-900/30 px-2 rounded-lg transition-colors">
                                            <div className="flex items-center gap-3">
                                                {/* Rank Circle */}
                                                <div className={`flex size-6.5 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${badgeStyle}`}>
                                                    {idx + 1}
                                                </div>

                                                <div>
                                                    <div className="text-xs font-bold text-neutral-900 dark:text-neutral-200 hover:text-indigo-650 transition-colors">{student.name}</div>
                                                    <div className="text-[10px] text-neutral-400 font-medium">Kelas: {student.classroom?.name || '-'}</div>
                                                </div>
                                            </div>

                                            <Badge variant="outline" className="bg-red-50 text-red-650 border-red-200/50 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/40 font-bold tracking-wide">
                                                {student.violations_count} Kasus
                                            </Badge>
                                        </div>
                                    );
                                })}

                                {topStudents.length === 0 && (
                                    <div className="text-center py-6 text-sm text-neutral-500">
                                        Belum ada data leaderboard siswa.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Heatmap: Sebaran Pelanggaran berdasarkan Nama Pasal */}
                <Card className="border bg-white shadow-xs dark:bg-neutral-950">
                    <CardHeader>
                        <CardTitle className="text-base font-bold flex items-center gap-2">
                            <Grid3X3 className="size-5 text-indigo-500" />
                            <span>Heatmap Sebaran Pelanggaran berdasarkan Nama Pasal</span>
                        </CardTitle>
                        <CardDescription className="text-xs">Matriks korelasi kepadatan kasus pelanggaran antara pasal tata tertib dan kelas siswa</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-2">
                        {activePasals.length > 0 && activeClassrooms.length > 0 ? (
                            <div className="overflow-x-auto select-none">
                                <div className="min-w-[840px] pb-4">
                                    <div className="grid grid-cols-[240px_repeat(8,1fr)] gap-1.5 items-center">
                                        {/* Header labels */}
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                                            Nama Pasal
                                        </div>
                                        {activeClassrooms.map(classroom => (
                                            <div 
                                                key={classroom.id} 
                                                className="text-center text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 truncate"
                                                title={`Kelas ${classroom.name}`}
                                            >
                                                {classroom.name}
                                            </div>
                                        ))}

                                        {/* Matrix rows */}
                                        {activePasals.map(pasal => (
                                            <React.Fragment key={pasal.id}>
                                                {/* Row Header (Y-Axis) */}
                                                <div 
                                                    className="text-xs text-neutral-700 dark:text-neutral-350 truncate pr-2 font-medium hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors"
                                                    title={pasal.name}
                                                >
                                                    {pasal.name}
                                                </div>

                                                {/* Matrix Cells */}
                                                {activeClassrooms.map(classroom => {
                                                    const count = getHeatmapCount(pasal.id, classroom.id);
                                                    
                                                    // Dynamic styling based on severity (violation density)
                                                    let cellStyle = "bg-neutral-50 dark:bg-neutral-900 border-neutral-100 dark:border-neutral-800 text-neutral-300 dark:text-neutral-750";
                                                    if (count > 0 && count <= 2) {
                                                        cellStyle = "bg-indigo-50/70 dark:bg-indigo-950/20 text-indigo-755 dark:text-indigo-400 border-indigo-100/50 dark:border-indigo-900/20 hover:bg-indigo-100/50";
                                                    } else if (count >= 3 && count <= 5) {
                                                        cellStyle = "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-650 dark:text-indigo-350 border-indigo-200/50 dark:border-indigo-800/40 hover:bg-indigo-200/40";
                                                    } else if (count >= 6 && count <= 9) {
                                                        cellStyle = "bg-indigo-300 dark:bg-indigo-800 text-indigo-900 dark:text-indigo-100 border-indigo-400 hover:bg-indigo-400";
                                                    } else if (count >= 10) {
                                                        cellStyle = "bg-indigo-600 text-white border-indigo-700 shadow-xs hover:bg-indigo-700";
                                                    }

                                                    return (
                                                        <div
                                                            key={`${pasal.id}-${classroom.id}`}
                                                            className={`h-9 rounded-md flex items-center justify-center text-xs font-bold border transition-all duration-150 hover:scale-105 cursor-pointer relative group ${cellStyle}`}
                                                        >
                                                            {count}

                                                            {/* Floating Tooltip */}
                                                            <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center pointer-events-none transition-all duration-200 z-30 w-64 -translate-x-1/2 left-1/2">
                                                                <div className="bg-neutral-900/95 dark:bg-neutral-850/95 border border-neutral-700/30 text-white text-[10px] px-3 py-1.5 rounded-lg shadow-xl whitespace-normal leading-tight text-center">
                                                                    <p className="font-bold border-b border-neutral-700/40 pb-1 mb-1 truncate">{pasal.name}</p>
                                                                    <p className="text-neutral-300">Kelas <span className="font-bold text-white">{classroom.name}</span>: <span className="font-bold text-indigo-400">{count} Kasus</span></p>
                                                                </div>
                                                                <div className="w-2 h-2 bg-neutral-900 dark:bg-neutral-850 border-r border-b border-neutral-700/30 rotate-45 -mt-1" />
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </React.Fragment>
                                        ))}
                                    </div>

                                    {/* Heatmap Legend */}
                                    <div className="flex items-center justify-end gap-4 mt-6 text-[10px] font-semibold text-neutral-450 dark:text-neutral-500">
                                        <span>Kepadatan kasus:</span>
                                        <div className="flex items-center gap-1.5">
                                            <div className="size-4 bg-neutral-50 dark:bg-neutral-900 border dark:border-neutral-800 rounded-sm" />
                                            <span>0</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <div className="size-4 bg-indigo-50 dark:bg-indigo-950/20 border dark:border-indigo-900/50 rounded-sm" />
                                            <span>1 - 2</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <div className="size-4 bg-indigo-100 dark:bg-indigo-900/30 border dark:border-indigo-800/50 rounded-sm" />
                                            <span>3 - 5</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <div className="size-4 bg-indigo-300 dark:bg-indigo-800 border dark:border-indigo-700 rounded-sm" />
                                            <span>6 - 9</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <div className="size-4 bg-indigo-600 rounded-sm" />
                                            <span>10+</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-10 text-sm text-neutral-500">
                                Belum ada data yang cukup untuk memuat heatmap sebaran pelanggaran.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
