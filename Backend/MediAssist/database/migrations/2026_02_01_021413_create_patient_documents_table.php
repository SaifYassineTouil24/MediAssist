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
        Schema::create('patient_documents', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('ID_patient');
            $table->string('document_name');
            $table->string('document_type')->nullable(); // e.g., 'scan', 'report', 'image'
            $table->string('file_path');
            $table->bigInteger('file_size')->nullable(); // in bytes
            $table->timestamp('uploaded_at')->useCurrent();
            $table->timestamps();
            
            // Foreign key constraint removed - ID_patient references patients table
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('patient_documents');
    }
};
