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
        Schema::create('medicaments', function (Blueprint $table) {
            $table->id('ID_Medicament');
            $table->string('name');
            $table->decimal('price', 8, 2);
            $table->string('dosage')->nullable();
            $table->text('composition')->nullable();
            $table->text('Classe_thérapeutique')->nullable();
            $table->string('Code_ATCv')->nullable();
            $table->boolean('archived')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('medicaments');
    }
};
