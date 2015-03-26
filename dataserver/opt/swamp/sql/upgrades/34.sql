# v1.12
use assessment;
drop PROCEDURE if exists upgrade_34;
DELIMITER $$
CREATE PROCEDURE upgrade_34 ()
  BEGIN
    declare script_version_no int;
    declare cur_db_version_no int;
    set script_version_no = 34;

    select max(database_version_no)
      into cur_db_version_no
      from assessment.database_version;

    if cur_db_version_no < script_version_no then
      begin

        # Add Package URL
        ALTER TABLE package_store.package ADD COLUMN external_url VARCHAR(2000) COMMENT 'external url, eg GitHub' AFTER package_sharing_status;

        # populate tool_shed.tool_platform so we can start listing tool/platform compatabilities
        ALTER TABLE tool_shed.tool_platform DROP COLUMN platform_version_uuid;
        insert into tool_shed.tool_platform (tool_uuid, tool_version_uuid, platform_uuid, compatible_flag) values
          ('992A48A5-62EC-4EE9-8429-45BB94275A41', '09449DE5-8E63-44EA-8396-23C64525D57C', '1088c3ce-20aa-11e3-9a3e-001a4a81450b', 1),
          ('992A48A5-62EC-4EE9-8429-45BB94275A41', '09449DE5-8E63-44EA-8396-23C64525D57C', '8a51ecea-209d-11e3-9a3e-001a4a81450b', 1),
          ('992A48A5-62EC-4EE9-8429-45BB94275A41', '09449DE5-8E63-44EA-8396-23C64525D57C', 'a4f024eb-f317-11e3-8775-001a4a81450b', 1),
          ('992A48A5-62EC-4EE9-8429-45BB94275A41', '09449DE5-8E63-44EA-8396-23C64525D57C', 'd531f0f0-f273-11e3-8775-001a4a81450b', 1),
          ('992A48A5-62EC-4EE9-8429-45BB94275A41', '09449DE5-8E63-44EA-8396-23C64525D57C', 'd95fcb5f-209d-11e3-9a3e-001a4a81450b', 1),
          ('992A48A5-62EC-4EE9-8429-45BB94275A41', '09449DE5-8E63-44EA-8396-23C64525D57C', 'ee2c1193-209b-11e3-9a3e-001a4a81450b', 1),
          ('992A48A5-62EC-4EE9-8429-45BB94275A41', '09449DE5-8E63-44EA-8396-23C64525D57C', 'fc55810b-09d7-11e3-a239-001a4a81450b', 1);
        insert into tool_shed.tool_platform (tool_uuid, tool_version_uuid, platform_uuid, compatible_flag) values
          ('f212557c-3050-11e3-9a3e-001a4a81450b', '8ec206ff-f59b-11e3-8775-001a4a81450b', '1088c3ce-20aa-11e3-9a3e-001a4a81450b', 1),
          ('f212557c-3050-11e3-9a3e-001a4a81450b', '8ec206ff-f59b-11e3-8775-001a4a81450b', '8a51ecea-209d-11e3-9a3e-001a4a81450b', 1),
          ('f212557c-3050-11e3-9a3e-001a4a81450b', '8ec206ff-f59b-11e3-8775-001a4a81450b', 'a4f024eb-f317-11e3-8775-001a4a81450b', 1),
          ('f212557c-3050-11e3-9a3e-001a4a81450b', '8ec206ff-f59b-11e3-8775-001a4a81450b', 'd531f0f0-f273-11e3-8775-001a4a81450b', 1),
          ('f212557c-3050-11e3-9a3e-001a4a81450b', '8ec206ff-f59b-11e3-8775-001a4a81450b', 'd95fcb5f-209d-11e3-9a3e-001a4a81450b', 1),
          ('f212557c-3050-11e3-9a3e-001a4a81450b', '8ec206ff-f59b-11e3-8775-001a4a81450b', 'ee2c1193-209b-11e3-9a3e-001a4a81450b', 1),
          ('f212557c-3050-11e3-9a3e-001a4a81450b', '8ec206ff-f59b-11e3-8775-001a4a81450b', 'fc55810b-09d7-11e3-a239-001a4a81450b', 1);
        insert into tool_shed.tool_platform (tool_uuid, tool_version_uuid, platform_uuid, compatible_flag) values
          ('163e5d8c-156e-11e3-a239-001a4a81450b', '950734d0-f59b-11e3-8775-001a4a81450b', '1088c3ce-20aa-11e3-9a3e-001a4a81450b', 1),
          ('163e5d8c-156e-11e3-a239-001a4a81450b', '950734d0-f59b-11e3-8775-001a4a81450b', '8a51ecea-209d-11e3-9a3e-001a4a81450b', 1),
          ('163e5d8c-156e-11e3-a239-001a4a81450b', '950734d0-f59b-11e3-8775-001a4a81450b', 'a4f024eb-f317-11e3-8775-001a4a81450b', 1),
          ('163e5d8c-156e-11e3-a239-001a4a81450b', '950734d0-f59b-11e3-8775-001a4a81450b', 'd531f0f0-f273-11e3-8775-001a4a81450b', 1),
          ('163e5d8c-156e-11e3-a239-001a4a81450b', '950734d0-f59b-11e3-8775-001a4a81450b', 'd95fcb5f-209d-11e3-9a3e-001a4a81450b', 1),
          ('163e5d8c-156e-11e3-a239-001a4a81450b', '950734d0-f59b-11e3-8775-001a4a81450b', 'ee2c1193-209b-11e3-9a3e-001a4a81450b', 1),
          ('163e5d8c-156e-11e3-a239-001a4a81450b', '950734d0-f59b-11e3-8775-001a4a81450b', 'fc55810b-09d7-11e3-a239-001a4a81450b', 1);
        insert into tool_shed.tool_platform (tool_uuid, tool_version_uuid, platform_uuid, compatible_flag) values
          ('56872C2E-1D78-4DB0-B976-83ACF5424C52', '5230FE76-E658-4B3A-AD40-7D55F7A21955', '1088c3ce-20aa-11e3-9a3e-001a4a81450b', 1),
          ('56872C2E-1D78-4DB0-B976-83ACF5424C52', '5230FE76-E658-4B3A-AD40-7D55F7A21955', '8a51ecea-209d-11e3-9a3e-001a4a81450b', 1),
          ('56872C2E-1D78-4DB0-B976-83ACF5424C52', '5230FE76-E658-4B3A-AD40-7D55F7A21955', 'a4f024eb-f317-11e3-8775-001a4a81450b', 1),
          ('56872C2E-1D78-4DB0-B976-83ACF5424C52', '5230FE76-E658-4B3A-AD40-7D55F7A21955', 'd531f0f0-f273-11e3-8775-001a4a81450b', 1),
          ('56872C2E-1D78-4DB0-B976-83ACF5424C52', '5230FE76-E658-4B3A-AD40-7D55F7A21955', 'd95fcb5f-209d-11e3-9a3e-001a4a81450b', 1),
          ('56872C2E-1D78-4DB0-B976-83ACF5424C52', '5230FE76-E658-4B3A-AD40-7D55F7A21955', 'ee2c1193-209b-11e3-9a3e-001a4a81450b', 1),
          ('56872C2E-1D78-4DB0-B976-83ACF5424C52', '5230FE76-E658-4B3A-AD40-7D55F7A21955', 'fc55810b-09d7-11e3-a239-001a4a81450b', 1);
        insert into tool_shed.tool_platform (tool_uuid, tool_version_uuid, platform_uuid, compatible_flag) values
          ('163d56a7-156e-11e3-a239-001a4a81450b', '163fe1e7-156e-11e3-a239-001a4a81450b', '1088c3ce-20aa-11e3-9a3e-001a4a81450b', 1),
          ('163d56a7-156e-11e3-a239-001a4a81450b', '163fe1e7-156e-11e3-a239-001a4a81450b', '8a51ecea-209d-11e3-9a3e-001a4a81450b', 1),
          ('163d56a7-156e-11e3-a239-001a4a81450b', '163fe1e7-156e-11e3-a239-001a4a81450b', 'a4f024eb-f317-11e3-8775-001a4a81450b', 1),
          ('163d56a7-156e-11e3-a239-001a4a81450b', '163fe1e7-156e-11e3-a239-001a4a81450b', 'd531f0f0-f273-11e3-8775-001a4a81450b', 1),
          ('163d56a7-156e-11e3-a239-001a4a81450b', '163fe1e7-156e-11e3-a239-001a4a81450b', 'd95fcb5f-209d-11e3-9a3e-001a4a81450b', 1),
          ('163d56a7-156e-11e3-a239-001a4a81450b', '163fe1e7-156e-11e3-a239-001a4a81450b', 'ee2c1193-209b-11e3-9a3e-001a4a81450b', 1),
          ('163d56a7-156e-11e3-a239-001a4a81450b', '163fe1e7-156e-11e3-a239-001a4a81450b', 'fc55810b-09d7-11e3-a239-001a4a81450b', 1);
        insert into tool_shed.tool_platform (tool_uuid, tool_version_uuid, platform_uuid, compatible_flag) values
          ('163d56a7-156e-11e3-a239-001a4a81450b', '4c1ec754-cb53-11e3-8775-001a4a81450b', '1088c3ce-20aa-11e3-9a3e-001a4a81450b', 1),
          ('163d56a7-156e-11e3-a239-001a4a81450b', '4c1ec754-cb53-11e3-8775-001a4a81450b', '8a51ecea-209d-11e3-9a3e-001a4a81450b', 1),
          ('163d56a7-156e-11e3-a239-001a4a81450b', '4c1ec754-cb53-11e3-8775-001a4a81450b', 'a4f024eb-f317-11e3-8775-001a4a81450b', 1),
          ('163d56a7-156e-11e3-a239-001a4a81450b', '4c1ec754-cb53-11e3-8775-001a4a81450b', 'd531f0f0-f273-11e3-8775-001a4a81450b', 1),
          ('163d56a7-156e-11e3-a239-001a4a81450b', '4c1ec754-cb53-11e3-8775-001a4a81450b', 'd95fcb5f-209d-11e3-9a3e-001a4a81450b', 1),
          ('163d56a7-156e-11e3-a239-001a4a81450b', '4c1ec754-cb53-11e3-8775-001a4a81450b', 'ee2c1193-209b-11e3-9a3e-001a4a81450b', 1),
          ('163d56a7-156e-11e3-a239-001a4a81450b', '4c1ec754-cb53-11e3-8775-001a4a81450b', 'fc55810b-09d7-11e3-a239-001a4a81450b', 1);
        insert into tool_shed.tool_platform (tool_uuid, tool_version_uuid, platform_uuid, compatible_flag) values
          ('7A08B82D-3A3B-45CA-8644-105088741AF6', '325CA868-0D19-4B00-B034-3786887541AA', '1088c3ce-20aa-11e3-9a3e-001a4a81450b', 1),
          ('7A08B82D-3A3B-45CA-8644-105088741AF6', '325CA868-0D19-4B00-B034-3786887541AA', '8a51ecea-209d-11e3-9a3e-001a4a81450b', 1),
          ('7A08B82D-3A3B-45CA-8644-105088741AF6', '325CA868-0D19-4B00-B034-3786887541AA', 'a4f024eb-f317-11e3-8775-001a4a81450b', 1),
          ('7A08B82D-3A3B-45CA-8644-105088741AF6', '325CA868-0D19-4B00-B034-3786887541AA', 'd531f0f0-f273-11e3-8775-001a4a81450b', 1),
          ('7A08B82D-3A3B-45CA-8644-105088741AF6', '325CA868-0D19-4B00-B034-3786887541AA', 'd95fcb5f-209d-11e3-9a3e-001a4a81450b', 1),
          ('7A08B82D-3A3B-45CA-8644-105088741AF6', '325CA868-0D19-4B00-B034-3786887541AA', 'ee2c1193-209b-11e3-9a3e-001a4a81450b', 1),
          ('7A08B82D-3A3B-45CA-8644-105088741AF6', '325CA868-0D19-4B00-B034-3786887541AA', 'fc55810b-09d7-11e3-a239-001a4a81450b', 1);
        insert into tool_shed.tool_platform (tool_uuid, tool_version_uuid, platform_uuid, compatible_flag) values
          ('163f2b01-156e-11e3-a239-001a4a81450b', '16414980-156e-11e3-a239-001a4a81450b', '1088c3ce-20aa-11e3-9a3e-001a4a81450b', 1),
          ('163f2b01-156e-11e3-a239-001a4a81450b', '16414980-156e-11e3-a239-001a4a81450b', '8a51ecea-209d-11e3-9a3e-001a4a81450b', 1),
          ('163f2b01-156e-11e3-a239-001a4a81450b', '16414980-156e-11e3-a239-001a4a81450b', 'a4f024eb-f317-11e3-8775-001a4a81450b', 1),
          ('163f2b01-156e-11e3-a239-001a4a81450b', '16414980-156e-11e3-a239-001a4a81450b', 'd531f0f0-f273-11e3-8775-001a4a81450b', 1),
          ('163f2b01-156e-11e3-a239-001a4a81450b', '16414980-156e-11e3-a239-001a4a81450b', 'd95fcb5f-209d-11e3-9a3e-001a4a81450b', 1),
          ('163f2b01-156e-11e3-a239-001a4a81450b', '16414980-156e-11e3-a239-001a4a81450b', 'ee2c1193-209b-11e3-9a3e-001a4a81450b', 1),
          ('163f2b01-156e-11e3-a239-001a4a81450b', '16414980-156e-11e3-a239-001a4a81450b', 'fc55810b-09d7-11e3-a239-001a4a81450b', 1);
        insert into tool_shed.tool_platform (tool_uuid, tool_version_uuid, platform_uuid, compatible_flag) values
          ('163f2b01-156e-11e3-a239-001a4a81450b', 'a2d949ef-cb53-11e3-8775-001a4a81450b', '1088c3ce-20aa-11e3-9a3e-001a4a81450b', 1),
          ('163f2b01-156e-11e3-a239-001a4a81450b', 'a2d949ef-cb53-11e3-8775-001a4a81450b', '8a51ecea-209d-11e3-9a3e-001a4a81450b', 1),
          ('163f2b01-156e-11e3-a239-001a4a81450b', 'a2d949ef-cb53-11e3-8775-001a4a81450b', 'a4f024eb-f317-11e3-8775-001a4a81450b', 1),
          ('163f2b01-156e-11e3-a239-001a4a81450b', 'a2d949ef-cb53-11e3-8775-001a4a81450b', 'd531f0f0-f273-11e3-8775-001a4a81450b', 1),
          ('163f2b01-156e-11e3-a239-001a4a81450b', 'a2d949ef-cb53-11e3-8775-001a4a81450b', 'd95fcb5f-209d-11e3-9a3e-001a4a81450b', 1),
          ('163f2b01-156e-11e3-a239-001a4a81450b', 'a2d949ef-cb53-11e3-8775-001a4a81450b', 'ee2c1193-209b-11e3-9a3e-001a4a81450b', 1),
          ('163f2b01-156e-11e3-a239-001a4a81450b', 'a2d949ef-cb53-11e3-8775-001a4a81450b', 'fc55810b-09d7-11e3-a239-001a4a81450b', 1);
        insert into tool_shed.tool_platform (tool_uuid, tool_version_uuid, platform_uuid, compatible_flag) values
          ('0f668fb0-4421-11e4-a4f3-001a4a81450b', '142e9a79-4425-11e4-a4f3-001a4a81450b', '1088c3ce-20aa-11e3-9a3e-001a4a81450b', 1),
          ('0f668fb0-4421-11e4-a4f3-001a4a81450b', '142e9a79-4425-11e4-a4f3-001a4a81450b', '8a51ecea-209d-11e3-9a3e-001a4a81450b', 1),
          ('0f668fb0-4421-11e4-a4f3-001a4a81450b', '142e9a79-4425-11e4-a4f3-001a4a81450b', 'a4f024eb-f317-11e3-8775-001a4a81450b', 1),
          ('0f668fb0-4421-11e4-a4f3-001a4a81450b', '142e9a79-4425-11e4-a4f3-001a4a81450b', 'd531f0f0-f273-11e3-8775-001a4a81450b', 1),
          ('0f668fb0-4421-11e4-a4f3-001a4a81450b', '142e9a79-4425-11e4-a4f3-001a4a81450b', 'd95fcb5f-209d-11e3-9a3e-001a4a81450b', 1),
          ('0f668fb0-4421-11e4-a4f3-001a4a81450b', '142e9a79-4425-11e4-a4f3-001a4a81450b', 'ee2c1193-209b-11e3-9a3e-001a4a81450b', 1),
          ('0f668fb0-4421-11e4-a4f3-001a4a81450b', '142e9a79-4425-11e4-a4f3-001a4a81450b', 'fc55810b-09d7-11e3-a239-001a4a81450b', 1);


        # seperate 32 and 64 bit versions of RHEL and Scientific
        # Did this for other tables back in 26.sql, but missed the package_platform because at the time we werent using it.
        update package_store.package_platform set platform_uuid = 'd531f0f0-f273-11e3-8775-001a4a81450b' where platform_version_uuid = '051f9447-209e-11e3-9a3e-001a4a81450b';
        update package_store.package_platform set platform_uuid = 'a4f024eb-f317-11e3-8775-001a4a81450b' where platform_version_uuid = '35bc77b9-7d3e-11e3-88bb-001a4a81450b';

        # Add Parasoft as two tools
        insert into tool_shed.tool (tool_uuid, tool_owner_uuid, name, tool_sharing_status, is_build_needed) values ('4bb2644d-6440-11e4-a282-001a4a81450b','80835e30-d527-11e2-8b8b-0800200c9a66','Parasoft C/C++test','PUBLIC',0);
        insert into tool_shed.tool (tool_uuid, tool_owner_uuid, name, tool_sharing_status, is_build_needed) values ('6197a593-6440-11e4-a282-001a4a81450b','80835e30-d527-11e2-8b8b-0800200c9a66','Parasoft Jtest','PUBLIC',0);
        insert into tool_shed.tool_version
          (tool_version_uuid, tool_uuid, version_string, release_date, comment_public, comment_private,
          tool_path, tool_executable, tool_arguments, tool_directory, checksum)
        values
        ('0b384dc1-6441-11e4-a282-001a4a81450b','4bb2644d-6440-11e4-a282-001a4a81450b','9.5.4.103', now(), 'Parasoft C/C++test v9.5.4.103', NULL,
        '/swamp/store/SCATools/parasoft/ps-ctest-9.5.4.103.tar', 'cpptestcli', '', 'parasoft/cpptest/9.5',
        '201f182fa4c203a036f3572917eec5ff03517cb7bb9b6dae7c4936c12c2a2eb50481dfe957df96a0d1a725cb15a957ddd6f0cefb4b5b130e534c6aeb72e9bb3e'),
        ('18532f08-6441-11e4-a282-001a4a81450b','6197a593-6440-11e4-a282-001a4a81450b','9.5.13', now(), 'Parasoft Jtest v9.5.13', NULL,
        '/swamp/store/SCATools/parasoft/ps-jtest-9.5.13-3.tar', 'bin/jtest', '', 'parasoft',
        'ba799a298e3573c747c1afcc2808453d7612cfff885f8ae1ce659f1742bbb6917450b559d449ef901d0e93dde1b03d18bbf552138b63114f311a9bf53aff027c');
        insert into tool_shed.tool_language (tool_uuid, tool_version_uuid, package_type_id) values ('4bb2644d-6440-11e4-a282-001a4a81450b', '0b384dc1-6441-11e4-a282-001a4a81450b',1);
        insert into tool_shed.tool_language (tool_uuid, tool_version_uuid, package_type_id) values ('6197a593-6440-11e4-a282-001a4a81450b', '18532f08-6441-11e4-a282-001a4a81450b',2);
        # Parasoft Jtest does not work with Bytecode
        #insert into tool_shed.tool_language (tool_uuid, tool_version_uuid, package_type_id) values ('6197a593-6440-11e4-a282-001a4a81450b', '18532f08-6441-11e4-a282-001a4a81450b',3);

        # Add policy code to package table
        ALTER TABLE tool_shed.tool ADD COLUMN policy_code VARCHAR(100) COMMENT 'if tool requires policy' AFTER is_build_needed;
        update tool_shed.tool set policy_code = 'parasoft-user-c-test-policy' where tool_uuid = '4bb2644d-6440-11e4-a282-001a4a81450b';
        update tool_shed.tool set policy_code = 'parasoft-user-j-test-policy' where tool_uuid = '6197a593-6440-11e4-a282-001a4a81450b';

        # update database version number
        insert into assessment.database_version (database_version_no, description) values (script_version_no, 'upgrade');

        commit;
      end;
    end if;
END
$$
DELIMITER ;
