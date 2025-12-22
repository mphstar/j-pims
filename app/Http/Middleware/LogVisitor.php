<?php

namespace App\Http\Middleware;

use App\Models\VisitorLog;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class LogVisitor
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Only log GET requests (page views)
        if ($request->isMethod('GET')) {
            // Generate session ID with fallback
            try {
                $sessionId = $request->session()->getId();
            } catch (\Exception $e) {
                $sessionId = md5($request->ip() . $request->userAgent() . date('Y-m-d'));
            }

            // Get pariwisata_id from route parameter if available
            $pariwisataId = null;
            $route = $request->route();
            if ($route) {
                // Check for slug parameter and try to find pariwisata
                $slug = $route->parameter('slug');
                if ($slug) {
                    $pariwisata = \App\Models\Pariwisata::where('slug', $slug)->first();
                    if ($pariwisata) {
                        $pariwisataId = $pariwisata->id;
                    }
                }
            }

            VisitorLog::create([
                'session_id' => $sessionId,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'page_url' => $request->fullUrl(),
                'referrer' => $request->header('referer'),
                'pariwisata_id' => $pariwisataId,
            ]);
        }

        return $next($request);
    }
}
