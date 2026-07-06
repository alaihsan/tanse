<?php

namespace App\Http\Controllers;

use App\Models\Classroom;
use App\Models\Pasal;
use App\Models\Student;
use App\Models\Violation;
use Illuminate\Support\Facades\DB;
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

        // Determine DB Driver for Date Formats
        $driver = DB::connection()->getDriverName();
        if ($driver === 'sqlite') {
            $dailyQuery = "strftime('%Y-%m-%d', violation_date) as date, count(id) as count";
            $monthlyQuery = "strftime('%Y-%m', violation_date) as month, count(id) as count";
        } else {
            $dailyQuery = "DATE_FORMAT(violation_date, '%Y-%m-%d') as date, count(id) as count";
            $monthlyQuery = "DATE_FORMAT(violation_date, '%Y-%m') as month, count(id) as count";
        }

        // Daily Trends (past 30 days)
        $dailyData = Violation::selectRaw($dailyQuery)
            ->where('violation_date', '>=', now()->subDays(29)->startOfDay())
            ->groupBy('date')
            ->get();

        $dailyTrends = collect();
        $monthsShort = [
            1 => 'Jan', 2 => 'Feb', 3 => 'Mar', 4 => 'Apr',
            5 => 'Mei', 6 => 'Jun', 7 => 'Jul', 8 => 'Agu',
            9 => 'Sep', 10 => 'Okt', 11 => 'Nov', 12 => 'Des',
        ];

        for ($i = 29; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $dateStr = $date->format('Y-m-d');
            $labelStr = $date->format('d').' '.$monthsShort[(int) $date->format('n')];
            $match = $dailyData->first(function ($item) use ($dateStr) {
                return str_starts_with($item->date, $dateStr);
            });

            $dailyTrends->push([
                'label' => $labelStr,
                'count' => $match ? (int) $match->count : 0,
                'date_val' => $dateStr,
            ]);
        }

        // Monthly Trends (past 12 months)
        $monthlyData = Violation::selectRaw($monthlyQuery)
            ->where('violation_date', '>=', now()->subMonths(11)->startOfMonth())
            ->groupBy('month')
            ->get();

        $monthlyTrends = collect();
        for ($i = 11; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $monthStr = $date->format('Y-m');
            $labelStr = $monthsShort[(int) $date->format('n')].' '.$date->format('Y');
            $match = $monthlyData->first(function ($item) use ($monthStr) {
                return str_starts_with($item->month, $monthStr);
            });

            $monthlyTrends->push([
                'label' => $labelStr,
                'count' => $match ? (int) $match->count : 0,
                'month_val' => $monthStr,
            ]);
        }

        // All Classrooms with violation counts
        $classroomStats = Classroom::select('classrooms.id', 'classrooms.name')
            ->leftJoin('students', 'students.classroom_id', '=', 'classrooms.id')
            ->leftJoin('violations', 'violations.student_id', '=', 'students.id')
            ->selectRaw('count(violations.id) as violations_count')
            ->groupBy('classrooms.id', 'classrooms.name')
            ->orderByDesc('violations_count')
            ->get();

        // Top Students ranking (limit 10)
        $topStudents = Student::with('classroom')
            ->select('students.id', 'students.name', 'students.classroom_id')
            ->join('violations', 'violations.student_id', '=', 'students.id')
            ->selectRaw('count(violations.id) as violations_count')
            ->groupBy('students.id', 'students.name', 'students.classroom_id')
            ->orderByDesc('violations_count')
            ->limit(10)
            ->get();

        // Heatmap Data (top 10 Pasals on Y-axis, top 8 Classrooms on X-axis)
        $activePasals = Pasal::select('pasals.id', 'pasals.name')
            ->join('violations', 'violations.pasal_id', '=', 'pasals.id')
            ->selectRaw('count(violations.id) as count')
            ->groupBy('pasals.id', 'pasals.name')
            ->orderByDesc('count')
            ->limit(10)
            ->get();

        $activeClassrooms = Classroom::select('classrooms.id', 'classrooms.name')
            ->join('students', 'students.classroom_id', '=', 'classrooms.id')
            ->join('violations', 'violations.student_id', '=', 'students.id')
            ->selectRaw('count(violations.id) as count')
            ->groupBy('classrooms.id', 'classrooms.name')
            ->orderByDesc('count')
            ->limit(8)
            ->get();

        $heatmapData = Violation::join('students', 'violations.student_id', '=', 'students.id')
            ->select('violations.pasal_id', 'students.classroom_id')
            ->selectRaw('count(violations.id) as count')
            ->groupBy('violations.pasal_id', 'students.classroom_id')
            ->get();

        return Inertia::render('statistics/index', [
            'totalViolations' => $totalViolations,
            'activeViolations' => $activeViolations,
            'remisedViolations' => $remisedViolations,
            'levelCounts' => $levelCounts,
            'dailyTrends' => $dailyTrends,
            'monthlyTrends' => $monthlyTrends,
            'classroomStats' => $classroomStats,
            'topStudents' => $topStudents,
            'activePasals' => $activePasals,
            'activeClassrooms' => $activeClassrooms,
            'heatmapData' => $heatmapData,
        ]);
    }
}
