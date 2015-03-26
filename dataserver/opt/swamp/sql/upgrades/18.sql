use assessment;
drop PROCEDURE if exists upgrade_18;
DELIMITER $$
CREATE PROCEDURE upgrade_18 ()
  BEGIN
    declare script_version_no int;
    declare cur_db_version_no int;
    set script_version_no = 18;

    select max(database_version_no)
      into cur_db_version_no
      from assessment.database_version;

    if cur_db_version_no < script_version_no then
      begin

        # Add new tools to DB
        # Versions of clang & cppcheck for scientific 5.9 32-bit
        insert into tool_shed.tool_version
        (tool_version_uuid,                      tool_uuid,                            version_string,                 release_date,  comment_public,                                         comment_private,   tool_path,                                                                      tool_executable,         tool_arguments,  tool_directory,    checksum) values
        ('22ea5b8c-b908-11e3-8775-001a4a81450b','f212557c-3050-11e3-9a3e-001a4a81450b','3.3 Scientific 5.9-32',         now(),        'Clang Static Analyzer 3.3 for Scientific Linux 5.9-32', NULL,             '/swamp/store/SCATools/clang/tool-scientific-5.9-32-clang-sa-3.3.tar.gz',       'scan-build/scan-build', '',              'clang-3.3',       '4dd967396eed7a5d398e98e5669618f8b84478d259a83920b577936714dc1ecfbf7880cc08dbe73438805bc3dbfacdd12adb2b9324d963de83d28f1e220578fb'),
        ('765efd9a-b908-11e3-8775-001a4a81450b','163e5d8c-156e-11e3-a239-001a4a81450b','1.61 Scientific-5.9-32',        now(),        'Cppcheck 1.61 for Scientific-5.9-32',                   NULL,             '/swamp/store/SCATools/cppcheck/tool-scientific-5.9-32-cppcheck-1.61.tar.gz',   'cppcheck',              '',              'cppcheck-1.61',   '7abecc894bad18a5411ddd7f3de1e3916793802e48fcaf247d77f2de7892c70fc842145d5af867d7d9e11dfed9b29b21c8b34ed03cbae939d8b13bbdeb7b1f47');

        UPDATE tool_shed.tool_version SET platform_uuid='35bc77b9-7d3e-11e3-88bb-001a4a81450b' WHERE tool_version_uuid='22ea5b8c-b908-11e3-8775-001a4a81450b';
        UPDATE tool_shed.tool_version SET platform_uuid='35bc77b9-7d3e-11e3-88bb-001a4a81450b' WHERE tool_version_uuid='765efd9a-b908-11e3-8775-001a4a81450b';

        # new versions of pmd & findbugs
        update tool_shed.tool_version
           set tool_path = '/swamp/store/SCATools/findbugs/findbugs-uw-2.0.2.tar.gz',
               checksum = 'b62f48751e65aee27c2ca3a786a410d58b32fab23373f7dca4d52e0823375393a6f7da0753f803d22f6c0cf83fbe51baf7b040406d8ca740c21557a34c7a5e53'
         where tool_version_uuid = '163fe1e7-156e-11e3-a239-001a4a81450b';

        update tool_shed.tool_version
           set tool_path = '/swamp/store/SCATools/pmd/pmd-5.0.4-modified.tar.gz',
               checksum = '35dd4ae0867b29067c60880df603cb863730864be12db019c5ea0a11fc75202a940dd5e32bb22b78b043b82a1a31976999333dca43319f2191968c97b8d4973a'
         where tool_version_uuid = '16414980-156e-11e3-a239-001a4a81450b';

        # Add Archie # owner uuid depends on environment
        insert into tool_shed.tool (tool_uuid, tool_owner_uuid, name, tool_sharing_status, is_build_needed) values ('3491d5e3-c184-11e3-8775-001a4a81450b','d4151469-0732-c16e-b975-94cd1d1a5ba4','Archie','PRIVATE',0);
        insert into tool_shed.tool_version
        (tool_version_uuid,                      tool_uuid,                            version_string,                 release_date,  comment_public,                                         comment_private,   tool_path,                                                                      tool_executable,         tool_arguments,  tool_directory,    checksum) values
        ('6c745d22-c184-11e3-8775-001a4a81450b','3491d5e3-c184-11e3-8775-001a4a81450b','1.3',                           now(),        'Archie v1.3',                                           NULL,             '/swamp/store/SCATools/archie/archie-1.3.tar.gz',                               'bin/archie.jar',        '',              'archie-1.3',      '1141cd12fcdaf8e5350d972c802bc33fd4f7c306c9310d263c4f3d706bad13bee074327e7a80aff3bd2540e648d3d02ee1603b332cb5bb5521bd15a133a04ed9');

        # update database version number
        insert into assessment.database_version (database_version_no, description) values (script_version_no, 'upgrade');

        commit;
      end;
    end if;
END
$$
DELIMITER ;
