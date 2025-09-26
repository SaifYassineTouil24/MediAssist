<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class MedicamentFactory extends Factory
{
    public function definition(): array
    {
        $noms = [
            'Doliprane', 'Amoxicilline', 'Paracetamol', 'Ibuprofène', 'Azithromycine',
            'Augmentin', 'Flagyl', 'Rhinathiol', 'Aerius', 'Zyrtec', 'Nexium', 'Motilium'
        ];

        $dosages = ['500mg', '1g', '250mg/5ml', '400mg', '875mg/125mg', '10mg', '40mg'];
        $classes = [
            'Analgésiques', 'Antibiotiques', 'Antipyrétiques', 'Anti-inflammatoires', 
            'Antihistaminiques', 'Antispasmodiques', 'Antiseptiques digestifs'
        ];
        $compositions = [
            'Paracétamol', 'Amoxicilline', 'Ibuprofène', 'Azithromycine', 'Dompéridone', 
            'Esoméprazole', 'Loratadine', 'Desloratadine'
        ];

        return [
            'name' => $this->faker->randomElement($noms),
            'price' => $this->faker->randomFloat(2, 10, 100),
            'dosage' => $this->faker->randomElement($dosages),
            'composition' => $this->faker->randomElement($compositions),
            'Classe_thérapeutique' => $this->faker->randomElement($classes),
            'Code_ATCv' => strtoupper($this->faker->bothify('A##??##')),
            'archived' => false,
        ];
    }
}
