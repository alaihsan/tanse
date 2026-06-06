<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Violation extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'student_id',
        'pasal_id',
        'user_id',
        'notes',
        'violation_date',
        'status',
        'remission_date',
        'remission_notes',
        'remission_user_id',
        'remission_attachment',
        'attachments',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'violation_date' => 'date',
            'remission_date' => 'date',
            'attachments' => 'array',
        ];
    }

    /**
     * Get the student who committed the violation.
     *
     * @return BelongsTo<Student, $this>
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * Get the rule article (pasal) that was violated.
     *
     * @return BelongsTo<Pasal, $this>
     */
    public function pasal(): BelongsTo
    {
        return $this->belongsTo(Pasal::class);
    }

    /**
     * Get the user/teacher who logged the violation.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the user/teacher who approved the remission.
     *
     * @return BelongsTo<User, $this>
     */
    public function remissionUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'remission_user_id');
    }
}
