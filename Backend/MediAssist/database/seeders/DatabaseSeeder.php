<?php

namespace Database\Seeders;

use App\Models\Analysis;

use Illuminate\Database\Seeder;
use App\Models\Patient;
use App\Models\Appointment;
use App\Models\Medicament;
use App\Models\CompteRendu;
use App\Models\Certificate;
use App\Models\CaseDescription;
use App\Models\User;


class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        

        // Create 50 patients
        
        $analysis = Analysis::factory()->count(50)->create();
        





    }
}
