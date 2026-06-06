<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBulkStudentRequest;
use App\Http\Requests\StoreStudentRequest;
use App\Models\ActivityLog;
use App\Models\Classroom;
use App\Models\Student;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    /**
     * Store a newly created student in storage for a classroom.
     */
    public function store(Classroom $classroom, StoreStudentRequest $request): RedirectResponse
    {
        $student = $classroom->students()->create($request->validated());
        ActivityLog::log('CREATE', "Menambahkan murid {$student->name} (NIS: ".($student->nis ?? '-').") ke kelas {$classroom->name}");

        return redirect()->route('classrooms.index');
    }

    /**
     * Store multiple students in bulk from Excel data.
     */
    public function bulkStore(Classroom $classroom, StoreBulkStudentRequest $request): RedirectResponse
    {
        $students = $classroom->students()->createMany($request->validated()['students']);
        ActivityLog::log('CREATE', 'Mengimport secara bulk '.count($students)." murid ke kelas {$classroom->name}");

        return redirect()->route('classrooms.index');
    }

    /**
     * Remove the specified student from storage.
     */
    public function destroy(Student $student): RedirectResponse
    {
        $name = $student->name;
        $nis = $student->nis;
        $student->delete();
        ActivityLog::log('DELETE', "Menghapus murid: {$name} (NIS: ".($nis ?? '-').')');

        return redirect()->route('classrooms.index');
    }

    /**
     * Mutate (transfer) a student to a different classroom.
     */
    public function mutate(Student $student, Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'classroom_id' => ['required', 'exists:classrooms,id'],
        ]);

        $oldClassroom = $student->classroom;
        $newClassroom = Classroom::find($validated['classroom_id']);

        $student->update($validated);

        ActivityLog::log('UPDATE', "Mutasi murid {$student->name} dari kelas ".($oldClassroom ? $oldClassroom->name : '-').' ke kelas '.($newClassroom ? $newClassroom->name : '-'));

        return redirect()->route('classrooms.index');
    }
}
