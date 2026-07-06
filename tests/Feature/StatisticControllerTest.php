<?php

use App\Models\Classroom;
use App\Models\Pasal;
use App\Models\Student;
use App\Models\User;
use App\Models\Violation;

beforeEach(function () {
    $this->user = User::factory()->create();
});

it('redirects guests to login page from statistics', function () {
    $response = $this->get(route('statistics.index'));
    $response->assertRedirect('/login');
});

it('can access statistics page and receive proper datasets', function () {
    // Seed test data
    $classroom = Classroom::create(['name' => 'X IPA 1']);
    $student = Student::create([
        'classroom_id' => $classroom->id,
        'name' => 'Ahmad',
        'nis' => '10231',
    ]);
    $pasal = Pasal::create([
        'name' => 'Terlambat Masuk Sekolah',
        'ayat' => '1',
        'level' => 'ringan',
        'sanction' => 'Teguran',
    ]);

    Violation::create([
        'student_id' => $student->id,
        'pasal_id' => $pasal->id,
        'user_id' => $this->user->id,
        'violation_date' => now(),
        'status' => 'aktif',
    ]);

    $response = $this->actingAs($this->user)->get(route('statistics.index'));
    $response->assertSuccessful();

    // Verify Inertia response details
    $response->assertInertia(fn ($page) => $page
        ->component('statistics/index')
        ->has('totalViolations')
        ->has('activeViolations')
        ->has('remisedViolations')
        ->has('levelCounts')
        ->has('dailyTrends')
        ->has('monthlyTrends')
        ->has('classroomStats')
        ->has('topStudents')
        ->has('activePasals')
        ->has('activeClassrooms')
        ->has('heatmapData')
    );
});
