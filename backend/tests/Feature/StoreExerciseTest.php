<?php

declare(strict_types=1);

const UUID = '44444444-4444-4444-8444-444444444444';

it('creates an exercise', function () {
    $this->postJson(route('api.v1.exercises.store'), [
        'uuid' => UUID,
        'name' => 'Front Squat',
    ])
        ->assertCreated()
        ->assertJsonPath('name', 'Front Squat');

    $this->assertDatabaseHas('exercises', [
        'uuid' => UUID,
        'name' => 'Front Squat',
    ]);
});

it('does not duplicate when the same uuid is sent again', function () {
    $payload = ['uuid' => UUID, 'name' => 'Front Squat'];

    $first = $this->postJson(route('api.v1.exercises.store'), $payload)->assertCreated();
    $second = $this->postJson(route('api.v1.exercises.store'), $payload)->assertOk();

    expect($second->json('id'))->toBe($first->json('id'));

    $this->assertDatabaseCount('exercises', 1);
});
