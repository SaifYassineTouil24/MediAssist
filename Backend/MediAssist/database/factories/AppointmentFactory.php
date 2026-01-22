<?php

namespace Database\Factories;

use App\Models\Appointment;
use App\Models\Patient;
use Illuminate\Database\Eloquent\Factories\Factory;

class AppointmentFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Appointment::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        // statuses from migration: 'Programmé', 'Salle dattente', 'En préparation', 'En consultation', 'Terminé', 'Annulé'
        $status = $this->faker->randomElement(['Programmé', 'Salle dattente', 'En préparation', 'En consultation', 'Terminé', 'Annulé']);
        
        // types from migration: 'Consultation', 'Control'
        $type = $this->faker->randomElement(['Consultation', 'Control']);

        return [
            'ID_patient' => Patient::factory(),
            'appointment_date' => $this->faker->date(),
            // 'Date_RV' removed as it is not in the migration
            'type' => $type,
            'status' => $status,
            'mutuelle' => $this->faker->boolean(),
            'payement' => $this->faker->numberBetween(100, 1000),
            'Diagnostic' => $this->faker->optional()->sentence, // Model uses 'Diagnostic', DB uses 'diagnostic' (case insensitive usually works)
        ];
    }
}
