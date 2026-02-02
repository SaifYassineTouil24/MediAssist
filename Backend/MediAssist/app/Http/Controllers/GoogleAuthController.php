<?php

namespace App\Http\Controllers;

use App\Services\GoogleDriveService;
use Illuminate\Http\Request;
use App\Models\UserSetting;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class GoogleAuthController extends Controller
{
    protected $googleDriveService;

    public function __construct(GoogleDriveService $googleDriveService)
    {
        $this->googleDriveService = $googleDriveService;
    }

    public function getAuthUrl()
    {
        return response()->json([
            'url' => $this->googleDriveService->getAuthUrl()
        ]);
    }

    public function handleCallback(Request $request)
    {
        $code = $request->input('code');

        if (!$code) {
            return response()->json(['success' => false, 'message' => 'Authorization code missing'], 400);
        }

        $token = $this->googleDriveService->authenticate($code);

        if (!$token || isset($token['error'])) {
            return response()->json(['success' => false, 'message' => 'Failed to authenticate with Google'], 500);
        }

        $user = Auth::user();

        // Ensure user settings exist
        if (!$user->settings) {
            $user->settings()->create();
            $user->load('settings');
        }

        $user->settings->google_token = $token;
        $user->settings->save();

        return response()->json(['success' => true, 'message' => 'Google account connected successfully']);
    }
}
