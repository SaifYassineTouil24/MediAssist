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
            $table->dropColumn('DDR');
        });

        Schema::table('patients', function (Blueprint $table) {
            $table->date('DDR')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->dropColumn('DDR');
        });

        Schema::table('case_descriptions', function (Blueprint $table) {
            $table->date('DDR')->nullable();
        });
    }
};
