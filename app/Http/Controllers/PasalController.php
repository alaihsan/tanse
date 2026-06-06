<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePasalRequest;
use App\Models\ActivityLog;
use App\Models\Pasal;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PasalController extends Controller
{
    /**
     * Display a listing of rules (pasals).
     */
    public function index(): Response
    {
        $pasals = Pasal::orderBy('name')->orderBy('ayat')->get();

        return Inertia::render('pasals/index', [
            'pasals' => $pasals,
        ]);
    }

    /**
     * Store a newly created rule (pasal) in storage.
     */
    public function store(StorePasalRequest $request): RedirectResponse
    {
        $pasal = Pasal::create($request->validated());
        ActivityLog::log('CREATE', "Membuat pasal baru: {$pasal->name} ".($pasal->ayat ? "({$pasal->ayat})" : ''));

        return redirect()->route('pasals.index');
    }

    /**
     * Update the specified rule (pasal) in storage.
     */
    public function update(Pasal $pasal, StorePasalRequest $request): RedirectResponse
    {
        $pasal->update($request->validated());
        ActivityLog::log('UPDATE', "Mengubah pasal: {$pasal->name} ".($pasal->ayat ? "({$pasal->ayat})" : ''));

        return redirect()->route('pasals.index');
    }

    /**
     * Remove the specified rule (pasal) from storage.
     */
    public function destroy(Pasal $pasal): RedirectResponse
    {
        $name = $pasal->name;
        $ayat = $pasal->ayat;
        $pasal->delete();
        ActivityLog::log('DELETE', "Menghapus pasal: {$name} ".($ayat ? "({$ayat})" : ''));

        return redirect()->route('pasals.index');
    }
}
