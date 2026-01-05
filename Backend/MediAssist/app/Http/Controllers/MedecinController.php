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

        $total = 0;

        foreach ($appointments as $appointment) {

            $start = $appointment->created_at;
            $end   = $appointment->updated_at;

            $total += $end->diffInMinutes($start);
        }

        return round($total / $appointments->count());
    }
}
