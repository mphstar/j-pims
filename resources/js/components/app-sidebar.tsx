import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import {
    Folder,
    LayoutGrid,
    LucideAlignEndVertical,
    LucideBetweenVerticalStart,
    LucideBlocks,
    LucideLayoutTemplate,
    LucideUser,
    PackageSearch,
    Settings2,
    Activity,
    DollarSign,
    Clock,
    MapPin,
} from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutGrid,
    },
];

const masterNavItems: NavItem[] = [
    {
        title: 'Pengguna',
        url: '/user',
        icon: LucideUser,
    },
    {
        title: 'Pariwisata',
        url: '/pariwisata',
        icon: PackageSearch,
    },
];

const preferenceNavItems: NavItem[] = [
    {
        title: 'Activity Levels',
        url: '/preference-activity-levels',
        icon: Activity,
    },
    {
        title: 'Price Ranges',
        url: '/preference-price-ranges',
        icon: DollarSign,
    },
    {
        title: 'Visit Times',
        url: '/preference-visit-times',
        icon: Clock,
    },
    {
        title: 'Destination Types',
        url: '/preference-destination-types',
        icon: MapPin,
    }
];

const footerNavItems: NavItem[] = [
    // {
    //     title: 'Repository',
    //     url: 'https://github.com/laravel/react-starter-kit',
    //     icon: Folder,
    // },
    // {
    //     title: 'Documentation',
    //     url: 'https://laravel.com/docs/starter-kits',
    //     icon: BookOpen,
    // },
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
                <NavMain title={'Master Data'} items={masterNavItems} />
                <NavMain title={'Preferences'} items={preferenceNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
