<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HealthController extends Controller
{
    /**
     *  Health check
     *
     * Returns 200 with `{"status": "ok"}` when the API is reachable and the
     * framework boots. Deliberately shallow - it does not check database or
     * cache connectivity, so a slow dependency cannot make this endpoint slow.
     */
    public function __invoke(Request $request): JsonResponse
    {
        return response()->json(['status' => 'ok']);
    }
}
