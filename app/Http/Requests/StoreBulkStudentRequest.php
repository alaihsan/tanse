<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\DB;

class StoreBulkStudentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $students = $this->input('students', []);
        if (is_array($students)) {
            foreach ($students as $key => $student) {
                if (isset($student['nis'])) {
                    $trimmedNis = trim($student['nis']);
                    $students[$key]['nis'] = $trimmedNis === '' ? null : $trimmedNis;
                }
                if (isset($student['name'])) {
                    $students[$key]['name'] = trim($student['name']);
                }
            }
            $this->merge(['students' => $students]);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'students' => ['required', 'array', 'min:1'],
            'students.*.name' => ['required', 'string', 'max:255'],
            'students.*.nis' => [
                'nullable',
                'string',
                'max:50',
                function (string $attribute, mixed $value, \Closure $fail) {
                    if ($value === null || $value === '') {
                        return;
                    }

                    // Check distinct in input
                    $allNis = collect($this->input('students'))->pluck('nis')->filter(function ($item) {
                        return $item !== null && $item !== '';
                    })->toArray();

                    $counts = array_count_values($allNis);
                    if (($counts[$value] ?? 0) > 1) {
                        $fail("NIS {$value} duplikat dalam data import.");
                    }

                    // Check unique in database
                    $exists = DB::table('students')->where('nis', $value)->exists();
                    if ($exists) {
                        $fail("NIS {$value} sudah terdaftar di database.");
                    }
                },
            ],
        ];
    }
}
