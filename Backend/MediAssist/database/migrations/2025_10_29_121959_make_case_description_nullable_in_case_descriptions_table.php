<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('case_descriptions', function (Blueprint $table) {
            $table->text('case_description')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('case_descriptions', function (Blueprint $table) {
            $table->text('case_description')->nullable(false)->change();
        });
    }
};
