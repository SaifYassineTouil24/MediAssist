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
        Schema::table('patients', function (Blueprint $table) {
            $table->index('first_name');
            $table->index('last_name');
            $table->index('phone_num');
        });

        Schema::table('appointments', function (Blueprint $table) {
            // Composite index for querying by patient and date (for last/next appointment)
            $table->index(['ID_patient', 'appointment_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->dropIndex(['first_name']);
            $table->dropIndex(['last_name']);
            $table->dropIndex(['phone_num']);
        });

        Schema::table('appointments', function (Blueprint $table) {
            $table->dropIndex(['ID_patient', 'appointment_date']);
        });
    }
};
