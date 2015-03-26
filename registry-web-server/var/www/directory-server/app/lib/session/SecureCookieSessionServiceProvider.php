<?php

namespace  Lib\Session;

use Lib\Session\SecureCookieSessionHandler;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Config;

class SecureCookieSessionServiceProvider extends ServiceProvider {
    public function register(){
		$manager = $this->app['session'];
        $manager->extend('secure_cookie', function(){
            return new SecureCookieSessionHandler( $this->app['cookie'], Config::get('session.lifetime') );
        });
    }
}

