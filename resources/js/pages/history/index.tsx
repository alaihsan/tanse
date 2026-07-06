import { useState } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { History, Search, Calendar, User, Database, PlusCircle, PenTool, Trash2 } from 'lucide-react';

interface Teacher {
    id: number;
    name: string;
}

interface LogEntry {
    id: number;
    user_id: number;
    action: string; // CREATE, UPDATE, DELETE
    description: string;
    created_at: string;
    user: Teacher;
}

interface Props {
    logs: LogEntry[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'History Aktivitas',
        href: '/history',
    },
];

export default function HistoryIndex({ logs }: Props) {
    const [searchQuery, setSearchQuery] = useState('');

    const getActionBadge = (action: string) => {
        switch (action.toUpperCase()) {
            case 'CREATE':
                return (
                    <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200 py-1 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900/50">
                        <PlusCircle className="size-3" />
                        <span>CREATE</span>
                    </Badge>
                );
            case 'UPDATE':
                return (
                    <Badge variant="outline" className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200 py-1 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50">
                        <PenTool className="size-3" />
                        <span>UPDATE</span>
                    </Badge>
                );
            case 'DELETE':
                return (
                    <Badge variant="outline" className="flex items-center gap-1 bg-red-50 text-red-700 border-red-200 py-1 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50">
                        <Trash2 className="size-3" />
                        <span>DELETE</span>
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline" className="flex items-center gap-1 bg-neutral-50 text-neutral-700 border-neutral-200 py-1 dark:bg-neutral-900/30 dark:text-neutral-400">
                        <Database className="size-3" />
                        <span>{action}</span>
                    </Badge>
                );
        }
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

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    };

    const filteredLogs = logs.filter(log => {
        const query = searchQuery.toLowerCase();
        return (
            log.description.toLowerCase().includes(query) ||
            log.action.toLowerCase().includes(query) ||
            (log.user && log.user.name.toLowerCase().includes(query))
        );
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="History Aktivitas" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
                            <History className="size-6 text-indigo-500" />
                            <span>History Aktivitas</span>
                        </h1>
                        <p className="text-neutral-550 dark:text-neutral-400">Log penambahan, pengubahan, dan penghapusan data (CRUD) oleh semua pengguna.</p>
                    </div>

                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
                        <Input
                            type="text"
                            placeholder="Cari pelaku atau tindakan..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <Card className="border">
                    <CardHeader className="pb-4 border-b border-neutral-100 dark:border-neutral-850">
                        <CardTitle className="text-base font-bold">Log Aktivitas Sistem</CardTitle>
                        <CardDescription>Menampilkan semua tindakan administratif secara real-time.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                            {filteredLogs.map(log => (
                                <div key={log.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 hover:bg-neutral-50/50 dark:hover:bg-neutral-900/30 transition-all">
                                    {/* User Avatar Circle */}
                                    <div className="flex items-center gap-3 shrink-0">
                                        <div className="size-9 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs border border-indigo-100 dark:bg-indigo-950/45 dark:text-indigo-400 dark:border-indigo-900/50">
                                            {log.user ? getInitials(log.user.name) : 'S'}
                                        </div>
                                        <div className="sm:hidden">
                                            <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{log.user?.name || 'Sistem'}</div>
                                            <div className="text-[10px] text-neutral-450 flex items-center gap-1 mt-0.5">
                                                <Calendar className="size-3" />
                                                {formatDateTime(log.created_at)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="flex-1 space-y-1">
                                        <div className="hidden sm:flex justify-between items-center gap-2">
                                            <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-350 flex items-center gap-1.5">
                                                <User className="size-3.5 text-neutral-450" />
                                                {log.user?.name || 'Sistem'}
                                            </span>
                                            <span className="text-[10px] text-neutral-450 flex items-center gap-1">
                                                <Calendar className="size-3" />
                                                {formatDateTime(log.created_at)}
                                            </span>
                                        </div>
                                        <div className="text-sm text-neutral-900 dark:text-neutral-100 font-medium">
                                            {log.description}
                                        </div>
                                    </div>

                                    {/* Action Badge */}
                                    <div className="shrink-0 pt-1 sm:pt-0">
                                        {getActionBadge(log.action)}
                                    </div>
                                </div>
                            ))}

                            {filteredLogs.length === 0 && (
                                <div className="p-12 text-center text-neutral-500">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <History className="size-8 text-neutral-300 dark:text-neutral-700" />
                                        <span>Tidak ada catatan aktivitas yang ditemukan.</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
