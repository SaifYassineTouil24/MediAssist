<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Patient;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class MedecinController extends Controller
{
    public function dashboard()
    {
        try {

            $today = now()->format('Y-m-d');

            // =========================
            // CURRENT PATIENT
            // =========================
            $currentPatient = Appointment::with('patient')
                ->where('status', 'En consultation')
                ->whereDate('appointment_date', $today)
                ->latest()
                ->first();

            // =========================
            // WAITING
            // =========================
            $waitingPatients = Appointment::with('patient')
                ->where('status', 'Salle dattente')
                ->whereDate('appointment_date', $today)
                ->orderBy('created_at', 'asc')
                ->get();

            // =========================
            // PREPARING
            // =========================
            $preparingPatients = Appointment::with('patient')
                ->where('status', 'En préparation')
                ->whereDate('appointment_date', $today)
                ->orderBy('updated_at', 'asc')
                ->get();

            // =========================
            // COMPLETED
            // =========================
            $completedPatients = Appointment::with('patient')
                ->where('status', 'Terminé')
                ->whereDate('appointment_date', $today)
                ->orderBy('updated_at', 'desc')
                ->get();

            // =========================
            // CANCELLED
            // =========================
            $cancelledPatients = Appointment::with('patient')
                ->where('status', 'Annulé')
                ->whereDate('appointment_date', $today)
                ->orderBy('updated_at', 'desc')
                ->get();

            // =========================
            // UPCOMING APPOINTMENTS
            // =========================
            $upcomingAppointments = Appointment::with('patient')
                ->whereDate('appointment_date', '>', $today)
                ->orderBy('appointment_date', 'asc')
                ->limit(10)
                ->get();

            // =========================
            // COUNTS
            // =========================
            $totalPatients = Patient::count();

            $todayPatients = Appointment::whereDate('appointment_date', $today)->count();

            $activeAppointments = Appointment::whereDate('appointment_date', $today)
                ->whereIn('status', ['Salle dattente', 'En préparation', 'En consultation'])
                ->count();

            // =========================
            // AVERAGE CONSULTATION TIME
            // =========================
            $averageConsultationTime = $this->computeAverageConsultationTime($completedPatients);

            // =========================
            // REVENUE (BASED ON payement FIELD)
            // =========================
            $dailyRevenue = $completedPatients->sum('payement');

            $completedRevenue = $completedPatients->sum('payement');

            $pendingRevenue = Appointment::whereDate('appointment_date', $today)
                ->whereIn('status', ['Salle dattente', 'En préparation', 'En consultation'])
                ->sum('payement');

            // =========================
            // PAYMENT BREAKDOWN
            // (Values stored in "mutuelle" field)
            // =========================
            $paymentBreakdown = [
                'cash'     => $completedPatients->where('mutuelle', 'Espèces')->sum('payement'),
                'card'     => $completedPatients->where('mutuelle', 'Carte')->sum('payement'),
                'cheque'   => $completedPatients->where('mutuelle', 'Chèque')->sum('payement'),
                'mutuelle' => $completedPatients->where('mutuelle', 'Mutuelle')->sum('payement'),
                'pending'  => $pendingRevenue
            ];

            // =========================
            // REVENUE BY CONSULTATION TYPE
            // =========================
            $revenueByType = [];

            foreach ($completedPatients as $appointment) {

                $type = $appointment->type ?? 'Autre';

                if (!isset($revenueByType[$type])) {
                    $revenueByType[$type] = [
                        'count' => 0,
                        'amount' => 0
                    ];
                }

                $revenueByType[$type]['count']++;
                $revenueByType[$type]['amount'] += $appointment->payement ?? 0;
            }

            // =========================
            // STATUS COUNTS FOR CHART
            // =========================
            $statusCounts = [
                'waiting'     => $waitingPatients->count(),
                'preparing'   => $preparingPatients->count(),
                'consulting'  => $currentPatient ? 1 : 0,
                'completed'   => $completedPatients->count(),
                'cancelled'   => $cancelledPatients->count(),
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'totalPatients'          => $totalPatients,
                    'todayPatients'          => $todayPatients,
                    'activeAppointments'     => $activeAppointments,

                    'currentPatient'         => $currentPatient,
                    'waitingPatients'        => $waitingPatients,
                    'preparingPatients'      => $preparingPatients,
                    'completedPatients'      => $completedPatients,
                    'cancelledPatients'      => $cancelledPatients,
                    'upcomingAppointments'   => $upcomingAppointments,

                    'averageConsultationTime'=> $averageConsultationTime,

                    'dailyRevenue'           => $dailyRevenue,
                    'completedRevenue'       => $completedRevenue,
                    'pendingRevenue'         => $pendingRevenue,

                    'paymentBreakdown'       => $paymentBreakdown,
                    'revenueByType'          => $revenueByType,

                    'statusCounts'           => $statusCounts,
                ]
            ]);

        } catch (\Exception $e) {

            Log::error("Dashboard error: ".$e->getMessage());

            return response()->json([
                'success' => false,
                'message' => "Erreur lors du chargement du dashboard",
                'error'   => $e->getMessage()
            ], 500);
        }
    }


    private function computeAverageConsultationTime($appointments)
    {
        if ($appointments->isEmpty()) return 0;

        $totalMinutes = 0;
        $count = 0;

        foreach ($appointments as $appointment) {
            // Priority 1: Use specific consultation timestamps
            if ($appointment->consultation_started_at && $appointment->consultation_ended_at) {
                $start = Carbon::parse($appointment->consultation_started_at);
                $end = Carbon::parse($appointment->consultation_ended_at);
                
                $minutes = $end->diffInMinutes($start);
                
                // Only count reasonable durations (e.g. < 4 hours and > 0)
                if ($minutes > 0 && $minutes < 240) {
                    $totalMinutes += $minutes;
                    $count++;
                    continue;
                }
            }

            // Priority 2: Fallback to updated_at - created_at (Old Logic but Safer)
            // Only if timestamps are missing or invalid
            $start = $appointment->created_at;
            $end = $appointment->updated_at;

            // Ensure start is before end
            if ($start && $end && $end->gt($start)) {
                 $minutes = $end->diffInMinutes($start);
                 // Filter out extremely long durations (e.g. created days ago) which might skew data
                 // Only count if it's within the same day logic roughly (e.g. < 4 hours)
                 if ($minutes > 0 && $minutes < 240) {
                    $totalMinutes += $minutes;
                    $count++;
                 }
            }
        }

        return $count > 0 ? round($totalMinutes / $count) : 0;
    }

    public function updateStatus(\Illuminate\Http\Request $request)
    {
        $validated = $request->validate([
            'appointment_id' => 'required|exists:appointments,ID_RV',
            'status' => 'required|string'
        ]);

        $appointment = Appointment::find($validated['appointment_id']);
        $appointment->status = $validated['status'];

        if ($validated['status'] === 'Terminé') {
            $appointment->consultation_ended_at = now();
        }

        $appointment->save();

        return response()->json([
            'success' => true,
            'status' => $appointment->status
        ]);
    }

    public function navigatePatient(\Illuminate\Http\Request $request)
    {
        $validated = $request->validate([
            'direction' => 'required|in:next,previous'
        ]);
        
        $today = now()->format('Y-m-d');
        
        if ($validated['direction'] === 'next') {
            // Logic: Take the first waiting patient and move them to consulting
            
            // 1. Check if there is already someone in consultation? 
            // Ideally we might want to finish them, but the user might just want to switch
            // For now, let's just grab the next one.
            
            $nextPatient = Appointment::where('status', 'Salle dattente')
                ->whereDate('appointment_date', $today)
                ->orderBy('created_at', 'asc') // First in first out
                ->first();

            if (!$nextPatient) {
                // Check preparing?
                $nextPatient = Appointment::where('status', 'En préparation')
                    ->whereDate('appointment_date', $today)
                    ->orderBy('created_at', 'asc')
                    ->first();
            }
            
            if ($nextPatient) {
                $nextPatient->status = 'En consultation';
                $nextPatient->consultation_started_at = now();
                $nextPatient->save();
                return response()->json(['success' => true, 'appointment' => $nextPatient]);
            }
            
            return response()->json(['success' => false, 'message' => 'Aucun patient en attente']);

        } else {
            // Previous: Logic to "undo" or just go back? 
            // The UI button says "Précédent". Usually this means taking the last FINISHED patient back to consulting?
            // Or just showing the previous patient in the list?
            // Given the context of a queue, "Previous" usually implies picking up the last person who was seen.
            
            $lastPatient = Appointment::where('status', 'Terminé')
                ->whereDate('appointment_date', $today)
                ->orderBy('updated_at', 'desc') // Most recently finished
                ->first();
                
            if ($lastPatient) {
                $lastPatient->status = 'En consultation';
                // Usually we shouldn't reset start time here as it's a resume? 
                // But for simplicity let's leave it or set it if null.
                if (!$lastPatient->consultation_started_at) {
                    $lastPatient->consultation_started_at = now();
                }
                $lastPatient->save();
                return response()->json(['success' => true, 'appointment' => $lastPatient]);
            }
            
            return response()->json(['success' => false, 'message' => 'Aucun patient précédent trouvé']);
        }
    }

    public function returnToConsultation(\Illuminate\Http\Request $request)
    {
        $validated = $request->validate([
            'appointment_id' => 'required|exists:appointments,ID_RV'
        ]);

        $appointment = Appointment::find($validated['appointment_id']);
        $appointment->status = 'En consultation';
        
        // Convert to Carbon/DateTime string for now()
        // If coming from another state back to consultation, maybe we update start time?
        // Or keep original? Let's treat it as a new segment for simplicity in "current patient" logic
        // but average time might get tricky. 
        // Best approach: If it was NULL, set it. If it was set, maybe keep it?
        // Let's set it if null.
        if (!$appointment->consultation_started_at) {
            $appointment->consultation_started_at = now();
        }
        
        $appointment->save();

        return response()->json([
            'success' => true,
            'appointment' => $appointment
        ]);
    }

    public function getAppointmentsByDate($date)
    {
         $appointments = Appointment::with('patient')
            ->whereDate('appointment_date', $date)
            ->get(); // You might want to format this or group it

         return response()->json(['success' => true, 'data' => $appointments]);
    }
}
