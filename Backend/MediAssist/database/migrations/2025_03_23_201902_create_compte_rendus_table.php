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
        Schema::create('compte_rendus', function (Blueprint $table) {
            $table->id('ID_CR');
            $table->string('type');
            $table->string('description');
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
        Schema::dropIfExists('compte_rendus');
    }
};
