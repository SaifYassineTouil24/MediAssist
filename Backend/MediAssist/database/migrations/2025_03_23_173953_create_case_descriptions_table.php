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
        Schema::create('case_descriptions', function (Blueprint $table) {
            $table->id();
            $table->text('case_description');
            $table->float('weight')->nullable();
            $table->float('pulse')->nullable();
            $table->float('temperature')->nullable();
            $table->string('blood_pressure')->nullable();
            $table->float('tall')->nullable();
            $table->float('spo2')->nullable();
            $table->text('notes')->nullable();
            $table->unsignedBigInteger('ID_RV');
            $table->foreign('ID_RV')->references('ID_RV')->on('appointments')->onDelete('cascade');

            $table->timestamps();
        });
    }



    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('case_descriptions');
    }
};
