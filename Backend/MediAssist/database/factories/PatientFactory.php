<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class PatientFactory extends Factory
{
    public function definition(): array
    {
        $allergies = [
            'Aucune',
            'Allergie à la pénicilline',
            'Allergie au gluten',
            'Allergie aux fruits à coque',
            'Allergie au lactose',
            'Allergie aux anti-inflammatoires',
            'Allergie aux piqûres d’insectes'
        ];

        $conditions = [
            'Aucune',
            'Diabète de type 2',
            'Hypertension artérielle',
            'Asthme chronique',
            'Hypothyroïdie',
            'Insuffisance rénale',
            'Cardiopathie ischémique',
            'Arthrite rhumatoïde',
            'Sclérose en plaques',
            'Maladie de Crohn'
        ];

        return [
            'name' => $this->faker->name(),
            'birth_day' => $this->faker->date(),
            'gender' => $this->faker->randomElement(['Male', 'Female']),
            'CIN' => $this->faker->unique()->regexify('[A-Z]{2}[0-9]{6}'),
            'phone_num' => $this->faker->phoneNumber(),
            'mutuelle' => $this->faker->optional()->randomElement(['CNSS', 'CNOPS']),
            'allergies' => $this->faker->randomElement($allergies),
            'chronic_conditions' => $this->faker->randomElement($conditions),
        ];
    }
}
