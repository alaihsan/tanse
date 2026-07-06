<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreViolationRequest;
use App\Models\ActivityLog;
use App\Models\Classroom;
use App\Models\Pasal;
use App\Models\Violation;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ViolationController extends Controller
{
    /**
     * Display a listing of violations, along with data for adding new violations.
     */
    public function index(): Response
    {
        $violations = Violation::with(['student.classroom', 'pasal', 'user'])
            ->orderBy('violation_date', 'desc')
            ->orderBy('id', 'desc')
            ->get();

        $classrooms = Classroom::with('students')->orderBy('name')->get();
        $pasals = Pasal::orderBy('name')->orderBy('ayat')->get();

        return Inertia::render('violations/index', [
            'violations' => $violations,
            'classrooms' => $classrooms,
            'pasals' => $pasals,
        ]);
    }

    /**
     * Store a newly created violation log in storage.
     */
    public function store(StoreViolationRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $attachments = [];

        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $path = $file->store('violations', 'public');
                $attachments[] = $path;
            }
        }

        $violation = Violation::create(array_merge($data, [
            'user_id' => auth()->id(),
            'attachments' => $attachments,
        ]));

        ActivityLog::log('CREATE', 'Mencatat pelanggaran untuk '.($violation->student ? $violation->student->name : '-').': '.($violation->pasal ? $violation->pasal->name : '-'));

        return redirect()->route('violations.index');
    }

    /**
     * Remove the specified violation log from storage.
     */
    public function destroy(Violation $violation): RedirectResponse
    {
        $studentName = $violation->student ? $violation->student->name : 'Terhapus';
        $pasalName = $violation->pasal ? $violation->pasal->name : 'Terhapus';
        $violation->delete();
        ActivityLog::log('DELETE', "Menghapus catatan pelanggaran siswa {$studentName}: {$pasalName}");

        return redirect()->route('violations.index');
    }

    /**
     * Update the specified violation log in storage.
     */
    public function update(StoreViolationRequest $request, Violation $violation): RedirectResponse
    {
        $data = $request->validated();
        $attachments = $request->input('existing_attachments', $violation->attachments ?? []);

        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $path = $file->store('violations', 'public');
                $attachments[] = $path;
            }
        }

        $violation->update(array_merge($data, [
            'attachments' => $attachments,
        ]));

        ActivityLog::log('UPDATE', 'Memperbarui catatan pelanggaran untuk '.($violation->student ? $violation->student->name : '-').': '.($violation->pasal ? $violation->pasal->name : '-'));

        return redirect()->route('violations.index');
    }

    /**
     * Print warning letter for the violation.
     */
    public function print(Violation $violation): Response
    {
        $violation->load(['student.classroom', 'pasal', 'user']);

        return Inertia::render('violations/print', [
            'violation' => $violation,
        ]);
    }
}
