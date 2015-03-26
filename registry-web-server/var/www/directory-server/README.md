SWAMP Registry Server
=====================

Install
-------

* Run

      cp -r app/config.sample app/config
      composer install

* Edit `database.php`, and `ldap.php` for back end connections.
* Edit `session.php` for CORS with the Front End.
