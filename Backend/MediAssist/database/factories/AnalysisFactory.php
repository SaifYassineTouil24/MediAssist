<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class AnalysisFactory extends Factory
{
    public function definition(): array
    {
        static $analyses = [
            "NFS (Numération formule sanguine)", "Glycémie à jeun", "Glycémie postprandiale", "Hémoglobine glyquée (HbA1c)",
            "Cholestérol total", "HDL", "LDL", "Triglycérides", "Bilan hépatique", "Bilirubine", "Phosphatases alcalines",
            "Gamma-GT", "Créatinine", "Urée", "Clairance créatinine", "Ionogramme", "Calcium", "Magnésium", "Potassium",
            "Sodium", "CRP", "VS", "TSH", "T3 libre", "T4 libre", "Bilan lipidique", "Bilan rénal", "Phosphocalcique",
            "Groupe sanguin", "Rhésus", "VIH", "Hépatite B", "Hépatite C", "Beta-HCG", "Hémoculture", "Coproculture",
            "ECBU", "Cytobactério crachats", "Mycologie", "Bilan martial", "COVID PCR", "COVID Antigène", "Électrophorèse",
            "Temps de saignement", "Temps de coagulation", "TP", "TCA", "Bilan allergologique", "IDR tuberculine",
            "LCR (liquide céphalo-rachidien)"
        ];

        static $index = 0;

        if ($index >= count($analyses)) {
            $index = 0; // recommence si on dépasse
        }

        return [
            'type_analyse' => $analyses[$index++],
            'departement' => $this->faker->randomElement(['Analyse']),
        ];
    }
}
