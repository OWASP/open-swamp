use assessment;
drop PROCEDURE if exists upgrade_23;
DELIMITER $$
CREATE PROCEDURE upgrade_23 ()
  BEGIN
    declare script_version_no int;
    declare cur_db_version_no int;
    set script_version_no = 23;

    select max(database_version_no)
      into cur_db_version_no
      from assessment.database_version;

    if cur_db_version_no < script_version_no then
      begin

        # Add new tools: error prone and checkstyle
        # remove old versions (only affects dev)
        delete from tool_shed.tool         where tool_uuid in ('56872C2E-1D78-4DB0-B976-83ACF5424C52','992A48A5-62EC-4EE9-8429-45BB94275A41');
        delete from tool_shed.tool_version where tool_uuid in ('56872C2E-1D78-4DB0-B976-83ACF5424C52','992A48A5-62EC-4EE9-8429-45BB94275A41');
        # add to tool table
        insert into tool_shed.tool (tool_uuid, tool_owner_uuid, name, tool_sharing_status, is_build_needed) values ('56872C2E-1D78-4DB0-B976-83ACF5424C52','80835e30-d527-11e2-8b8b-0800200c9a66','error-prone','PUBLIC',0);
        insert into tool_shed.tool (tool_uuid, tool_owner_uuid, name, tool_sharing_status, is_build_needed) values ('992A48A5-62EC-4EE9-8429-45BB94275A41','80835e30-d527-11e2-8b8b-0800200c9a66','checkstyle','PUBLIC',0);
        # add to tool_version table
        insert into tool_shed.tool_version
        (tool_version_uuid,                      tool_uuid,                            version_string,                 release_date,  comment_public,                                         comment_private,   tool_path,                                                                      tool_executable,         tool_arguments,  tool_directory,    checksum) values
        ('5230FE76-E658-4B3A-AD40-7D55F7A21955','56872C2E-1D78-4DB0-B976-83ACF5424C52','1.1.1',                         now(),        'error-prone v1.1.1',                                    NULL,             '/swamp/store/SCATools/error-prone/error-prone-1.1.1.tar.gz',                   '',                      '',              '',                '53105250ab926158a10804dea4cab5240b2b6099f7acd4104a0515779389253d12fe513485318c01494340f3fb0080b8d7e014b6cd71308cf6a7838cf5e5c0cd'),
        ('09449DE5-8E63-44EA-8396-23C64525D57C','992A48A5-62EC-4EE9-8429-45BB94275A41','5.7',                           now(),        'Checkstyle v5.7',                                       NULL,             '/swamp/store/SCATools/checkstyle/checkstyle-5.7-3.tar.gz',                     'checkstyle',            '',              'checkstyle',      'eef4291d5165b0b8e3d0d8d855feaed902f97b54cb3bfb94bcf013ff1006472c65154e14c271052c5563a2ad30a403e3225eba67c3af14db7d6d07961102ab12');

        # populate tool_language table
          # Code Table from package_store.package_type
            # 1 = C/C++
            # 2 = Java Source Code
            # 3 = Java Bytecode
        insert into tool_shed.tool_language (tool_uuid, tool_version_uuid, package_type_id) values
        # checkstyle -> Java Source Code
        ('992A48A5-62EC-4EE9-8429-45BB94275A41', '09449DE5-8E63-44EA-8396-23C64525D57C',2),
        # error-prone -> Java Source Code
        ('56872C2E-1D78-4DB0-B976-83ACF5424C52', '5230FE76-E658-4B3A-AD40-7D55F7A21955',2);

        # update database version number
        insert into assessment.database_version (database_version_no, description) values (script_version_no, 'upgrade');

        commit;
      end;
    end if;
END
$$
DELIMITER ;

