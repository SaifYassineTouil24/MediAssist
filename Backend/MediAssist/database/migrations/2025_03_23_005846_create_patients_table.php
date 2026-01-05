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
        Schema::create('patients', function (Blueprint $table) {
            $table->id('ID_patient');
            $table->string('first_name');
            $table->string('last_name');
            $table->date('birth_day');
            $table->enum('gender', ['Male', 'Female']);
            $table->string('CIN')->unique();
            $table->string('phone_num');
            $table->enum('mutuelle', ['CNSS', 'CNOPS'])->nullable();
            $table->text('allergies')->nullable();
            $table->text('chronic_conditions')->nullable();
            $table->string('email')->nullable();
            $table->text('notes')->nullable();
            
            $table->boolean('archived')->default(false); // Ajout de la colonne archived

           
           
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('patients');
        
    }
};
