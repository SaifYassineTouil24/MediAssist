<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use App\Models\UserSetting;
use App\Services\GoogleDriveService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class GoogleDriveSyncController extends Controller
{
    protected $googleDriveService;

    public function __construct(GoogleDriveService $googleDriveService)
    {
        $this->googleDriveService = $googleDriveService;
    }

    public function syncAllData(Request $request)
    {
        $user = Auth::user();
        $settings = $user->settings;

        if (!$settings || !$settings->google_token) {
            return response()->json([
                'success' => false,
                'message' => 'User not connected to Google Drive',
                'needs_auth' => true
            ], 401);
        }

        // Refresh token if needed
        $token = $this->googleDriveService->setAccessToken($settings->google_token);
        if ($token !== $settings->google_token) {
             $settings->google_token = $token;
             $settings->save();
        }

        // Fetch all patients with appointments
        $patients = Patient::with('appointments')->get();

        $data = [
            'backup_date' => now()->toIso8601String(),
            'total_patients' => $patients->count(),
            'doctor' => $user->name,
            'patients' => $patients->toArray()
        ];

        $jsonData = json_encode($data, JSON_PRETTY_PRINT);
        $fileName = 'MediAssist_Backup_' . now()->format('Y-m-d_H-i-s') . '.json';
        $folderName = 'MediAssist Backups';

        // Check/Create folder
        $folderId = $settings->google_drive_folder_id;
        if (!$folderId) {
            $folderId = $this->googleDriveService->createFolder($folderName);
            if ($folderId) {
                $settings->google_drive_folder_id = $folderId;
                $settings->save();
            }
        }

        // Upload file
        $fileId = $this->googleDriveService->uploadFile($jsonData, $fileName, $folderId);

        if ($fileId) {
            return response()->json([
                'success' => true,
                'message' => 'Tous les données ont été synchronisées avec succès sur Google Drive.',
                'file_id' => $fileId
            ]);
        } else {
             return response()->json([
                'success' => false,
                'message' => 'Échec de l\'upload sur Google Drive.'
            ], 500);
        }
    }
}
