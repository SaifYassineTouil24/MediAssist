<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserSetting extends Model
{
    protected $fillable = [
        'user_id',
        'appointment_duration',
        'working_hours_start',
        'working_hours_end',
        'working_days',
        'max_appointments_per_day',
        'allow_same_day_appointments',
        'email_notifications',
        'sms_reminders',
        'reminder_timing',
        'daily_summary_email',
        'language',
        'date_format',
        'time_format',
        'dashboard_layout',
        'default_view',
        'practice_name',
        'specialization',
        'license_number',
        'address',
        'phone',
        'practice_email',
        'session_timeout',
        'two_factor_enabled',
        'google_token',
        'google_drive_folder_id'
    ];

    protected $casts = [
        'working_days' => 'array',
        'google_token' => 'array',
        'allow_same_day_appointments' => 'boolean',
        'email_notifications' => 'boolean',
        'sms_reminders' => 'boolean',
        'daily_summary_email' => 'boolean',
        'two_factor_enabled' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
