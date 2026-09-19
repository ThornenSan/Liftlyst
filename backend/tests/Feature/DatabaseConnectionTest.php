<?php

declare(strict_types=1);

use Illuminate\Support\Facades\DB;

it('runs against the postgres test database', function () {
    expect(DB::connection()->getDriverName())->toBe('pgsql')
        ->and(DB::connection()->getDatabaseName())->toBe('liftlyst_testing');
});
