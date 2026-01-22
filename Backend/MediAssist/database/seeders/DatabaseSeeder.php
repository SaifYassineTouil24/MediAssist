<?php

namespace Database\Seeders;

use App\Models\Analysis;
use Illuminate\Database\Seeder;
use App\Models\Patient;
use App\Models\Appointment;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create 50 patients each with 3 appointments
        Patient::factory()
            ->count(50)
            ->has(Appointment::factory()->count(3))
            ->create();
            
        // Analysis::factory()->count(50)->create();
    }
}
