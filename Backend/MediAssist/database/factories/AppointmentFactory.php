<?php

namespace Database\Factories;

use App\Models\Appointment;
use App\Models\Patient;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Appointment>
 */
class AppointmentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'appointment_date' => $this->faker->dateTimeBetween('now', '+2 months')->format('Y-m-d'),
            'type' => $this->faker->randomElement(['Consultation', 'Control']),
            'status' => $this->faker->randomElement(['Programmé', "Salle dattente", 'En préparation', 'En consultation', 'Terminé', 'Annulé']),
            'Diagnostic' => $this->faker->sentence(),
            'mutuelle' => $this->faker->boolean(),
            'payement' => $this->faker->numberBetween(0, 500),
            'ID_patient' => function () {
                $patient = Patient::factory()->create();

                // Créer au moins 3 rendez-vous pour chaque patient
                Appointment::factory()->times(3)->create([
                    'ID_patient' => $patient->ID_patient,
                ]);
                return $patient->ID_patient;
            }
        ];
    }
}
