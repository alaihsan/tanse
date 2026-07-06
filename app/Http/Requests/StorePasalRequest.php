<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StorePasalRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'ayat' => ['nullable', 'string', 'max:255'],
            'sub_ayat' => ['nullable', 'string', 'max:255'],
            'deskripsi_ayat' => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
            'keterangan' => ['nullable', 'string'],
            'level' => ['required', 'string', 'in:ringan,sedang,berat'],
            'sanction' => ['required', 'string'],
        ];
    }
}
