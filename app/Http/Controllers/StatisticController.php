<?php

namespace App\Http\Controllers;

use App\Models\Classroom;
use App\Models\Student;
use App\Models\Violation;
use Inertia\Inertia;
use Inertia\Response;

class StatisticController extends Controller
{
    /**
     * Display violation statistics.
     */
    public function index(): Response
    {
        // High level counters
        $totalViolations = Violation::count();
        $activeViolations = Violation::where('status', 'aktif')->count();
        $remisedViolations = Violation::where('status', 'diremisi')->count();

        // Level distribution
        $levelCounts = [
            'ringan' => Violation::whereHas('pasal', function ($q) {
                $q->where('level', 'ringan');
            })->count(),
            'sedang' => Violation::whereHas('pasal', function ($q) {
                $q->where('level', 'sedang');
            })->count(),
            'berat' => Violation::whereHas('pasal', function ($q) {
                $q->where('level', 'berat');
            })->count(),
        ];

        // Top Classrooms with most violations
        $topClassrooms = Classroom::select('classrooms.id', 'classrooms.name')
            ->join('students', 'students.classroom_id', '=', 'classrooms.id')
            ->join('violations', 'violations.student_id', '=', 'students.id')
            ->selectRaw('count(violations.id) as violations_count')
            ->groupBy('classrooms.id', 'classrooms.name')
            ->orderByDesc('violations_count')
            ->limit(5)
            ->get();

        // Top Students with most violations
        $topStudents = Student::with('classroom')
            ->join('violations', 'violations.student_id', '=', 'students.id')
            ->select('students.id', 'students.name', 'students.classroom_id')
            ->selectRaw('count(violations.id) as violations_count')
            ->groupBy('students.id', 'students.name', 'students.classroom_id')
            ->orderByDesc('violations_count')
            ->limit(5)
            ->get();

        // Monthly trends (grouped by year and month)
        // Grouping format for SQLite is strftime('%Y-%m', violation_date)
        $monthlyTrends = Violation::selectRaw("strftime('%Y-%m', violation_date) as month, count(id) as count")
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(function ($item) {
                // Parse '2026-06' to readable name e.g. 'Juni 2026'
                if (empty($item->month)) {
                    return ['label' => 'Unknown', 'count' => $item->count];
                }

                $parts = explode('-', $item->month);
                if (count($parts) === 2) {
                    $year = $parts[0];
                    $monthNum = (int) $parts[1];
                    $months = [
                        1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
                        5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
                        9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember',
                    ];
                    $monthName = $months[$monthNum] ?? 'Bulan';

                    return [
                        'label' => "$monthName $year",
                        'count' => (int) $item->count,
                        'month_val' => $item->month,
                    ];
                }

                return ['label' => $item->month, 'count' => (int) $item->count];
            });

        return Inertia::render('statistics/index', [
            'totalViolations' => $totalViolations,
            'activeViolations' => $activeViolations,
            'remisedViolations' => $remisedViolations,
            'levelCounts' => $levelCounts,
            'topClassrooms' => $topClassrooms,
            'topStudents' => $topStudents,
            'monthlyTrends' => $monthlyTrends,
        ]);
    }
}
