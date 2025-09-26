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
        Schema::create('certificats_medicaux', function (Blueprint $table) {
            $table->id('ID_CM');
            $table->date('start_date')->default(today());
            $table->date('end_date');
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
        Schema::dropIfExists('certificats_medicaux');
    }
};
