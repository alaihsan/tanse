<?php

use App\Models\Classroom;
use App\Models\Pasal;
use App\Models\Student;
use App\Models\User;
use App\Models\Violation;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    $this->user = User::factory()->create();
});

it('can access classrooms index page', function () {
    $response = $this->actingAs($this->user)->get(route('classrooms.index'));
    $response->assertSuccessful();
});

it('can create a classroom', function () {
    $response = $this->actingAs($this->user)->post(route('classrooms.store'), [
        'name' => 'X IPA 1',
    ]);

    $response->assertRedirect(route('classrooms.index'));
    $this->assertDatabaseHas('classrooms', [
        'name' => 'X IPA 1',
    ]);
});

it('can create a student under classroom with nis', function () {
    $classroom = Classroom::create(['name' => 'X IPA 1']);

    $response = $this->actingAs($this->user)->post(route('classrooms.students.store', $classroom->id), [
        'name' => 'Ahmad',
        'nis' => '10231',
    ]);

    $response->assertRedirect(route('classrooms.index'));
    $this->assertDatabaseHas('students', [
        'classroom_id' => $classroom->id,
        'name' => 'Ahmad',
        'nis' => '10231',
    ]);
});

it('can bulk import students under classroom', function () {
    $classroom = Classroom::create(['name' => 'X IPA 1']);

    $response = $this->actingAs($this->user)->post(route('classrooms.students.bulk', $classroom->id), [
        'students' => [
            ['nis' => '10231', 'name' => 'Andi Wijaya'],
            ['nis' => '10232', 'name' => 'Budi Prasetyo'],
        ],
    ]);

    $response->assertRedirect(route('classrooms.index'));
    $this->assertDatabaseHas('students', [
        'classroom_id' => $classroom->id,
        'nis' => '10231',
        'name' => 'Andi Wijaya',
    ]);
    $this->assertDatabaseHas('students', [
        'classroom_id' => $classroom->id,
        'nis' => '10232',
        'name' => 'Budi Prasetyo',
    ]);
});

it('can create a pasal', function () {
    $response = $this->actingAs($this->user)->post(route('pasals.store'), [
        'name' => 'Ketertiban',
        'ayat' => 'Ayat 1',
        'level' => 'ringan',
        'sanction' => 'Teguran lisan',
    ]);

    $response->assertRedirect(route('pasals.index'));
    $this->assertDatabaseHas('pasals', [
        'name' => 'Ketertiban',
        'ayat' => 'Ayat 1',
        'level' => 'ringan',
        'sanction' => 'Teguran lisan',
    ]);
});

it('can update a pasal', function () {
    $pasal = Pasal::create([
        'name' => 'Ketertiban',
        'ayat' => 'Ayat 1',
        'level' => 'ringan',
        'sanction' => 'Teguran lisan',
    ]);

    $response = $this->actingAs($this->user)->put(route('pasals.update', $pasal->id), [
        'name' => 'Ketertiban',
        'ayat' => 'Ayat 2',
        'level' => 'sedang',
        'sanction' => 'Teguran tertulis',
    ]);

    $response->assertRedirect(route('pasals.index'));
    $this->assertDatabaseHas('pasals', [
        'id' => $pasal->id,
        'ayat' => 'Ayat 2',
        'level' => 'sedang',
        'sanction' => 'Teguran tertulis',
    ]);
});

it('can create a violation log and records teacher id', function () {
    $classroom = Classroom::create(['name' => 'X IPA 1']);
    $student = Student::create(['classroom_id' => $classroom->id, 'name' => 'Ahmad']);
    $pasal = Pasal::create([
        'name' => 'Ketertiban',
        'ayat' => 'Ayat 1',
        'level' => 'ringan',
        'sanction' => 'Teguran lisan',
    ]);

    $response = $this->actingAs($this->user)->post(route('violations.store'), [
        'student_id' => $student->id,
        'pasal_id' => $pasal->id,
        'notes' => 'Terlambat masuk kelas',
        'violation_date' => '2026-06-06',
    ]);

    $response->assertRedirect(route('violations.index'));
    $this->assertDatabaseHas('violations', [
        'student_id' => $student->id,
        'pasal_id' => $pasal->id,
        'user_id' => $this->user->id,
        'notes' => 'Terlambat masuk kelas',
        'violation_date' => '2026-06-06 00:00:00',
    ]);
});

it('can mutate a student to a different classroom', function () {
    $classroomA = Classroom::create(['name' => 'X IPA 1']);
    $classroomB = Classroom::create(['name' => 'X IPA 2']);
    $student = Student::create(['classroom_id' => $classroomA->id, 'name' => 'Ahmad']);

    $response = $this->actingAs($this->user)->post(route('students.mutate', $student->id), [
        'classroom_id' => $classroomB->id,
    ]);

    $response->assertRedirect(route('classrooms.index'));
    $this->assertDatabaseHas('students', [
        'id' => $student->id,
        'classroom_id' => $classroomB->id,
    ]);
});

it('can access remissions index page', function () {
    $response = $this->actingAs($this->user)->get(route('remissions.index'));
    $response->assertSuccessful();
});

it('can access statistics index page', function () {
    $response = $this->actingAs($this->user)->get(route('statistics.index'));
    $response->assertSuccessful();
});

it('can grant remission to an active violation', function () {
    $classroom = Classroom::create(['name' => 'X IPA 1']);
    $student = Student::create(['classroom_id' => $classroom->id, 'name' => 'Ahmad']);
    $pasal = Pasal::create([
        'name' => 'Ketertiban',
        'ayat' => 'Ayat 1',
        'level' => 'ringan',
        'sanction' => 'Teguran lisan',
    ]);
    $violation = Violation::create([
        'student_id' => $student->id,
        'pasal_id' => $pasal->id,
        'user_id' => $this->user->id,
        'notes' => 'Terlambat',
        'violation_date' => '2026-06-06',
        'status' => 'aktif',
    ]);

    $response = $this->actingAs($this->user)->post(route('violations.remit', $violation->id), [
        'remission_notes' => 'Telah dihukum membersihkan kelas',
    ]);

    $response->assertRedirect(route('remissions.index'));
    $this->assertDatabaseHas('violations', [
        'id' => $violation->id,
        'status' => 'diremisi',
        'remission_notes' => 'Telah dihukum membersihkan kelas',
        'remission_user_id' => $this->user->id,
    ]);
});

it('can grant remission with an attachment file', function () {
    Storage::fake('public');

    $classroom = Classroom::create(['name' => 'X IPA 1']);
    $student = Student::create(['classroom_id' => $classroom->id, 'name' => 'Ahmad']);
    $pasal = Pasal::create([
        'name' => 'Ketertiban',
        'ayat' => 'Ayat 1',
        'level' => 'ringan',
        'sanction' => 'Teguran lisan',
    ]);
    $violation = Violation::create([
        'student_id' => $student->id,
        'pasal_id' => $pasal->id,
        'user_id' => $this->user->id,
        'notes' => 'Terlambat',
        'violation_date' => '2026-06-06',
        'status' => 'aktif',
    ]);

    $file = UploadedFile::fake()->create('bukti.pdf', 500);

    $response = $this->actingAs($this->user)->post(route('violations.remit', $violation->id), [
        'remission_notes' => 'Telah dimaafkan',
        'remission_attachment' => $file,
    ]);

    $response->assertRedirect(route('remissions.index'));

    $updatedViolation = Violation::find($violation->id);
    expect($updatedViolation->status)->toBe('diremisi');
    expect($updatedViolation->remission_attachment)->not->toBeNull();

    /** @var FilesystemAdapter $disk */
    $disk = Storage::disk('public');
    $disk->assertExists($updatedViolation->remission_attachment);
});

it('can log a violation with multiple attachment files', function () {
    Storage::fake('public');

    $classroom = Classroom::create(['name' => 'X IPA 1']);
    $student = Student::create(['classroom_id' => $classroom->id, 'name' => 'Ahmad']);
    $pasal = Pasal::create([
        'name' => 'Ketertiban',
        'ayat' => 'Ayat 1',
        'level' => 'ringan',
        'sanction' => 'Teguran lisan',
    ]);

    $file1 = UploadedFile::fake()->create('bukti1.jpg', 300);
    $file2 = UploadedFile::fake()->create('bukti2.pdf', 800);

    $response = $this->actingAs($this->user)->post(route('violations.store'), [
        'student_id' => $student->id,
        'pasal_id' => $pasal->id,
        'notes' => 'Tawuran',
        'violation_date' => '2026-06-06',
        'attachments' => [$file1, $file2],
    ]);

    $response->assertRedirect(route('violations.index'));

    $violation = Violation::where('student_id', $student->id)->where('pasal_id', $pasal->id)->first();
    expect($violation)->not->toBeNull();
    expect($violation->attachments)->toBeArray()->toHaveCount(2);

    /** @var FilesystemAdapter $disk */
    $disk = Storage::disk('public');
    $disk->assertExists($violation->attachments[0]);
    $disk->assertExists($violation->attachments[1]);
});

it('can record activity logs for CRUD operations', function () {
    $response = $this->actingAs($this->user)->post(route('classrooms.store'), [
        'name' => 'X IPA 3',
    ]);
    $this->assertDatabaseHas('activity_logs', [
        'action' => 'CREATE',
        'user_id' => $this->user->id,
        'description' => 'Membuat kelas baru: X IPA 3',
    ]);

    $classroom = Classroom::where('name', 'X IPA 3')->first();

    $response = $this->actingAs($this->user)->post(route('classrooms.students.store', $classroom->id), [
        'name' => 'Candra',
        'nis' => '10235',
    ]);
    $this->assertDatabaseHas('activity_logs', [
        'action' => 'CREATE',
        'user_id' => $this->user->id,
        'description' => 'Menambahkan murid Candra (NIS: 10235) ke kelas X IPA 3',
    ]);
});

it('can access history page', function () {
    $response = $this->actingAs($this->user)->get(route('history.index'));
    $response->assertSuccessful();
});

it('can perform dashboard search lookup', function () {
    $classroom = Classroom::create(['name' => 'X IPA 1']);
    $student = Student::create(['classroom_id' => $classroom->id, 'name' => 'Ahmad Dani']);

    $response = $this->actingAs($this->user)->get(route('dashboard', ['q' => 'Ahmad']));
    $response->assertSuccessful();
    $response->assertSee('Ahmad Dani');
});

it('can access print page for violation', function () {
    $classroom = Classroom::create(['name' => 'X IPA 1']);
    $student = Student::create(['classroom_id' => $classroom->id, 'name' => 'Ahmad']);
    $pasal = Pasal::create([
        'name' => 'Ketertiban',
        'ayat' => 'Ayat 1',
        'level' => 'ringan',
        'sanction' => 'Teguran lisan',
    ]);
    $violation = Violation::create([
        'student_id' => $student->id,
        'pasal_id' => $pasal->id,
        'user_id' => $this->user->id,
        'notes' => 'Terlambat',
        'violation_date' => '2026-06-06',
    ]);

    $response = $this->actingAs($this->user)->get(route('violations.print', $violation->id));
    $response->assertSuccessful();
});

it('can access print page for remission', function () {
    $classroom = Classroom::create(['name' => 'X IPA 1']);
    $student = Student::create(['classroom_id' => $classroom->id, 'name' => 'Ahmad']);
    $pasal = Pasal::create([
        'name' => 'Ketertiban',
        'ayat' => 'Ayat 1',
        'level' => 'ringan',
        'sanction' => 'Teguran lisan',
    ]);
    $violation = Violation::create([
        'student_id' => $student->id,
        'pasal_id' => $pasal->id,
        'user_id' => $this->user->id,
        'notes' => 'Terlambat',
        'violation_date' => '2026-06-06',
        'status' => 'diremisi',
        'remission_notes' => 'Telah dmaafkan',
        'remission_date' => now(),
        'remission_user_id' => $this->user->id,
    ]);

    $response = $this->actingAs($this->user)->get(route('remissions.print', $violation->id));
    $response->assertSuccessful();
});
