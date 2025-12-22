import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Users, Eye, CalendarIcon, RefreshCw, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Statistik Kunjungan',
        href: '/statistics',
    },
];

interface ChartDataItem {
    date: string;
    visits: number;
}

interface RecentLog {
    id: number;
    page_url: string;
    ip_address: string;
    pariwisata: string;
    created_at: string;
}

interface PariwisataChartItem {
    name: string;
    visits: number;
}

interface Stats {
    total_visits: number;
    unique_visitors: number;
    chart_data: ChartDataItem[];
    pariwisata_chart_data: PariwisataChartItem[];
    recent_logs: RecentLog[];
}

interface Props {
    stats: Stats;
    filter: string;
    filterLabel: string;
    startDate: string | null;
    endDate: string | null;
}

export default function Statistics({ stats, filter, filterLabel, startDate, endDate }: Props) {
    const [ApexChart, setApexChart] = useState<any>(null);
    const [isMounted, setIsMounted] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState(filter);
    const [dateRange, setDateRange] = useState<{
        from: Date | undefined;
        to: Date | undefined;
    }>({
        from: startDate ? new Date(startDate) : undefined,
        to: endDate ? new Date(endDate) : undefined,
    });
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Dynamic import for ApexCharts (SSR-safe)
    useEffect(() => {
        setIsMounted(true);
        if (typeof window !== 'undefined') {
            import('react-apexcharts').then((mod) => {
                setApexChart(() => mod.default);
            });
        }
    }, []);

    // Dark mode detection
    useEffect(() => {
        const checkDarkMode = () => {
            setIsDarkMode(document.documentElement.classList.contains('dark'));
        };
        checkDarkMode();
        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    const handleFilterChange = (value: string) => {
        setSelectedFilter(value);
        if (value !== 'range') {
            router.get('/statistics', { filter: value }, { preserveState: true });
        }
    };

    const handleApplyDateRange = () => {
        if (dateRange.from && dateRange.to) {
            router.get('/statistics', {
                filter: 'range',
                start: format(dateRange.from, 'yyyy-MM-dd'),
                end: format(dateRange.to, 'yyyy-MM-dd'),
            }, { preserveState: true });
            setIsCalendarOpen(false);
        }
    };

    const handleRefresh = () => {
        router.reload({ only: ['stats'] });
    };

    const chartOptions: ApexCharts.ApexOptions = useMemo(() => ({
        chart: {
            type: 'bar',
            toolbar: { show: false },
            fontFamily: 'inherit',
            background: 'transparent',
            foreColor: isDarkMode ? '#e5e7eb' : '#374151',
        },
        theme: {
            mode: isDarkMode ? 'dark' : 'light',
        },
        colors: ['#3b82f6'],
        plotOptions: {
            bar: {
                borderRadius: 6,
                columnWidth: stats.chart_data.length === 1 ? '40%' : '60%',
            }
        },
        dataLabels: {
            enabled: true,
            style: { colors: ['#fff'], fontSize: '11px' }
        },
        xaxis: {
            categories: stats.chart_data.map(d => d.date),
            labels: {
                style: { fontSize: '12px', colors: isDarkMode ? '#9ca3af' : '#6b7280' }
            },
            axisBorder: { color: isDarkMode ? '#374151' : '#e5e7eb' },
            axisTicks: { color: isDarkMode ? '#374151' : '#e5e7eb' },
        },
        yaxis: {
            min: 0,
            labels: {
                formatter: (val) => Math.floor(val).toString(),
                style: { colors: isDarkMode ? '#9ca3af' : '#6b7280' }
            }
        },
        grid: {
            borderColor: isDarkMode ? '#374151' : '#e5e7eb',
            strokeDashArray: 4,
        },
        tooltip: {
            theme: isDarkMode ? 'dark' : 'light',
        },
    }), [stats.chart_data, isDarkMode]);

    const chartSeries = useMemo(() => [{
        name: 'Kunjungan',
        data: stats.chart_data.map(d => d.visits)
    }], [stats.chart_data]);

    // Pariwisata chart options (horizontal bar)
    const pariwisataChartOptions: ApexCharts.ApexOptions = useMemo(() => ({
        chart: {
            type: 'bar',
            toolbar: { show: false },
            fontFamily: 'inherit',
            background: 'transparent',
            foreColor: isDarkMode ? '#e5e7eb' : '#374151',
        },
        theme: {
            mode: isDarkMode ? 'dark' : 'light',
        },
        colors: ['#10b981'],
        plotOptions: {
            bar: {
                borderRadius: 4,
                horizontal: true,
                barHeight: '70%',
            }
        },
        dataLabels: {
            enabled: true,
            style: { colors: ['#fff'], fontSize: '11px' }
        },
        xaxis: {
            categories: stats.pariwisata_chart_data.map(d => d.name),
            labels: {
                formatter: (val) => Math.floor(Number(val)).toString(),
                style: { colors: isDarkMode ? '#9ca3af' : '#6b7280' }
            },
            axisBorder: { color: isDarkMode ? '#374151' : '#e5e7eb' },
            axisTicks: { color: isDarkMode ? '#374151' : '#e5e7eb' },
        },
        yaxis: {
            labels: {
                style: { fontSize: '12px', colors: isDarkMode ? '#9ca3af' : '#6b7280' },
                maxWidth: 150,
            }
        },
        grid: {
            borderColor: isDarkMode ? '#374151' : '#e5e7eb',
            strokeDashArray: 4,
        },
        tooltip: {
            theme: isDarkMode ? 'dark' : 'light',
        },
    }), [stats.pariwisata_chart_data, isDarkMode]);

    const pariwisataChartSeries = useMemo(() => [{
        name: 'Kunjungan',
        data: stats.pariwisata_chart_data.map(d => d.visits)
    }], [stats.pariwisata_chart_data]);

    const statsCards = [
        {
            title: 'Total Kunjungan',
            value: stats.total_visits,
            description: filterLabel,
            icon: Eye,
        },
        {
            title: 'Pengunjung Unik',
            value: stats.unique_visitors,
            description: 'Berdasarkan session',
            icon: Users,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Statistik Kunjungan" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Statistik Kunjungan</h1>
                        <p className="text-muted-foreground">Monitor traffic dan pengunjung website Anda.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Select value={selectedFilter} onValueChange={handleFilterChange}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Pilih periode" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="daily">Hari Ini</SelectItem>
                                <SelectItem value="weekly">Minggu Ini</SelectItem>
                                <SelectItem value="monthly">Bulan Ini</SelectItem>
                                <SelectItem value="yearly">Tahun Ini</SelectItem>
                                <SelectItem value="range">Custom Range</SelectItem>
                            </SelectContent>
                        </Select>

                        {selectedFilter === 'range' && (
                            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "justify-start text-left font-normal",
                                            !dateRange.from && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dateRange.from ? (
                                            dateRange.to ? (
                                                <>
                                                    {format(dateRange.from, "dd MMM", { locale: id })} -{" "}
                                                    {format(dateRange.to, "dd MMM yyyy", { locale: id })}
                                                </>
                                            ) : (
                                                format(dateRange.from, "dd MMM yyyy", { locale: id })
                                            )
                                        ) : (
                                            <span>Pilih tanggal</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="end">
                                    <Calendar
                                        mode="range"
                                        selected={dateRange}
                                        onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                                        numberOfMonths={2}
                                        locale={id}
                                    />
                                    <div className="flex justify-end gap-2 p-3 border-t">
                                        <Button variant="outline" size="sm" onClick={() => setIsCalendarOpen(false)}>
                                            Batal
                                        </Button>
                                        <Button size="sm" onClick={handleApplyDateRange} disabled={!dateRange.from || !dateRange.to}>
                                            Terapkan
                                        </Button>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        )}

                        <Button variant="outline" size="icon" onClick={handleRefresh}>
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2">
                    {statsCards.map((card, index) => {
                        const Icon = card.icon;
                        return (
                            <Card key={index}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                                    <Icon className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{card.value.toLocaleString('id-ID')}</div>
                                    <p className="text-xs text-muted-foreground">{card.description}</p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Trend Kunjungan</CardTitle>
                        <CardDescription>{filterLabel}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isMounted && ApexChart && stats.chart_data.length > 0 ? (
                            <ApexChart
                                options={chartOptions}
                                series={chartSeries}
                                type="bar"
                                height={350}
                            />
                        ) : stats.chart_data.length === 0 ? (
                            <div className="flex h-[350px] items-center justify-center text-muted-foreground">
                                Belum ada data kunjungan untuk periode ini
                            </div>
                        ) : (
                            <div className="flex h-[350px] items-center justify-center">
                                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Pariwisata Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5" />
                            Top 10 Destinasi Terpopuler
                        </CardTitle>
                        <CardDescription>{filterLabel}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isMounted && ApexChart && stats.pariwisata_chart_data.length > 0 ? (
                            <ApexChart
                                options={pariwisataChartOptions}
                                series={pariwisataChartSeries}
                                type="bar"
                                height={Math.max(200, stats.pariwisata_chart_data.length * 45)}
                            />
                        ) : stats.pariwisata_chart_data.length === 0 ? (
                            <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                                Belum ada data kunjungan destinasi untuk periode ini
                            </div>
                        ) : (
                            <div className="flex h-[200px] items-center justify-center">
                                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Logs */}
                <Card>
                    <CardHeader>
                        <CardTitle>Log Kunjungan Terbaru</CardTitle>
                        <CardDescription>50 kunjungan terakhir</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {stats.recent_logs.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="py-3 px-2 text-left font-medium">Halaman</th>
                                            <th className="py-3 px-2 text-left font-medium">IP Address</th>
                                            <th className="py-3 px-2 text-left font-medium">Pariwisata</th>
                                            <th className="py-3 px-2 text-left font-medium">Waktu</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.recent_logs.map((log) => (
                                            <tr key={log.id} className="border-b last:border-0">
                                                <td className="py-3 px-2 max-w-[300px] truncate" title={log.page_url}>
                                                    {log.page_url || '-'}
                                                </td>
                                                <td className="py-3 px-2 font-mono text-xs">{log.ip_address}</td>
                                                <td className="py-3 px-2">{log.pariwisata}</td>
                                                <td className="py-3 px-2 text-muted-foreground">{log.created_at}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex h-32 items-center justify-center text-muted-foreground">
                                Belum ada log kunjungan
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
