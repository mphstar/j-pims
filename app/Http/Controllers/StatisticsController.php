<?php

namespace App\Http\Controllers;

use App\Models\VisitorLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class StatisticsController extends Controller
{
    public function index(Request $request)
    {
        $filter = $request->get('filter', 'daily');
        $startDate = $request->get('start');
        $endDate = $request->get('end');

        $query = VisitorLog::query();

        // Apply date filter
        switch ($filter) {
            case 'daily':
                $query->whereDate('created_at', Carbon::today());
                $label = 'Hari Ini';
                break;
            case 'weekly':
                $query->whereBetween('created_at', [
                    Carbon::now()->startOfWeek(),
                    Carbon::now()->endOfWeek()
                ]);
                $label = 'Minggu Ini';
                break;
            case 'monthly':
                $query->whereMonth('created_at', Carbon::now()->month)
                    ->whereYear('created_at', Carbon::now()->year);
                $label = 'Bulan Ini';
                break;
            case 'yearly':
                $query->whereYear('created_at', Carbon::now()->year);
                $label = 'Tahun Ini';
                break;
            case 'range':
                if ($startDate && $endDate) {
                    $query->whereBetween('created_at', [
                        Carbon::parse($startDate)->startOfDay(),
                        Carbon::parse($endDate)->endOfDay()
                    ]);
                    $label = Carbon::parse($startDate)->format('d M Y')
                        . ' - ' . Carbon::parse($endDate)->format('d M Y');
                } else {
                    $label = 'Custom Range';
                }
                break;
            default:
                $label = 'Semua';
        }

        $totalVisits = $query->count();
        $uniqueVisitors = (clone $query)->distinct('session_id')->count('session_id');

        // Chart data - based on filter
        $chartData = $this->getChartData($filter, $startDate, $endDate);

        // Pariwisata chart data - top visited destinations
        $pariwisataChartData = $this->getPariwisataChartData($filter, $startDate, $endDate);

        // Recent logs
        $recentLogs = VisitorLog::orderByDesc('created_at')
            ->limit(50)
            ->with('pariwisata:id,title')
            ->get()
            ->map(fn($log) => [
                'id' => $log->id,
                'page_url' => $log->page_url,
                'ip_address' => $log->ip_address
                    ? substr($log->ip_address, 0, -3) . '***' : '-',
                'pariwisata' => $log->pariwisata?->title ?? '-',
                'created_at' => $log->created_at->format('d M Y H:i'),
            ]);

        return Inertia::render('statistics', [
            'stats' => [
                'total_visits' => $totalVisits,
                'unique_visitors' => $uniqueVisitors,
                'chart_data' => $chartData,
                'pariwisata_chart_data' => $pariwisataChartData,
                'recent_logs' => $recentLogs,
            ],
            'filter' => $filter,
            'filterLabel' => $label,
            'startDate' => $startDate,
            'endDate' => $endDate,
        ]);
    }

    private function getChartData($filter, $startDate, $endDate)
    {
        $query = VisitorLog::query();

        switch ($filter) {
            case 'daily':
                // Hourly breakdown
                $query->whereDate('created_at', Carbon::today());
                return $query
                    ->select(DB::raw('HOUR(created_at) as hour'), DB::raw('count(*) as visits'))
                    ->groupBy('hour')
                    ->orderBy('hour')
                    ->get()
                    ->map(fn($item) => [
                        'date' => sprintf('%02d:00', $item->hour),
                        'visits' => $item->visits,
                    ]);

            case 'weekly':
                $query->whereBetween('created_at', [
                    Carbon::now()->startOfWeek(),
                    Carbon::now()->endOfWeek()
                ]);
                return $query
                    ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as visits'))
                    ->groupBy('date')
                    ->orderBy('date')
                    ->get()
                    ->map(fn($item) => [
                        'date' => Carbon::parse($item->date)->format('d M'),
                        'visits' => $item->visits,
                    ]);

            case 'monthly':
                $query->whereMonth('created_at', Carbon::now()->month)
                    ->whereYear('created_at', Carbon::now()->year);
                return $query
                    ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as visits'))
                    ->groupBy('date')
                    ->orderBy('date')
                    ->get()
                    ->map(fn($item) => [
                        'date' => Carbon::parse($item->date)->format('d'),
                        'visits' => $item->visits,
                    ]);

            case 'yearly':
                $query->whereYear('created_at', Carbon::now()->year);
                return $query
                    ->select(DB::raw('MONTH(created_at) as month'), DB::raw('count(*) as visits'))
                    ->groupBy('month')
                    ->orderBy('month')
                    ->get()
                    ->map(fn($item) => [
                        'date' => Carbon::create()->month($item->month)->format('M'),
                        'visits' => $item->visits,
                    ]);

            case 'range':
                if ($startDate && $endDate) {
                    $query->whereBetween('created_at', [
                        Carbon::parse($startDate)->startOfDay(),
                        Carbon::parse($endDate)->endOfDay()
                    ]);
                }
                return $query
                    ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as visits'))
                    ->groupBy('date')
                    ->orderBy('date')
                    ->get()
                    ->map(fn($item) => [
                        'date' => Carbon::parse($item->date)->format('d M'),
                        'visits' => $item->visits,
                    ]);

            default:
                return collect();
        }
    }

    private function getPariwisataChartData($filter, $startDate, $endDate)
    {
        $query = VisitorLog::query()
            ->whereNotNull('pariwisata_id')
            ->with('pariwisata:id,title');

        // Apply same date filter
        switch ($filter) {
            case 'daily':
                $query->whereDate('created_at', Carbon::today());
                break;
            case 'weekly':
                $query->whereBetween('created_at', [
                    Carbon::now()->startOfWeek(),
                    Carbon::now()->endOfWeek()
                ]);
                break;
            case 'monthly':
                $query->whereMonth('created_at', Carbon::now()->month)
                    ->whereYear('created_at', Carbon::now()->year);
                break;
            case 'yearly':
                $query->whereYear('created_at', Carbon::now()->year);
                break;
            case 'range':
                if ($startDate && $endDate) {
                    $query->whereBetween('created_at', [
                        Carbon::parse($startDate)->startOfDay(),
                        Carbon::parse($endDate)->endOfDay()
                    ]);
                }
                break;
        }

        return $query
            ->select('pariwisata_id', DB::raw('count(*) as visits'))
            ->groupBy('pariwisata_id')
            ->orderByDesc('visits')
            ->limit(10)
            ->get()
            ->map(fn($item) => [
                'name' => $item->pariwisata?->title ?? 'Unknown',
                'visits' => $item->visits,
            ]);
    }
}
