<?php

use App\Http\Controllers\ClassroomController;
use App\Http\Controllers\PasalController;
use App\Http\Controllers\RemissionController;
use App\Http\Controllers\StatisticController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\ViolationController;
use App\Models\ActivityLog;
use App\Models\Classroom;
use App\Models\Student;
use App\Models\Violation;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        $query = request()->query('q');
        $searchResults = null;

        if ($query) {
            $students = Student::with('classroom')
                ->where('name', 'like', "%{$query}%")
                ->orWhere('nis', 'like', "%{$query}%")
                ->limit(5)
                ->get();

            $classrooms = Classroom::where('name', 'like', "%{$query}%")
                ->limit(5)
                ->get();

            $violations = Violation::with(['student.classroom', 'pasal', 'user'])
                ->where('notes', 'like', "%{$query}%")
                ->orWhereHas('student', function ($q) use ($query) {
                    $q->where('name', 'like', "%{$query}%");
                })
                ->orWhereHas('pasal', function ($q) use ($query) {
                    $q->where('name', 'like', "%{$query}%");
                })
                ->limit(5)
                ->get();

            $searchResults = [
                'students' => $students,
                'classrooms' => $classrooms,
                'violations' => $violations,
            ];
        }

        return Inertia::render('dashboard', [
            'stats' => [
                'classrooms' => Classroom::count(),
                'students' => Student::count(),
                'activeViolations' => Violation::where('status', 'aktif')->count(),
                'remisedViolations' => Violation::where('status', 'diremisi')->count(),
            ],
            'searchResults' => $searchResults,
            'searchQuery' => $query ?? '',
        ]);
    })->name('dashboard');

    Route::resource('classrooms', ClassroomController::class);
    Route::post('classrooms/{classroom}/students', [StudentController::class, 'store'])->name('classrooms.students.store');
    Route::post('classrooms/{classroom}/students/bulk', [StudentController::class, 'bulkStore'])->name('classrooms.students.bulk');
    Route::delete('students/{student}', [StudentController::class, 'destroy'])->name('students.destroy');
    Route::post('students/{student}/mutate', [StudentController::class, 'mutate'])->name('students.mutate');
    Route::resource('pasals', PasalController::class);
    Route::resource('violations', ViolationController::class);
    Route::get('violations/{violation}/print', [ViolationController::class, 'print'])->name('violations.print');
    Route::get('remissions', [RemissionController::class, 'index'])->name('remissions.index');
    Route::post('violations/{violation}/remit', [RemissionController::class, 'store'])->name('violations.remit');
    Route::get('remissions/{violation}/print', [RemissionController::class, 'print'])->name('remissions.print');
    Route::get('statistics', [StatisticController::class, 'index'])->name('statistics.index');
    Route::get('penanganan-masalah', function () {
        return Inertia::render('problem-handling/index');
    })->name('problem-handling.index');
    Route::get('dokumentasi', function () {
        return Inertia::render('documentation/index');
    })->name('documentation.index');
    Route::get('history', function () {
        $logs = ActivityLog::with('user')->orderBy('created_at', 'desc')->get();

        return Inertia::render('history/index', [
            'logs' => $logs,
        ]);
    })->name('history.index');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
