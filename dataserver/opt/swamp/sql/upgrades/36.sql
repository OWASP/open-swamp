# v1.14
use assessment;
drop PROCEDURE if exists upgrade_36;
DELIMITER $$
CREATE PROCEDURE upgrade_36 ()
  BEGIN
    declare script_version_no int;
    declare cur_db_version_no int;
    set script_version_no = 36;

    select max(database_version_no)
      into cur_db_version_no
      from assessment.database_version;

    if cur_db_version_no < script_version_no then
      begin

        # Android Package Type
        insert into package_store.package_type (name) values ('Android Java Source Code');

        # New Platform for Android
        insert into platform_store.platform (platform_uuid, name, platform_sharing_status) values ('48f9a9b0-976f-11e4-829b-001a4a81450b', 'Android', 'PUBLIC');
        insert into platform_store.platform_version (platform_version_uuid, platform_uuid, version_string, release_date, platform_path) values ('8f4878ec-976f-11e4-829b-001a4a81450b', '48f9a9b0-976f-11e4-829b-001a4a81450b', 'Android on Ubuntu 12.04 64-bit', now(), 'android-ubuntu-12.04-64');
        # All existing tools are incompatible with Android Platform.
        # Tools that can assess Jave Source Code are compatible with Android Platform. Other existing tools are not compatible.
        insert into tool_shed.tool_platform (tool_uuid, tool_version_uuid, platform_uuid, compatible_flag) values
          ('992A48A5-62EC-4EE9-8429-45BB94275A41', '09449DE5-8E63-44EA-8396-23C64525D57C', '48f9a9b0-976f-11e4-829b-001a4a81450b', 1),
          ('f212557c-3050-11e3-9a3e-001a4a81450b', '8ec206ff-f59b-11e3-8775-001a4a81450b', '48f9a9b0-976f-11e4-829b-001a4a81450b', 0),
          ('163e5d8c-156e-11e3-a239-001a4a81450b', '950734d0-f59b-11e3-8775-001a4a81450b', '48f9a9b0-976f-11e4-829b-001a4a81450b', 0),
          ('56872C2E-1D78-4DB0-B976-83ACF5424C52', '5230FE76-E658-4B3A-AD40-7D55F7A21955', '48f9a9b0-976f-11e4-829b-001a4a81450b', 1),
          ('163d56a7-156e-11e3-a239-001a4a81450b', '163fe1e7-156e-11e3-a239-001a4a81450b', '48f9a9b0-976f-11e4-829b-001a4a81450b', 1),
          ('163d56a7-156e-11e3-a239-001a4a81450b', '4c1ec754-cb53-11e3-8775-001a4a81450b', '48f9a9b0-976f-11e4-829b-001a4a81450b', 1),
          ('7A08B82D-3A3B-45CA-8644-105088741AF6', '325CA868-0D19-4B00-B034-3786887541AA', '48f9a9b0-976f-11e4-829b-001a4a81450b', 0),
          ('163f2b01-156e-11e3-a239-001a4a81450b', '16414980-156e-11e3-a239-001a4a81450b', '48f9a9b0-976f-11e4-829b-001a4a81450b', 1),
          ('163f2b01-156e-11e3-a239-001a4a81450b', 'a2d949ef-cb53-11e3-8775-001a4a81450b', '48f9a9b0-976f-11e4-829b-001a4a81450b', 1),
          ('0f668fb0-4421-11e4-a4f3-001a4a81450b', '142e9a79-4425-11e4-a4f3-001a4a81450b', '48f9a9b0-976f-11e4-829b-001a4a81450b', 0);

        # Add New Tool Android Lint, Only compatible with Android Platform
        insert into tool_shed.tool (tool_uuid, tool_owner_uuid, name, tool_sharing_status, is_build_needed) values ('9289b560-8f8b-11e4-829b-001a4a81450b','80835e30-d527-11e2-8b8b-0800200c9a66','Android lint','PUBLIC',0);
        insert into tool_shed.tool_version
          (tool_version_uuid, tool_uuid, version_string, release_date, comment_public, comment_private,
          tool_path, tool_executable, tool_arguments, tool_directory, checksum)
        values
        ('32eb19f7-8f8c-11e4-829b-001a4a81450b','9289b560-8f8b-11e4-829b-001a4a81450b','0.0.1', now(), 'lint', NULL,
        '/swamp/store/SCATools/lint/android-lint-0.0.1.tar.gz', '', '', '',
        'dc4281026455566e0fba5000ed69aa251b6b8edae3296a37f06a513f1ac521a45165514696652bcae0ba6c0a2af56208c7655b4c43971b5f912b8c2caaa851c8');
        insert into tool_shed.tool_language (tool_uuid, tool_version_uuid, package_type_id) values ('9289b560-8f8b-11e4-829b-001a4a81450b', '32eb19f7-8f8c-11e4-829b-001a4a81450b',6);
        insert into tool_shed.tool_platform (tool_uuid, tool_version_uuid, platform_uuid, compatible_flag) values
          ('9289b560-8f8b-11e4-829b-001a4a81450b', '32eb19f7-8f8c-11e4-829b-001a4a81450b', '1088c3ce-20aa-11e3-9a3e-001a4a81450b', 0),
          ('9289b560-8f8b-11e4-829b-001a4a81450b', '32eb19f7-8f8c-11e4-829b-001a4a81450b', '8a51ecea-209d-11e3-9a3e-001a4a81450b', 0),
          ('9289b560-8f8b-11e4-829b-001a4a81450b', '32eb19f7-8f8c-11e4-829b-001a4a81450b', 'a4f024eb-f317-11e3-8775-001a4a81450b', 0),
          ('9289b560-8f8b-11e4-829b-001a4a81450b', '32eb19f7-8f8c-11e4-829b-001a4a81450b', 'd531f0f0-f273-11e3-8775-001a4a81450b', 0),
          ('9289b560-8f8b-11e4-829b-001a4a81450b', '32eb19f7-8f8c-11e4-829b-001a4a81450b', 'd95fcb5f-209d-11e3-9a3e-001a4a81450b', 0),
          ('9289b560-8f8b-11e4-829b-001a4a81450b', '32eb19f7-8f8c-11e4-829b-001a4a81450b', 'ee2c1193-209b-11e3-9a3e-001a4a81450b', 0),
          ('9289b560-8f8b-11e4-829b-001a4a81450b', '32eb19f7-8f8c-11e4-829b-001a4a81450b', 'fc55810b-09d7-11e3-a239-001a4a81450b', 0),
          ('9289b560-8f8b-11e4-829b-001a4a81450b', '32eb19f7-8f8c-11e4-829b-001a4a81450b', '48f9a9b0-976f-11e4-829b-001a4a81450b', 1);

        # Add New Tool Python Bandit. Only works on Python2, not Python3. Compatible with all platforms except Android.
        insert into tool_shed.tool (tool_uuid, tool_owner_uuid, name, tool_sharing_status, is_build_needed) values ('7fbfa454-8f9f-11e4-829b-001a4a81450b','80835e30-d527-11e2-8b8b-0800200c9a66','Bandit','PUBLIC',0);
        insert into tool_shed.tool_version
          (tool_version_uuid, tool_uuid, version_string, release_date, comment_public, comment_private,
          tool_path, tool_executable, tool_arguments, tool_directory, checksum)
        values
        ('9cbd0e60-8f9f-11e4-829b-001a4a81450b','7fbfa454-8f9f-11e4-829b-001a4a81450b','8ba3536', now(), 'Bandit for Python', NULL,
        '/swamp/store/SCATools/bandit/bandit-8ba3536.tar.gz', '', '', '',
        '38c156ba3dd0bbc9498b87e7454c5f683389326c060dc55eed45637cd20109aad60b8133e14797949a373b51650da099d51e1a493b876987b53ba6398a9ddf4e');
        insert into tool_shed.tool_language (tool_uuid, tool_version_uuid, package_type_id) values ('7fbfa454-8f9f-11e4-829b-001a4a81450b', '9cbd0e60-8f9f-11e4-829b-001a4a81450b',4);
        insert into tool_shed.tool_platform (tool_uuid, tool_version_uuid, platform_uuid, compatible_flag) values
          ('7fbfa454-8f9f-11e4-829b-001a4a81450b', '9cbd0e60-8f9f-11e4-829b-001a4a81450b', '1088c3ce-20aa-11e3-9a3e-001a4a81450b', 1),
          ('7fbfa454-8f9f-11e4-829b-001a4a81450b', '9cbd0e60-8f9f-11e4-829b-001a4a81450b', '8a51ecea-209d-11e3-9a3e-001a4a81450b', 1),
          ('7fbfa454-8f9f-11e4-829b-001a4a81450b', '9cbd0e60-8f9f-11e4-829b-001a4a81450b', 'a4f024eb-f317-11e3-8775-001a4a81450b', 1),
          ('7fbfa454-8f9f-11e4-829b-001a4a81450b', '9cbd0e60-8f9f-11e4-829b-001a4a81450b', 'd531f0f0-f273-11e3-8775-001a4a81450b', 1),
          ('7fbfa454-8f9f-11e4-829b-001a4a81450b', '9cbd0e60-8f9f-11e4-829b-001a4a81450b', 'd95fcb5f-209d-11e3-9a3e-001a4a81450b', 1),
          ('7fbfa454-8f9f-11e4-829b-001a4a81450b', '9cbd0e60-8f9f-11e4-829b-001a4a81450b', 'ee2c1193-209b-11e3-9a3e-001a4a81450b', 1),
          ('7fbfa454-8f9f-11e4-829b-001a4a81450b', '9cbd0e60-8f9f-11e4-829b-001a4a81450b', 'fc55810b-09d7-11e3-a239-001a4a81450b', 1),
          ('7fbfa454-8f9f-11e4-829b-001a4a81450b', '9cbd0e60-8f9f-11e4-829b-001a4a81450b', '48f9a9b0-976f-11e4-829b-001a4a81450b', 0);

        # Tools that can assess Jave Source Code (package_type_id=2) can also assess Android Jave Source Code (package_type_id=6)
        insert into tool_shed.tool_language (tool_uuid, tool_version_uuid, package_type_id) values ('163d56a7-156e-11e3-a239-001a4a81450b', '163fe1e7-156e-11e3-a239-001a4a81450b',6);
        insert into tool_shed.tool_language (tool_uuid, tool_version_uuid, package_type_id) values ('163d56a7-156e-11e3-a239-001a4a81450b', '4c1ec754-cb53-11e3-8775-001a4a81450b',6);
        insert into tool_shed.tool_language (tool_uuid, tool_version_uuid, package_type_id) values ('163f2b01-156e-11e3-a239-001a4a81450b', '16414980-156e-11e3-a239-001a4a81450b',6);
        insert into tool_shed.tool_language (tool_uuid, tool_version_uuid, package_type_id) values ('163f2b01-156e-11e3-a239-001a4a81450b', 'a2d949ef-cb53-11e3-8775-001a4a81450b',6);
        insert into tool_shed.tool_language (tool_uuid, tool_version_uuid, package_type_id) values ('992A48A5-62EC-4EE9-8429-45BB94275A41', '09449DE5-8E63-44EA-8396-23C64525D57C',6);
        insert into tool_shed.tool_language (tool_uuid, tool_version_uuid, package_type_id) values ('56872C2E-1D78-4DB0-B976-83ACF5424C52', '5230FE76-E658-4B3A-AD40-7D55F7A21955',6);
        insert into tool_shed.tool_language (tool_uuid, tool_version_uuid, package_type_id) values ('6197a593-6440-11e4-a282-001a4a81450b', '18532f08-6441-11e4-a282-001a4a81450b',6);

        # Updated version of error-prone
        update tool_shed.tool_version
           set tool_path = '/swamp/store/SCATools/error-prone/error-prone-1.1.1-3.tar.gz',
               checksum  = 'd7949d82fece9b2cb182dbe2645b92d58524a21fc94464da5cba9d3d9cf3d2a252e16a7c28c821aaec2482b91c71098eca89cb7589ec541f7983b213c831ae52'
         where tool_version_uuid = '5230FE76-E658-4B3A-AD40-7D55F7A21955';

        # Updated version of Parasoft Jtest
        update tool_shed.tool_version
           set tool_path = '/swamp/store/SCATools/parasoft/ps-jtest-9.5.13-5.tar',
               checksum  = 'a46368db25c31e1826e3b54fada41b8b1f3b92944efcb4256ac024e00d733092b035461685551cad0e739f039dfeacdb48d04dcb72d4b7f152fc9918594000e0'
         where tool_version_uuid = '18532f08-6441-11e4-a282-001a4a81450b';

        # update database version number
        insert into assessment.database_version (database_version_no, description) values (script_version_no, 'upgrade to v1.14');

        commit;
      end;
    end if;
END
$$
DELIMITER ;
