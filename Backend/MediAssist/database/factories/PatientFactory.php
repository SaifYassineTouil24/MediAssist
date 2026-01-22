<?php

namespace Database\Factories;

use App\Models\Patient;
use Illuminate\Database\Eloquent\Factories\Factory;

class PatientFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Patient::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'first_name' => $this->faker->firstName,
            'last_name' => $this->faker->lastName,
            'birth_day' => $this->faker->date('Y-m-d', '2005-01-01'),
            'gender' => $this->faker->randomElement(['Male', 'Female']),
            'CIN' => strtoupper($this->faker->bothify('??######')),
            'phone_num' => $this->faker->phoneNumber,
            'email' => $this->faker->unique()->safeEmail,
            'mutuelle' => $this->faker->randomElement(['CNSS', 'CNOPS', null]),
            'allergies' => $this->faker->optional(0.3)->sentence, // 30% chance of allergies
            'chronic_conditions' => $this->faker->optional(0.2)->sentence, // 20% chance of chronic conditions
            'notes' => $this->faker->optional()->paragraph,
            'archived' => false,
        ];
    }
}
