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
        Schema::create('appointment_medicament', function (Blueprint $table) {
            $table->unsignedBigInteger('ID_RV');
            $table->unsignedBigInteger('ID_Medicament');

            // Define foreign keys
            $table->foreign('ID_RV')->references('ID_RV')->on('appointments')->onDelete('cascade');
            $table->foreign('ID_Medicament')->references('ID_Medicament')->on('medicaments')->onDelete('cascade');

            $table->primary(['ID_RV', 'ID_Medicament']); // Composite primary key
            $table->timestamps();
            $table->string('dosage')->nullable();
            $table->string('frequence')->nullable();
            $table->string('duree')->nullable();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appointment_medicament');
    }
};
