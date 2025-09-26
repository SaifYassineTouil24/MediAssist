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
        Schema::create('appointment_analyse', function (Blueprint $table) {
            $table->unsignedBigInteger('ID_RV');
            $table->unsignedBigInteger('ID_Analyse');

            // Define foreign keys
            $table->foreign('ID_RV')->references('ID_RV')->on('appointments')->onDelete('cascade');
            $table->foreign('ID_Analyse')->references('ID_Analyse')->on('analyses')->onDelete('cascade');

            $table->primary(['ID_RV', 'ID_Analyse']); // Composite primary key
            $table->timestamps();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appointment_analyse');
    }
};
