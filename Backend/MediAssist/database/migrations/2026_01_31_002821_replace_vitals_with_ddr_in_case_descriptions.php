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
        Schema::table('case_descriptions', function (Blueprint $table) {
            $table->dropColumn(['Glycimide', 'P', 'K', 'Sang']);
            $table->date('DDR')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('case_descriptions', function (Blueprint $table) {
            $table->float('Glycimide')->nullable();
            $table->string('P')->nullable();
            $table->string('K')->nullable();
            $table->string('Sang')->nullable();
            $table->dropColumn('DDR');
        });
    }
};
