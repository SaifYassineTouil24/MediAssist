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
        Schema::create('user_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            // Appointment Settings
            $table->integer('appointment_duration')->default(30);
            $table->time('working_hours_start')->default('08:00');
            $table->time('working_hours_end')->default('18:00');
            $table->json('working_days')->nullable();
            $table->integer('max_appointments_per_day')->nullable();
            $table->boolean('allow_same_day_appointments')->default(true);
            
            // Notification Preferences
            $table->boolean('email_notifications')->default(true);
            $table->boolean('sms_reminders')->default(true);
            $table->string('reminder_timing')->default('1_day');
            $table->boolean('daily_summary_email')->default(false);
            
            // Display Preferences
            $table->string('language')->default('fr');
            $table->string('date_format')->default('DD/MM/YYYY');
            $table->string('time_format')->default('24h');
            $table->string('dashboard_layout')->default('detailed');
            $table->string('default_view')->default('calendar');
            
            // Practice Information
            $table->string('practice_name')->nullable();
            $table->string('specialization')->nullable();
            $table->string('license_number')->nullable();
            $table->text('address')->nullable();
            $table->string('phone')->nullable();
            $table->string('practice_email')->nullable();
            
            // Security
            $table->integer('session_timeout')->default(30);
            $table->boolean('two_factor_enabled')->default(false);
            
            $table->timestamps();
            
            $table->unique('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_settings');
    }
};
