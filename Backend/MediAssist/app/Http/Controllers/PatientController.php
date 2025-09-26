

<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class PatientController extends Controller
{
    // ✅ List patients (active or archived)
    public function index(Request $request)
    {
        $showArchived = $request->query('archived', false);

        $patients = Patient::with(['lastAppointment', 'nextAppointment'])
            ->where('archived', $showArchived)
            ->orderBy('name')
            ->get();

        return response()->json($patients);
    }

    // ✅ Show one patient by ID
    public function show($id)
    {
        $patient = Patient::with(['lastAppointment', 'nextAppointment'])
            ->findOrFail($id);

        return response()->json($patient);
    }

    // ✅ Create new patient
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'birth_day' => 'required|date',
            'gender' => 'required|in:Male,Female',
            'CIN' => 'required|string|max:255|unique:patients,CIN',
            'phone_num' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'mutuelle' => 'nullable|string',
            'allergies' => 'nullable|string',
            'chronic_conditions' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $validated['archived'] = false;

        $patient = Patient::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Patient ajouté avec succès',
            'patient' => $patient,
        ], 201);
    }

    // ✅ Update patient
    public function update(Request $request, $id)
    {
        $patient = Patient::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'birth_day' => 'required|date',
            'gender' => 'required|in:Male,Female',
            'CIN' => 'required|string|max:255|unique:patients,CIN,' . $id . ',ID_patient',
            'phone_num' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'mutuelle' => 'nullable|string',
            'allergies' => 'nullable|string',
            'chronic_conditions' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $patient->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Patient mis à jour avec succès',
            'patient' => $patient,
        ]);
    }

    // ✅ Archive/unarchive
    public function archive(Request $request, $id)
    {
        $patient = Patient::findOrFail($id);

        $request->validate([
            'archived' => 'required|boolean'
        ]);

        $patient->update([
            'archived' => $request->archived
        ]);

        return response()->json([
            'success' => true,
            'archived' => $patient->archived,
            'message' => $request->archived ? 'Patient archivé avec succès' : 'Patient désarchivé avec succès',
        ]);
    }

    // ✅ Search patients
    public function search(Request $request)
    {
        $term = $request->query('term');
        $showArchived = $request->query('archived', false);

        if (empty($term)) {
            return response()->json([]);
        }

        $patients = Patient::query()
            ->where('archived', $showArchived)
            ->where(function($query) use ($term) {
                $query->where('name', 'LIKE', "%{$term}%")
                      ->orWhere('CIN', 'LIKE', "%{$term}%")
                      ->orWhere('phone_num', 'LIKE', "%{$term}%")
                      ->orWhere('email', 'LIKE', "%{$term}%");
            })
            ->with(['lastAppointment', 'nextAppointment'])
            ->orderBy('name')
            ->limit(15)
            ->get();

        return response()->json($patients);
    }
}

