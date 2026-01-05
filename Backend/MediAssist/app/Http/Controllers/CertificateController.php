<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use Illuminate\Http\Request;

class CertificateController extends Controller
{
    /**
     * Store a new certificate
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'content' => 'required|string',
            'ID_patient' => 'required|exists:patients,ID_patient',
        ]);

        $certificate = Certificate::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Certificat créé avec succès',
            'certificate' => $certificate,
        ], 201);
    }

    /**
     * Delete a certificate
     */
    public function destroy(Certificate $certificate)
    {
        $certificate->delete();

        return response()->json([
            'success' => true,
            'message' => 'Certificat supprimé avec succès',
        ]);
    }

    /**
     * Get all certificates of a specific patient
     */
    public function index($patientId)
    {
        $certificates = Certificate::where('ID_patient', $patientId)->get();

        return response()->json([
            'success' => true,
            'certificates' => $certificates,
        ]);
    }

    /**
     * Get one certificate by ID
     */
    public function show(Certificate $certificate)
    {
        return response()->json([
            'success' => true,
            'certificate' => $certificate->load('patient'),
        ]);
    }
}
