<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Violation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RemissionController extends Controller
{
    /**
     * Display a listing of violations for remission.
     */
    public function index(): Response
    {
        $activeViolations = Violation::with(['student.classroom', 'pasal', 'user'])
            ->where('status', 'aktif')
            ->orderBy('violation_date', 'desc')
            ->get();

        $remisedViolations = Violation::with(['student.classroom', 'pasal', 'user', 'remissionUser'])
            ->where('status', 'diremisi')
            ->orderBy('remission_date', 'desc')
            ->get();

        return Inertia::render('remissions/index', [
            'activeViolations' => $activeViolations,
            'remisedViolations' => $remisedViolations,
        ]);
    }

    /**
     * Grant remission for a violation.
     */
    public function store(Request $request, Violation $violation): RedirectResponse
    {
        $request->validate([
            'remission_notes' => ['required', 'string'],
            'remission_attachment' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:2048'],
        ]);

        $updateData = [
            'status' => 'diremisi',
            'remission_notes' => $request->input('remission_notes'),
            'remission_date' => now(),
            'remission_user_id' => auth()->id(),
        ];

        if ($request->hasFile('remission_attachment')) {
            $path = $request->file('remission_attachment')->store('remissions', 'public');
            $updateData['remission_attachment'] = $path;
        }

        $violation->update($updateData);

        ActivityLog::log('UPDATE', 'Memberikan remisi kepada '.($violation->student ? $violation->student->name : 'Siswa').' untuk pelanggaran '.($violation->pasal ? $violation->pasal->name : 'Aturan'));

        return redirect()->route('remissions.index');
    }

    /**
     * Print remission decision letter.
     */
    public function print(Violation $violation): Response
    {
        $violation->load(['student.classroom', 'pasal', 'user', 'remissionUser']);

        return Inertia::render('remissions/print', [
            'violation' => $violation,
        ]);
    }
}
