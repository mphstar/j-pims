<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\VisitorLog;
use Illuminate\Http\Request;

class VisitorLogController extends Controller
{
    /**
     * Log a visitor entry
     */
    public function log(Request $request)
    {
        // Handle stateless API requests
        try {
            $sessionId = $request->session()->getId();
        } catch (\Exception $e) {
            // Fallback: generate from IP + User Agent + Date
            $sessionId = md5($request->ip() . $request->userAgent() . date('Y-m-d'));
        }

        VisitorLog::create([
            'session_id' => $sessionId,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'page_url' => $request->input('page_url'),
            'referrer' => $request->input('referrer'),
            'pariwisata_id' => $request->input('pariwisata_id'),
        ]);

        return response()->json(['success' => true]);
    }
}
