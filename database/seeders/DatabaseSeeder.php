<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $users = [
            ['name' => 'desi', 'email' => 'desi@example.com'],
            ['name' => 'ichsan', 'email' => 'ichsan@example.com'],
            ['name' => 'maylinda', 'email' => 'maylinda@example.com'],
            ['name' => 'anggi', 'email' => 'anggi@example.com'],
            ['name' => 'iyan', 'email' => 'iyan@example.com'],
        ];

        foreach ($users as $userData) {
            User::firstOrCreate(
                ['email' => $userData['email']],
                [
                    'name' => $userData['name'],
                    'password' => Hash::make('passwd'),
                ]
            );
        }
    }
}
