<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CaseDescription>
 */
class CaseDescriptionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            //
            'case_description' => $this->faker->text(200),
            'weight' => $this->faker->randomFloat(2, 40, 150),
            'pulse' => $this->faker->numberBetween(50, 120),
            'temperature' => $this->faker->randomFloat(1, 36.0, 40.0),
            'blood_pressure' => $this->faker->randomFloat(1, 90, 180),
            'tall' => $this->faker->randomFloat(2, 1.5, 2.1),
            'spo2' => $this->faker->numberBetween(90, 100),
            'notes' => $this->faker->paragraph(),
            'ID_RV' => \App\Models\Appointment::factory()->create()->ID_RV,
        ];
    }
}
