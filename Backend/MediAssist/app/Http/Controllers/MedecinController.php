<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Carbon;

class MedecinController extends Controller
{
    public function dashboard()
    {
        try {
            $tomorrow = now()->addDay()->format('Y-m-d');

$tomorrowAppointments = Appointment::with('patient')
    ->whereDate('appointment_date', $tomorrow)
    ->get();
            $today = now()->format('Y-m-d');

            $currentPatient = Appointment::with(['patient', 'caseDescription', 'medicaments', 'analyses'])
                ->where('status', 'En consultation')
                ->whereDate('appointment_date', $today)
                ->latest()
                ->first();

            $viewingPatientId = Session::get('viewing_patient_id');
            $viewingMode = Session::get('viewing_mode', false);

            if ($viewingMode && $viewingPatientId) {
                $viewingPatient = Appointment::with('patient', 'caseDescription', 'medicaments', 'analyses')
                    ->whereDate('appointment_date', $today)
                    ->find($viewingPatientId);

                if ($viewingPatient) {
                    $currentPatient = $viewingPatient;
                }
            } elseif (!$currentPatient) {
                $currentPatient = Appointment::with('patient', 'caseDescription', 'medicaments', 'analyses')
                    ->where('status', 'Terminé')
                    ->whereDate('appointment_date', $today)
                    ->latest()
                    ->first();
            }

            $lastAppointment = null;
            if ($currentPatient && $currentPatient->patient) {
                $patientAppointments = $currentPatient->patient->Appointment()
                    ->with(['caseDescription', 'medicaments', 'analyses'])
                    ->orderBy('appointment_date', 'desc')
                    ->get();

                $lastAppointment = $patientAppointments->first();
            }

            $waitingPatients = Appointment::with('patient')
                ->where('status', 'Salle dattente')
                ->whereDate('appointment_date', $today)
                ->latest()
                ->get();

            $preparingPatients = Appointment::with('patient')
                ->where('status', 'En préparation')
                ->whereDate('appointment_date', $today)
                ->latest()
                ->get();

            $completedTodayPatients = Appointment::with('patient')
                ->where('status', 'Terminé')
                ->whereDate('appointment_date', $today)
                ->latest('updated_at')
                ->get();

            $averageTime = $this->calculateAverageTime($completedTodayPatients);
            $totalPatients = Patient::count();
            $todayPatients = Appointment::whereDate('appointment_date', $today)->count();
            $activeAppointments = Appointment::whereDate('appointment_date', $today)
                ->whereIn('status', ['Salle dattente', 'En préparation', 'En consultation'])
                ->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'currentPatient' => $currentPatient,
                    'lastAppointment' => $lastAppointment,
                    'waitingPatients' => $waitingPatients,
                    'preparingPatients' => $preparingPatients,
                    'completedTodayPatients' => $completedTodayPatients,
                    'averageTime' => $averageTime,
                    'totalPatients' => $totalPatients,
                    'todayPatients' => $todayPatients,
                    'activeAppointments' => $activeAppointments,
                    'viewingMode' => $viewingMode,
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur dans MedecinController@dashboard: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du chargement du dashboard',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    private function calculateAverageTime($appointments)
    {
        if ($appointments->isEmpty()) return 0;

        $totalMinutes = $appointments->sum(function ($appointment) {
            $start = $appointment->start_time ?? $appointment->created_at;
            $end = $appointment->end_time ?? $appointment->updated_at;
            return $end->diffInMinutes($start);
        });

        return round($totalMinutes / $appointments->count());
    }

    public function updateStatus(Request $request)
    {
        try {
            $appointment = Appointment::findOrFail($request->appointment_id);

            if ($request->status === 'consulting') {
                $activeConsultation = Appointment::where('status', 'En consultation')
                    ->where('ID_RV', '!=', $appointment->ID_RV)
                    ->first();

                if ($activeConsultation) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Il y a déjà un patient en consultation (' . $activeConsultation->patient->name . ').'
                    ], 409);
                }
            }

            $statusMap = [
    'completed' => 'Terminé',
    'Terminé' => 'Terminé',
    'canceled' => 'Annulé',
    'Annulé' => 'Annulé',
    'preparing' => 'En préparation',
    'consulting' => 'En consultation'
];

            $appointment->status = $statusMap[$request->status] ?? $request->status;
            $appointment->save();

            Session::forget('viewing_patient_id');
            Session::forget('viewing_mode');

            return response()->json([
                'success' => true,
                'message' => 'Statut mis à jour avec succès'
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur dans MedecinController@updateStatus: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour du statut',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function navigatePatient(Request $request)
    {
        // (Ton code reste identique, juste qu’il return JSON déjà → donc pas de changement ici)
        return parent::navigatePatient($request);
    }

    public function returnToConsultation()
    {
        // (Ton code reste identique, il return déjà JSON → pas besoin de vue)
        return parent::returnToConsultation();
    }

    public function getAppointmentsByDate($date)
    {
        try {
            $appointments = Appointment::whereDate('appointment_date', Carbon::parse($date)->toDateString())->get();
            return response()->json([
                'success' => true,
                'appointments' => $appointments
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des rendez-vous',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
