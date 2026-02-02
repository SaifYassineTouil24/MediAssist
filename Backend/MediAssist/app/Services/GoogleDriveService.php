<?php

namespace App\Services;

use Google\Client;
use Google\Service\Drive;
use Google\Service\Drive\DriveFile;
use Illuminate\Support\Facades\Log;

class GoogleDriveService
{
    protected $client;
    protected $service;

    public function __construct()
    {
        $this->client = new Client();
        $this->client->setClientId(config('services.google.client_id'));
        $this->client->setClientSecret(config('services.google.client_secret'));
        $this->client->setRedirectUri(config('services.google.redirect_uri'));
        $this->client->setAccessType('offline');
        $this->client->setPrompt('consent');
        $this->client->setScopes([
            'https://www.googleapis.com/auth/drive.file',
        ]);
    }

    public function getAuthUrl()
    {
        return $this->client->createAuthUrl();
    }

    public function authenticate($code)
    {
        try {
            $token = $this->client->fetchAccessTokenWithAuthCode($code);
            return $token;
        } catch (\Exception $e) {
            Log::error('Google Drive Auth Error: ' . $e->getMessage());
            return null;
        }
    }

    public function setAccessToken($token)
    {
        $this->client->setAccessToken($token);
        if ($this->client->isAccessTokenExpired()) {
            if ($this->client->getRefreshToken()) {
                $this->client->fetchAccessTokenWithRefreshToken($this->client->getRefreshToken());
                return $this->client->getAccessToken();
            }
        }
        return $token;
    }

    public function getService()
    {
        if (!$this->service) {
            $this->service = new Drive($this->client);
        }
        return $this->service;
    }

    public function createFolder($folderName, $parentId = null)
    {
        $service = $this->getService();
        $fileMetadata = new DriveFile([
            'name' => $folderName,
            'mimeType' => 'application/vnd.google-apps.folder',
            'parents' => $parentId ? [$parentId] : []
        ]);

        try {
            $file = $service->files->create($fileMetadata, ['fields' => 'id']);
            return $file->id;
        } catch (\Exception $e) {
            Log::error('Google Drive Create Folder Error: ' . $e->getMessage());
            return null;
        }
    }

    public function uploadFile($content, $fileName, $folderId = null)
    {
        $service = $this->getService();
        $fileMetadata = new DriveFile([
            'name' => $fileName,
            'parents' => $folderId ? [$folderId] : []
        ]);

        try {
            $file = $service->files->create($fileMetadata, [
                'data' => $content,
                'mimeType' => 'application/json',
                'uploadType' => 'multipart',
                'fields' => 'id'
            ]);
            return $file->id;
        } catch (\Exception $e) {
            Log::error('Google Drive Upload Error: ' . $e->getMessage());
            return null;
        }
    }
}
