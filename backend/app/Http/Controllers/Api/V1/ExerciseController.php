<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreExerciseRequest;
use App\Models\Exercise;
use Dedoc\Scramble\Attributes\Response;
use Illuminate\Http\JsonResponse;

class ExerciseController extends Controller
{
    /**
     * List exercises
     *
     * Returns every exercise, ordered by name.
     */
    public function index(): JsonResponse
    {
        return response()->json(Exercise::orderBy('name')->get());
    }

    /**
     * Create or update an exercise
     *
     * Idempotent on the client-supplied `uuid`. An offline client generates the
     * uuid before sending, so a push that is retried after a lost response
     * updates the existing exercise instead of creating a duplicate.
     */
    #[Response(status: 201, description: 'The exercise was created.')]
    #[Response(status: 200, description: 'An exercise with this uuid already existed and was updated. A retried push lands here — treat it as success.')]
    #[Response(status: 422, description: 'Validation failed.')]
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
