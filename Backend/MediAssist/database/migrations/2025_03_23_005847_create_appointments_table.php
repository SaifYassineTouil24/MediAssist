<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('appointments', function (Blueprint $table) {
            $table->id('ID_RV');
            $table->date('appointment_date')->default(today());
            $table->enum('type', ['Consultation', 'Control']); // Consultation / Controle
            $table->enum('status', ['Programmé', "Salle dattente", 'En préparation', 'En consultation', 'Terminé', 'Annulé'])->default('Programmé');
            $table->text('diagnostic')->nullable();
            $table->boolean('mutuelle')->default(false);
            $table->integer('payement')->default(0);
            $table->unsignedBigInteger('ID_patient'); // Must match the primary key type in patients
            $table->foreign('ID_patient')->references('ID_patient')->on('patients')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appointments');
}
};
