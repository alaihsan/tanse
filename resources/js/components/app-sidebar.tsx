import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, GraduationCap, Scale, ShieldAlert, HeartHandshake, BarChart3, History } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Kelola Kelas',
        url: '/classrooms',
        icon: GraduationCap,
    },
    {
        title: 'Kelola Pasal',
        url: '/pasals',
        icon: Scale,
    },
    {
        title: 'Input Pelanggaran',
        url: '/violations',
        icon: ShieldAlert,
    },
    {
        title: 'Remisi Pelanggaran',
        url: '/remissions',
        icon: HeartHandshake,
    },
    {
        title: 'Statistik Pelanggaran',
        url: '/statistics',
        icon: BarChart3,
    },
    {
        title: 'History Aktivitas',
        url: '/history',
        icon: History,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Penanganan Masalah',
        url: '/penanganan-masalah',
        icon: Folder,
    },
    {
        title: 'Dokumentasi',
        url: '/dokumentasi',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
