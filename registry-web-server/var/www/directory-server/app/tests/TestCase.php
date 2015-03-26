<?php

/**
 * MAMP phpunit instructions:
 *
 * First: Add MAMPS php bin folder to your path.
 * Second:
 *   pear channel-discover pear.phpunit.de
 *   pear channel-discover pear.symfony.com
 *   pear channel-discover components.ez.no
 *   pear install phpunit/PHPUnit
 *
 * Alternatively install via composer.
 */

class TestCase extends Illuminate\Foundation\Testing\TestCase {

  /**
   * Creates the application.
   *
   * @return Symfony\Component\HttpKernel\HttpKernelInterface
   */
  public function createApplication()
  {
    $unitTesting = true;

    $testEnvironment = 'testing';

    return require __DIR__.'/../../bootstrap/start.php';
  }

}
