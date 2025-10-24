<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\MedicamentController;
use App\Http\Controllers\AnalysisController;
use App\Http\Controllers\MedecinController;
use App\Http\Controllers\AuthController;



Route::middleware('api')->group(function () {

    // APPOINTMENTS
    Route::prefix('appointments')->group(function () {
        Route::get('/{date?}', [AppointmentController::class, 'index']);
        Route::get('/monthly-counts/{yearMonth}', [AppointmentController::class, 'monthlyCounts']);
        Route::post('/update-status', [AppointmentController::class, 'updateStatus']);
        Route::post('/toggle-mutuelle', [AppointmentController::class, 'toggleMutuelle']);
        Route::put('/{id}/details', [AppointmentController::class, 'editAppointmentDetails']);
        Route::get('/{id}/last-info', [AppointmentController::class, 'getLastAppointmentInfo']);
        Route::post('/update-price', [AppointmentController::class, 'updatePrice']);
        Route::get('/{id}/ordonnance', [AppointmentController::class, 'generateOrdonnance']);
        Route::get('/{id}/analysis-pdf', [AppointmentController::class, 'generateAnalysis']);
        Route::get('/{id}/edit-data', [AppointmentController::class, 'showEditData']);
        Route::get('/search-medicaments', [AppointmentController::class, 'searchMedicaments']);
        Route::get('/search-analyses', [AppointmentController::class, 'searchAnalyses']);
        Route::post('/', [AppointmentController::class, 'store']);
        Route::post('/v1', [AppointmentController::class, 'storeV1']);
        Route::post('/{id}/add-control', [AppointmentController::class, 'addControl']);
    });
    
    Route::get('/patients/search', [AppointmentController::class, 'search']);
});

// PATIENTS
Route::prefix('patients')->group(function () {
    Route::get('/', [PatientController::class, 'index']);          // GET list of patients (with pagination, supports ?archived=true)
    Route::get('/search', [PatientController::class, 'search']);   // GET /patients/search?term=...
    Route::get('/search-v2', [PatientController::class, 'searchV2']); // Optional lightweight search
    
    Route::post('/', [PatientController::class, 'store']);         // POST create new patient
    Route::get('/{id}', [PatientController::class, 'show']);       // GET single patient details
    Route::put('/{id}', [PatientController::class, 'update']);     // PUT full update
    Route::patch('/{id}/archive', [PatientController::class, 'archive']); // PATCH archive/unarchive
});

// MEDICAMENTS
Route::prefix('medicaments')->controller(MedicamentController::class)->group(function () {
    Route::get('/search', 'search');          // put search FIRST
    Route::get('/', 'index');
    Route::post('/', 'store');
    Route::put('{id}', 'update');             // keep this AFTER search
    Route::patch('{id}/archive', 'archive');
    Route::patch('{id}/restore', 'restore');
});


// ANALYSES
Route::prefix('analyses')->controller(AnalysisController::class)->group(function () {
    Route::get('/', 'index');              // GET /api/analyses
    Route::post('/', 'store');             // POST /api/analyses
    Route::put('{id}', 'update');          // PUT /api/analyses/{id}
    Route::patch('{id}/archive', 'archive'); // PATCH /api/analyses/{id}/archive
    Route::patch('{id}/restore', 'restore'); // PATCH /api/analyses/{id}/restore
    Route::delete('{id}', 'destroy');      // DELETE /api/analyses/{id}
    Route::get('/search', 'search');       // GET /api/analyses/search?term=...
});

//MEDECIN DASHBOARD
Route::prefix('medecin')->group(function () {
    Route::get('/dashboard', [MedecinController::class, 'dashboard']);
    Route::post('/update-status', [MedecinController::class, 'updateStatus']);
    Route::post('/navigate-patient', [MedecinController::class, 'navigatePatient']);
    Route::post('/return-to-consultation', [MedecinController::class, 'returnToConsultation']);
    Route::get('/appointments/{date}', [MedecinController::class, 'getAppointmentsByDate']);
});


Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::get('/user', [AuthController::class, 'user'])->middleware('auth:sanctum');
