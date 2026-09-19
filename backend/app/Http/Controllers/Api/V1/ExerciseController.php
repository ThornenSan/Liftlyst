<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreExerciseRequest;
use App\Models\Exercise;
use Illuminate\Http\JsonResponse;

class ExerciseController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Exercise::orderBy('name')->get());
    }

    public function store(StoreExerciseRequest $request): JsonResponse
    {
        $validated = $request->validated();

        // Keyed on the client-supplied uuid, so a retried push updates the
        // existing row instead of creating a duplicate.
        $exercise = Exercise::updateOrCreate(
            ['uuid' => $validated['uuid']],
            ['name' => $validated['name']]
        );

        return response()->json($exercise, $exercise->wasRecentlyCreated ? 201 : 200);
    }
}
