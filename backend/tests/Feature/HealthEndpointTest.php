<?php

declare(strict_types=1);

it('returns ok', function () {
    $this->getJson(route('api.v1.health'))
        ->assertOk()
        ->assertExactJson(['status' => 'ok']);
});
