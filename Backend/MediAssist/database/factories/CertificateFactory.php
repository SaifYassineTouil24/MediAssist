<?php

namespace Database\Factories;

use App\Models\Certificate;
use App\Models\Patient;
use Illuminate\Database\Eloquent\Factories\Factory;

class CertificateFactory extends Factory
{
    protected $model = Certificate::class;

    public function definition(): array
    {
        $start = $this->faker->dateTimeBetween('-1 month', 'now');
        $end = (clone $start)->modify('+'.rand(1, 10).' days');

        return [
            'start_date' => $start->format('Y-m-d'),
            'end_date' => $end->format('Y-m-d'),
            'content' => $this->faker->paragraph(),
            'ID_patient' => Patient::factory(),
        ];
    }
}
