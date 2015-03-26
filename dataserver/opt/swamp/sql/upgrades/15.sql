use assessment;
drop PROCEDURE if exists upgrade_15;
DELIMITER $$
CREATE PROCEDURE upgrade_15 ()
  BEGIN
    declare script_version_no int;
    declare cur_db_version_no int;
    set script_version_no = 15;

    select max(database_version_no)
      into cur_db_version_no
      from assessment.database_version;

    if cur_db_version_no < script_version_no then
      begin
        # point packages to new versions that include OS dependencies
        # update package_store.package_version set package_path = '/swamp/store/SCAPackages/UW/updatedpkgs/asterisk-10.12.2.tar.gz',               checksum = '72ae45dbaf92c2ef96e6b33f83efd80ca0dcd1612162c4a297dc7b4490435897105dc3c94a45e6ef5302109d5a2835e1b25f6009d2e4d0c83a69e1dad22cbf5f' where package_path like '%asterisk-10.12.2.tar.gz%';
        # update package_store.package_version set package_path = '/swamp/store/SCAPackages/UW/updatedpkgs/asterisk-10.2.0.tar.gz',                checksum = 'c138658a117134a944ee263145ea7699d02f67beedee1bb957856319960c4b3225144444a140a7da684ab13d4d7760ec96dbc2b76728c6682564058b5486cca3' where package_path like '%asterisk-10.2.0.tar.gz%';
        # update package_store.package_version set package_path = '/swamp/store/SCAPackages/UW/updatedpkgs/audacity-minsrc-2.0.5.tar.xz',          checksum = '3072711717e56ab1534870fb748f4fbf42e8b9aec3d80293a0f99cd4f475ce359b0e39e1c09485001706f52a9b77c1f0e9bc3f7903a7f113c5aca3f248cc94a9' where package_path like '%audacity-minsrc-2.0.5.tar.xz%';
        # update package_store.package_version set package_path = '/swamp/store/SCAPackages/UW/updatedpkgs/bro-2.1.tar.gz',                        checksum = '19b253c53652f587528f82fd332e8946ee95c8ba37058bb41c54f7e809ec48498a18bf9cb28389c34beb96fb89a9685fbb1b9b17fbabe3964ec9f4acf2c95eaa' where package_path like '%bro-2.1.tar.gz%';
        # update package_store.package_version set package_path = '/swamp/store/SCAPackages/UW/updatedpkgs/condor_src-8.0.4-all-all.tar.gz',       checksum = '7808d50a4cdf1683833194289240bb90f99d66830ca07eae9cd70e5d88256a8059b5d1a5d801e8e895e0454097cec897caf638149f3be2640a4344c950ebfe84' where package_path like '%condor_src-8.0.4-all-all.tar.gz%';
        # update package_store.package_version set package_path = '/swamp/store/SCAPackages/UW/updatedpkgs/cppcheck-1.61.tar.bz2',                 checksum = '7b387949eae021b6fbcfce6eb271620c83190ca5a65cc3a46adbb236b0ea7620f427f8c0a5f37b4c86e43cc2b84fa7a10d08d53140f8f6e108650345e695f090' where package_path like '%cppcheck-1.61.tar.bz2%';
        # update package_store.package_version set package_path = '/swamp/store/SCAPackages/UW/updatedpkgs/cReddit-master.zip',                    checksum = '1589cff7637b57416cffa05ee58598d5104ad8c3a46bec3b538247fd452998a25bbc9bce09c2a825f287dbfd9f37aae00e268dd92568606ddb5908097afdf507' where package_path like '%cReddit-master.zip%';
        # update package_store.package_version set package_path = '/swamp/store/SCAPackages/UW/updatedpkgs/daq-2.0.1.tar.gz',                      checksum = '4c77d49e17cffe069ab9096d13671aba993024273bc3a3f56e182fd40a045853dd8d0c5c4032dd018671ec577ce07965df5836991b77f0c90874386c0df28102' where package_path like '%daq-2.0.1.tar.gz%';
        # update package_store.package_version set package_path = '/swamp/store/SCAPackages/UW/updatedpkgs/httpd-2.4.6.tar.bz2',                   checksum = '4c3d69ecf25e497863bad7ef27a3b38ce4a9db71f1a2ce4b53488bf266d01ff17c1366f55e0516e0c1684549d3daa45389e10fab9ee2ea4d7944eff63bbb445f' where package_path like '%httpd-2.4.6.tar%'; # httpd-2.4.6.tar.bz2
        # update package_store.package_version set package_path = '/swamp/store/SCAPackages/UW/updatedpkgs/kazmath-master.zip',                    checksum = '3cb7de43d054e58bf4931fb9961a5ac844a09668ec437ed42f6889e9c107502b5e8c3cfbef01f0a159e4954d264a941884f865209a1cafa7b23c30a3ffabe6b2' where package_path like '%kazmath-master.zip%';
        # update package_store.package_version set package_path = '/swamp/store/SCAPackages/UW/updatedpkgs/lighttpd-1.4.33.tar.gz',                checksum = '2ba2f345c2f88b75c53e8f5f4af36919aba9988f777d41bc177c7cfa65fad08d6dd414569fc5018fec6c03623374f2c8bcf49b15628118da0c867ed9c6659d73' where package_path like '%lighttpd-1.4.33.tar.gz%';
        # update package_store.package_version set package_path = '/swamp/store/SCAPackages/UW/updatedpkgs/lua-5.2.2.tar.gz',                      checksum = '588a1c62aec1316154a6229846f429d82b774e45363bac7406efcbd6016e0e9837d1982d4cb7a849d5aa3d0d336e708520357749c6d2287a7f87adcd91c886b1' where package_path like '%lua-5.2.2.tar.gz%';
        # update package_store.package_version set package_path = '/swamp/store/SCAPackages/UW/updatedpkgs/mysql-5.5.31.tar.gz',                   checksum = 'f9a5035b679eb6f48738bd83175286644d29a242727a8a5df7380a850e3db6043687fea04ea4a42c02fa56af5fd91734369770d52e69e7995752d85c929967c7' where package_path like '%mysql-5.5.31.tar.gz%';
        # update package_store.package_version set package_path = '/swamp/store/SCAPackages/UW/updatedpkgs/mysql-5.6.13.tar.gz',                   checksum = 'ae99b2c337ae144271e02d3c249c274e10ab56b1494a73b181be0253d3409ca526527330aaec51ed41eee37e042315028db131edf631c23a421206fbf5bbe099' where package_path like '%mysql-5.6.13.tar.gz%';
        # update package_store.package_version set package_path = '/swamp/store/SCAPackages/UW/updatedpkgs/pbc-master.zip',                        checksum = '0fe31bf75203a272bdad64db4cbf61fefc8dc875782fabee481258c6cf9dc746d984adddd6bf0becfe361ddb6917280901587b095ddf898b2a574538f0cff6b5' where package_path like '%pbc-master.zip%';
        # update package_store.package_version set package_path = '/swamp/store/SCAPackages/UW/updatedpkgs/peg-markdown-0.4.14.zip',               checksum = '22e00c1affc4048a115773f38320812da50b4c481b54415e06eac7b04286d4c2f0f7bd1d191e28b06199615dcdfa9e7c01da28e02d6c5bd52998dd78a8217188' where package_path like '%peg-markdown-0.4.14.zip%';
        # update package_store.package_version set package_path = '/swamp/store/SCAPackages/UW/updatedpkgs/postgresql-9.2.4.tar.gz',               checksum = 'fae46732fc5b9f7108625debcdcad0438d95cef0c6ebebe11557d898e06fb211c47b00e6ae0db2107fdc7e03824ffd346011bcf526b3ccab062326461c22abe8' where package_path like '%postgresql-9.2.4.tar.gz%';
        # update package_store.package_version set package_path = '/swamp/store/SCAPackages/UW/updatedpkgs/postgresql-9.3.1.tar.gz',               checksum = '1024489336ed6055fc7fb6a345a6077e7859f6a4c08446c283458223d32abefadc70ca896fa4064348cdc93188027d71d0b7ea6f43212c96c3217aaa8abd6504' where package_path like '%postgresql-9.3.1.tar.gz%';
        # update package_store.package_version set package_path = '/swamp/store/SCAPackages/UW/updatedpkgs/statsite-0.5.1.zip',                    checksum = 'bdba687037c37988f0df8b5ec8385f3ffbf34523d3ed2d45a31da6d730b8df5dcac92918ee1ec9e8ec814f68f013333cc34b70afa92d8e1910c13059d8d5c5a5' where package_path like '%statsite-0.5.1.zip%';
        # update package_store.package_version set package_path = '/swamp/store/SCAPackages/UW/updatedpkgs/suricata-1.4.5.tar.gz',                 checksum = 'f050d294df46a0b3b851faf8c3eb85f8f71fa5939862d342e19b13a56c288f292fd9738fe1f98541babd264cd13e7e832dc651df253b1e7cbf987c78beee164f' where package_path like '%suricata-1.4.5.tar.gz%';
        # update package_store.package_version set package_path = '/swamp/store/SCAPackages/UW/updatedpkgs/tig-tig-1.2.1.zip',                     checksum = '0a519fa802126b086c43bccac1c09141381b7c52a1f2cb1bffed9abe2a821c2018f3d47cadb8da4db9c1082ad0c3807ab3c7e2219bbdf37b9b40d223e3b25b07' where package_path like '%tig-tig-1.2.1.zip%';
        # update package_store.package_version set package_path = '/swamp/store/SCAPackages/UW/updatedpkgs/Unity-2.1.0.zip',                       checksum = '74b73db2f1a704314cabeaba56d35a0d47ff2b35f6ab89cb1321a33b4ce58a1be87bc90999619f17fb0082f31407ae3a44be54ffcc1c2fb87b0ada013c05945e' where package_path like '%Unity-2.1.0.zip%';
        # update package_store.package_version set package_path = '/swamp/store/SCAPackages/UW/updatedpkgs/vlc-2.1.0.tar.xz',                      checksum = '140fd3a080e891e520688c33a15b12f5695db5703a4d0eeb79cf6098d795a4ba073b3ef374c8e54618873ed54860d3dfe6ea3e3455c0e43cf6fdb0489c66604a' where package_path like '%vlc-2.1.0.tar.xz%';
        # update package_store.package_version set package_path = '/swamp/store/SCAPackages/UW/updatedpkgs/wireshark-1.10.2.tar.bz2',              checksum = 'be78208da7f34ff1a75932bc22f3786690294467b3c039e1880b0f37d87ffc965830fd81230cfd5528221a708f8d1b43d19324a4181eb0b621b09d11972a9cd3' where package_path like '%wireshark-1.10.2.tar.bz2%';
        # update package_store.package_version set package_path = '/swamp/store/SCAPackages/UW/updatedpkgs/wireshark-1.2.0.tar.gz',                checksum = '3701ecdf6da4b7de85427c834366387d4f3cae941293c77b57f2f29e909bc904b3c534728b585c27e7ddcafa144a2d4d4270b9f824ad71926c1d53691311e080' where package_path like '%wireshark-1.2.0.tar.gz%';
        # update package_store.package_version set package_path = '/swamp/store/SCAPackages/UW/updatedpkgs/wireshark-1.2.18.tar.gz',               checksum = '4f3c3774cfe17c1ef4d46c27d5e34dcb998a62744c77840d4e594bd5fd302434c6f330f1f27b1008f0adfb792ecd561b00b3ffe200556c02a53153614d0b9e3a' where package_path like '%wireshark-1.2.18.tar.gz%';
        # update package_store.package_version set package_path = '/swamp/store/SCAPackages/UW/updatedpkgs/wireshark-1.2.9.tar.bz2',               checksum = '39cc8547610a3ca39b658fddc474dc787b3d0f5e71bdb6273c874603d4f3a316d642c490a33d69b9fcf1a3e2490bb18d72de58c48c4797a522694d14bc2984f4' where package_path like '%wireshark-1.2.9.tar.bz2%';
        # update package_store.package_version set package_path = '/swamp/store/SCAPackages/UW/updatedpkgs/wireshark-1.8.0.tar.bz2',               checksum = '076e4b05e6dd82907fce08df6384c3114cb8a97959b64c22da840b2545a41f2c4e795216611d51b651a1a6507561065a5b384557f3699a15347e63fc5ed8ea33' where package_path like '%wireshark-1.8.0.tar.bz2%';
        # update package_store.package_version set package_path = '/swamp/store/SCAPackages/UW/updatedpkgs/wireshark-1.8.7.tar.bz2',               checksum = 'aabc143e32e9a2d03c0a75384afdfce578fd39441dd7f257aa8bc72ef37a61e85da13a7eef135941ccb3acfa3a145a0c3b6b46a36ec7f78331d2699823f909f3' where package_path like '%wireshark-1.8.7.tar.bz2%';
        # update package_store.package_version set package_path = '/swamp/store/SCAPackages/UW/updatedpkgs/yubico-c-client-ykclient-2.11.zip',     checksum = '58ef122b7332eba63c1ee12c091def2872ab684ddbeecce7477e02ec961acd5759cab2f6bd6f2a73775129705559867e5b711328bb783e9febae48b091ee3ad4' where package_path like '%yubico-c-client-ykclient-2.11.zip%';

       # fix c_hashmap and c-Thread-Pool
      update package_store.package_version
         set package_path = '/swamp/store/SCAPackages/UW/c_pkgs/c_hashmap-2013-01-08/c_hashmap-master.zip',
             checksum = 'fc6d3983068bd5125bce395f1030f6864e4af0023929b56f6a7275a5ca65e7dfdd05b5ab100602359cd2c6ff9b39a9e46972df3bec80f79c0ee09d9aab84269d',
             source_path = 'c_hashmap-master',
             build_cmd = 'gcc',
             build_opt = '-Wall main.c thpool.c -pthread -o test',
             build_system = 'other'
       where package_version_uuid = '9f5fc5ae-3a96-11e3-9a3e-001a4a81450b';
      #
      update package_store.package_version
         set package_path = '/swamp/store/SCAPackages/UW/c_pkgs/C-Thread-Pool-2011-08-12/C-Thread-Pool-master.zip',
             checksum = 'da2d240a1003421b98ef9ac2818263e5d05a7d20457c9adf4eb2b34e2dd517d7f627c78fa151d5bac93a67e23ab2ed6e9f5aef9a01d6af2db1b8275b29584e06',
             source_path = 'cctools-4.0.2-source',
             build_system = 'configure+make'
       where package_version_uuid = '1697fb7e-3a97-11e3-9a3e-001a4a81450b';


        # Fix package config settings Dave found inconsistent
        update package_store.package_version
           set build_system = 'make'
        where package_uuid in (select package_uuid from package_store.package where name like '%c_environment%');

        update package_store.package_version
           set source_path = 'ccan'
        where package_uuid in (select package_uuid from package_store.package where name like '%ccan%');

        update package_store.package_version
           set source_path = 'cctools-4.0.2-source'
              ,build_system = 'configure+make'
        where package_uuid in (select package_uuid from package_store.package where name like '%cctools%');

        update package_store.package_version
           set config_opt = '-DWITH_GLOBUS:BOOL=FALSE'
        where package_uuid in (select package_uuid from package_store.package where name like '%condor%');

        update package_store.package_version
           set build_opt = 'HAVE_RULES=yes'
        where package_uuid in (select package_uuid from package_store.package where name like '%cppcheck%');

        update package_store.package_version
           set build_dir = 'SwingSet'
        where package_uuid in (select package_uuid from package_store.package where name like '%esapi-swingset%');

        update package_store.package_version
           set build_target = 'linux'
        where package_uuid in (select package_uuid from package_store.package where name like '%lua%');

        update package_store.package_version
           set build_dir = 'WEB-INF'
        where package_uuid in (select package_uuid from package_store.package where name like '%mandiant-struts%');

        update package_store.package_version
           set build_target = 'all'
        where package_uuid in (select package_uuid from package_store.package where name like '%nagios%');

        update package_store.package_version
           set build_dir = 'trunk'
        where package_uuid in (select package_uuid from package_store.package where name like '%wavsep%');

        update package_store.package_version
           set build_dir = 'build'
        where package_uuid in (select package_uuid from package_store.package where name like '%yazd%');

        # update database version number
        insert into assessment.database_version (database_version_no, description) values (script_version_no, 'upgrade');

        commit;
      end;
    end if;
END
$$
DELIMITER ;
