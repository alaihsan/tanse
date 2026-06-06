<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreClassroomRequest;
use App\Models\ActivityLog;
use App\Models\Classroom;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ClassroomController extends Controller
{
    /**
     * Display a listing of classrooms.
     */
    public function index(): Response
    {
        $classrooms = Classroom::with(['students.violations.pasal', 'students.violations.user'])->get();

        return Inertia::render('classrooms/index', [
            'classrooms' => $classrooms,
        ]);
    }

    /**
     * Store a newly created classroom in storage.
     */
    public function store(StoreClassroomRequest $request): RedirectResponse
    {
        $classroom = Classroom::create($request->validated());
        ActivityLog::log('CREATE', "Membuat kelas baru: {$classroom->name}");

        return redirect()->route('classrooms.index');
    }

    /**
     * Remove the specified classroom from storage.
     */
    public function destroy(Classroom $classroom): RedirectResponse
    {
        $name = $classroom->name;
        $classroom->delete();
        ActivityLog::log('DELETE', "Menghapus kelas: {$name}");

        return redirect()->route('classrooms.index');
    }
}
