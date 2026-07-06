<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Pasal extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'ayat',
        'sub_ayat',
        'deskripsi_ayat',
        'description',
        'keterangan',
        'level',
        'sanction',
    ];

    /**
     * Get the violations referencing this article.
     *
     * @return HasMany<Violation, $this>
     */
    public function violations(): HasMany
    {
        return $this->hasMany(Violation::class);
    }
}
