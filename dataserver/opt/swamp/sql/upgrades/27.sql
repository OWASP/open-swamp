use assessment;
drop PROCEDURE if exists upgrade_27;
DELIMITER $$
CREATE PROCEDURE upgrade_27 ()
  BEGIN
    declare script_version_no int;
    declare cur_db_version_no int;
    set script_version_no = 27;

    select max(database_version_no)
      into cur_db_version_no
      from assessment.database_version;

    if cur_db_version_no < script_version_no then
      begin

        # Add support for platform specific tools
        #create table tool_shed.tool_version_bkup_2014_06_19 as select * from tool_shed.tool_version;
        ALTER TABLE tool_shed.tool_version DROP COLUMN platform_uuid;
        delete from tool_shed.tool_version where tool_uuid = '163e5d8c-156e-11e3-a239-001a4a81450b';
        delete from tool_shed.tool_version where tool_uuid = 'f212557c-3050-11e3-9a3e-001a4a81450b';
        delete from tool_shed.tool_language where tool_uuid = '163e5d8c-156e-11e3-a239-001a4a81450b';
        delete from tool_shed.tool_language where tool_uuid = 'f212557c-3050-11e3-9a3e-001a4a81450b';
        # new version of clang
        insert into tool_shed.tool_version
          (tool_version_uuid, tool_uuid, version_string, release_date, comment_public)
        values
          ('8ec206ff-f59b-11e3-8775-001a4a81450b', # tool_version_uuid
           'f212557c-3050-11e3-9a3e-001a4a81450b', # tool_uuid
           '3.3',                                  # version_string
           now(),                                  # release_date
           'Clang Static Analyzer 3.3')            # comment_public
           ;
        # new version of cppcheck
        insert into tool_shed.tool_version
          (tool_version_uuid, tool_uuid, version_string, release_date, comment_public)
        values
          ('950734d0-f59b-11e3-8775-001a4a81450b', # tool_version_uuid
           '163e5d8c-156e-11e3-a239-001a4a81450b', # tool_uuid
           '1.61',                                 # version_string
           now(),                                  # release_date
           'Cppcheck 1.61')                        # comment_public
           ;

        # populate tool_language
        insert into tool_shed.tool_language (tool_version_uuid, tool_uuid, package_type_id)
        values
          ('8ec206ff-f59b-11e3-8775-001a4a81450b', # tool_version_uuid
           'f212557c-3050-11e3-9a3e-001a4a81450b', # tool_uuid
           1)                                      # package_type_id
           ;
        insert into tool_shed.tool_language (tool_version_uuid, tool_uuid, package_type_id)
        values
          ('950734d0-f59b-11e3-8775-001a4a81450b', # tool_version_uuid
           '163e5d8c-156e-11e3-a239-001a4a81450b', # tool_uuid
           1)                                      # package_type_id
           ;


        drop table if exists tool_shed.platform_specific_tool_version;
        CREATE TABLE tool_shed.platform_specific_tool_version (
          #platform_specific_tool_version_id  INT         NOT NULL AUTO_INCREMENT COMMENT 'internal id',
          platform_specific_tool_version_uuid VARCHAR(45) NOT NULL                COMMENT 'internal id',
          tool_uuid                           VARCHAR(45) NOT NULL                COMMENT 'each version belongs to a tool; links to tool',
          tool_version_uuid                   VARCHAR(45) NOT NULL                COMMENT 'version uuid',
          platform_version_uuid               VARCHAR(45)                         COMMENT 'platform version uuid',
          tool_path                           VARCHAR(200)                        COMMENT 'cannonical path of tool in swamp storage',
          checksum                            VARCHAR(200)                        COMMENT 'checksum of tool',
          tool_executable                     VARCHAR(200)                        COMMENT 'command to invoke tool',
          tool_arguments                      VARCHAR(200)                        COMMENT 'arguments to pass to the tool',
          tool_directory                      VARCHAR(200)                        COMMENT 'top level directory within the archive',
          create_user                         VARCHAR(25)                         COMMENT 'user that inserted record',
          create_date                         TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'date record inserted',
          update_user                         VARCHAR(25)                         COMMENT 'user that last updated record',
          update_date                         TIMESTAMP NULL DEFAULT NULL         COMMENT 'date record last changed',
          PRIMARY KEY (platform_specific_tool_version_uuid),
            CONSTRAINT fk_platform_specific_tool FOREIGN KEY (tool_version_uuid) REFERENCES tool_version (tool_version_uuid) ON DELETE CASCADE ON UPDATE CASCADE
         )COMMENT='Tool can have many versions';

        # populate platform_specific_tool_version
          # clang
          # select tool_version_uuid 'old_tv_uuid', tool_uuid, 'new_tv_uuid', platform_uuid, tool_executable, tool_arguments, tool_directory, checksum, tool_path from tool_shed.tool_version
          # where tool_uuid = 'f212557c-3050-11e3-9a3e-001a4a81450b'; #clang
        insert into tool_shed.platform_specific_tool_version
            (platform_specific_tool_version_uuid, tool_uuid, tool_version_uuid, platform_version_uuid, tool_executable, tool_arguments, tool_directory, checksum, tool_path) values
            ('176af780-94fc-04a6-04ac-9c9363ab3d58', 'f212557c-3050-11e3-9a3e-001a4a81450b', '8ec206ff-f59b-11e3-8775-001a4a81450b', 'a9cfe21f-209d-11e3-9a3e-001a4a81450b', 'scan-build/scan-build', '',  'clang-3.3', '0653d258061149e9817470ee0ec8efa1a2f6c15fc8ed8583619faf75ba86c8988186d552ca7da715b644881e8806674db21881562b57ed79a2464f2220febe9f', '/swamp/store/SCATools/clang/tool-fedora-18.0-64-clang-sa-3.3.tar.gz'),
            ('22b04d64-1418-aad1-90d4-7f737ef2a5d7', 'f212557c-3050-11e3-9a3e-001a4a81450b', '8ec206ff-f59b-11e3-8775-001a4a81450b', 'e16f4023-209d-11e3-9a3e-001a4a81450b', 'scan-build/scan-build', '',  'clang-3.3', '18b50004b7d29bb2e3b91b302dd63b0a2d6e36efdf1df862323eea5e07927043c676fa22a4f9a7f6bc677b93b87bfc5f37e38b8add30c01d5f0311ee5d72ad10', '/swamp/store/SCATools/clang/tool-scientific-6.4-64-clang-sa-3.3.tar.gz'),
            ('22ea5b8c-b908-11e3-8775-001a4a81450b', 'f212557c-3050-11e3-9a3e-001a4a81450b', '8ec206ff-f59b-11e3-8775-001a4a81450b', '35bc77b9-7d3e-11e3-88bb-001a4a81450b', 'scan-build/scan-build', '',  'clang-3.3', '4dd967396eed7a5d398e98e5669618f8b84478d259a83920b577936714dc1ecfbf7880cc08dbe73438805bc3dbfacdd12adb2b9324d963de83d28f1e220578fb', '/swamp/store/SCATools/clang/tool-scientific-5.9-32-clang-sa-3.3.tar.gz'),
            ('2f4b8bd4-0427-b597-a541-3fbd849c01eb', 'f212557c-3050-11e3-9a3e-001a4a81450b', '8ec206ff-f59b-11e3-8775-001a4a81450b', '00f3ff35-209c-11e3-9a3e-001a4a81450b', 'scan-build/scan-build', '',  'clang-3.3', '43fc40525b7080485558ea55ac5e1296c11ea7aa7ae330367282ddd6b281569ff66793bd636dd8b2299c7906f62e3c35f0b85b172523d1564c099a479f8eb86e', '/swamp/store/SCATools/clang/tool-debian-7.0-64-clang-sa-3.3.tar.gz'),
            ('4fe637c9-7f44-5301-8466-b83fc47fa445', 'f212557c-3050-11e3-9a3e-001a4a81450b', '8ec206ff-f59b-11e3-8775-001a4a81450b', 'fc5737ef-09d7-11e3-a239-001a4a81450b', 'scan-build/scan-build', '-', 'clang-3.3', 'a5d152fe796e91ecb6008e08275113e197616a56313cea4b377be4b446965aeb1df17e7b57e2db7e8a5734b65d2ca796b0b7d5fcecae48b7b92a2b236b76e6e6', '/swamp/store/SCATools/clang/tool-rhel-6.4-64-clang-sa-3.3.tar.gz'),
            ('646b7dc7-55b1-5c75-c32e-788b24161704', 'f212557c-3050-11e3-9a3e-001a4a81450b', '8ec206ff-f59b-11e3-8775-001a4a81450b', '27f0588b-209e-11e3-9a3e-001a4a81450b', 'scan-build/scan-build', '',  'clang-3.3', '70c6e7ce10d9558a77b485885be4778dc1d29301d905318d9b43ab237bbb8d40044302f836ffd0466edc59bb16017bc73dc1004bea6a54a6e8195b498d15c30e', '/swamp/store/SCATools/clang/tool-scientific-5.9-64-clang-sa-3.3.tar.gz'),
            ('c8dd853a-ad8f-fb12-3198-6a7e63451104', 'f212557c-3050-11e3-9a3e-001a4a81450b', '8ec206ff-f59b-11e3-8775-001a4a81450b', '18f66e9a-20aa-11e3-9a3e-001a4a81450b', 'scan-build/scan-build', '',  'clang-3.3', '6a6e3f6f2b835f6c2e541b9f0b3b1a92ff152a09fbebf32d567cd531d7a657d12c2c7ef155a74e75eb5bc5ca1c788f9694a3b44f62f6498f209da6d54c0b35a4', '/swamp/store/SCATools/clang/tool-ubuntu-12.04-64-clang-sa-3.3.tar.gz'),
            ('e430663e-7126-64fe-c834-2d4f21288f5e', 'f212557c-3050-11e3-9a3e-001a4a81450b', '8ec206ff-f59b-11e3-8775-001a4a81450b', '051f9447-209e-11e3-9a3e-001a4a81450b', 'scan-build/scan-build', '',  'clang-3.3', 'd0f4eb1baefa38be92a2814dfb4f421800bb5343a9e87d5d584013cdbe588a1298b19d058fead48d5877528be4c8833c35f45c6b36ba1812dabddace155c314a', '/swamp/store/SCATools/clang/tool-rhel-6.4-32-clang-sa-3.3.tar.gz'),
            ('eacba579-c789-c023-957f-1b7977ff96c8', 'f212557c-3050-11e3-9a3e-001a4a81450b', '8ec206ff-f59b-11e3-8775-001a4a81450b', 'aebc38c3-209d-11e3-9a3e-001a4a81450b', 'scan-build/scan-build', '',  'clang-3.3', '5e13067724ceaf8c6c45adc572a9d9e9498139592e32009ea1474ae9034d301a43ab66b487568dc249f81b6a84c33a7d66f379ed277f12bd17d3374cbe9bd90a', '/swamp/store/SCATools/clang/tool-fedora-19.0-64-clang-sa-3.3.tar.gz');
          # cppcheck
          # select tool_version_uuid 'old_tv_uuid', tool_uuid, 'new_tv_uuid', platform_uuid, tool_executable, tool_arguments, tool_directory, checksum, tool_path from tool_shed.tool_version
          # where tool_uuid = '163e5d8c-156e-11e3-a239-001a4a81450b'; #cppcheck
        insert into tool_shed.platform_specific_tool_version
            (platform_specific_tool_version_uuid, tool_uuid, tool_version_uuid, platform_version_uuid, tool_executable, tool_arguments, tool_directory, checksum, tool_path) values
            ('0e4acecd-d303-827a-ea95-9dee2bf21aea', '163e5d8c-156e-11e3-a239-001a4a81450b', '950734d0-f59b-11e3-8775-001a4a81450b', '051f9447-209e-11e3-9a3e-001a4a81450b', 'cppcheck', '', 'cppcheck-1.61', '7eab1e0710a09795d74667d64c3b34f205ca47ce939d9f2b42fa11fa7da47068b06877452bf89cfa47891a1a755aa5c6db9a32c7c73d19cf0fd0041f930ba75b', '/swamp/store/SCATools/cppcheck/tool-rhel-6.4-32-cppcheck-1.61.tar.gz'),
            ('1d9a7a04-edb3-955d-9eb8-42e7a65448dd', '163e5d8c-156e-11e3-a239-001a4a81450b', '950734d0-f59b-11e3-8775-001a4a81450b', 'aebc38c3-209d-11e3-9a3e-001a4a81450b', 'cppcheck', '', 'cppcheck-1.61', '5a65b8cb4cbf08a904cf799e226ca91b1f8051158cfbd8d9bbc49e7e5e083b719ce14d40e457d45801248aebdaedfbf3d5fd98b35ac2662385e8e3a403e96ec4', '/swamp/store/SCATools/cppcheck/tool-fedora-19.0-64-cppcheck-1.61.tar.gz'),
            ('2d7e943c-5ccf-d7be-d7ac-1d07ac9ddf7a', '163e5d8c-156e-11e3-a239-001a4a81450b', '950734d0-f59b-11e3-8775-001a4a81450b', 'e16f4023-209d-11e3-9a3e-001a4a81450b', 'cppcheck', '', 'cppcheck-1.61', '6e7814e2f62900ecdc56155f189182be47773b05ee2c30f3936d1aab1646e2b99fc2b5ea23be82c1ebe678a666f29f45df31547843c6a03b4856f0ad3a4fd235', '/swamp/store/SCATools/cppcheck/tool-scientific-6.4-64-cppcheck-1.61.tar.gz'),
            ('3aba0096-eabb-4098-349b-315de5420c34', '163e5d8c-156e-11e3-a239-001a4a81450b', '950734d0-f59b-11e3-8775-001a4a81450b', '18f66e9a-20aa-11e3-9a3e-001a4a81450b', 'cppcheck', '', 'cppcheck-1.61', '82c06c64f72b95c7a5b179c05f7bd4b09477d04cfb66819f9e04458796d00189e9941958080e2cfbcb0f92538e87496858d9a6ae4d8e02ac7258c36a3417da98', '/swamp/store/SCATools/cppcheck/tool-ubuntu-12.04-64-cppcheck-1.61.tar.gz'),
            ('589821f9-0f06-566c-4cf9-28b398349055', '163e5d8c-156e-11e3-a239-001a4a81450b', '950734d0-f59b-11e3-8775-001a4a81450b', 'fc5737ef-09d7-11e3-a239-001a4a81450b', 'cppcheck', '', 'cppcheck-1.61', 'aa1762374d36690cd91f9a11a341eb6d083314a71c6acd4cf07375365edf5c7fd600ea32ab5920426ec4beb84be74bd29b8de3cf3c422f7510c3cc740bc4bda4', '/swamp/store/SCATools/cppcheck/tool-rhel-6.4-64-cppcheck-1.61.tar.gz'),
            ('765efd9a-b908-11e3-8775-001a4a81450b', '163e5d8c-156e-11e3-a239-001a4a81450b', '950734d0-f59b-11e3-8775-001a4a81450b', '35bc77b9-7d3e-11e3-88bb-001a4a81450b', 'cppcheck', '', 'cppcheck-1.61', '7abecc894bad18a5411ddd7f3de1e3916793802e48fcaf247d77f2de7892c70fc842145d5af867d7d9e11dfed9b29b21c8b34ed03cbae939d8b13bbdeb7b1f47', '/swamp/store/SCATools/cppcheck/tool-scientific-5.9-32-cppcheck-1.61.tar.gz'),
            ('a766ae91-b36b-b228-df66-58f070d626cf', '163e5d8c-156e-11e3-a239-001a4a81450b', '950734d0-f59b-11e3-8775-001a4a81450b', 'a9cfe21f-209d-11e3-9a3e-001a4a81450b', 'cppcheck', '', 'cppcheck-1.61', '033fb1a6e2cac8e488557b9a0702205967f97f21c5de2e9f9b5903c93890299f641282f5f7303a9eb4b2cbc4eac2c250fb9b56055daf90b4deae4c7a7e759d80', '/swamp/store/SCATools/cppcheck/tool-fedora-18.0-64-cppcheck-1.61.tar.gz'),
            ('a76e3fda-24e6-6a3d-6a3d-43fb1104677e', '163e5d8c-156e-11e3-a239-001a4a81450b', '950734d0-f59b-11e3-8775-001a4a81450b', '27f0588b-209e-11e3-9a3e-001a4a81450b', 'cppcheck', '', 'cppcheck-1.61', 'e6fcba48b1b2f5afff4cf7ff54c3c8377479264c2601bf0b9f38aebf64be322e5204ebdb27a91fe9d6063c6583e4c2bd2ce27442a883130542c1c745178891af', '/swamp/store/SCATools/cppcheck/tool-scientific-5.9-64-cppcheck-1.61.tar.gz'),
            ('ca207cf5-c3f6-a5bc-1718-9ea95387e8f6', '163e5d8c-156e-11e3-a239-001a4a81450b', '950734d0-f59b-11e3-8775-001a4a81450b', '00f3ff35-209c-11e3-9a3e-001a4a81450b', 'cppcheck', '', 'cppcheck-1.61', '7b1186f11111849d1f49662b7fe9f61d57968b32e81530ae7e27d085967b0e885c957dc532006e6ad64ddf6982ca19df94ed71eb956268fd0e335c2499890586', '/swamp/store/SCATools/cppcheck/tool-debian-7.0-64-cppcheck-1.61.tar.gz');

        # update existing assessments - clang
        # select tool_version_uuid from tool_shed.tool_version where tool_uuid = 'f212557c-3050-11e3-9a3e-001a4a81450b';
        update assessment.assessment_run
           set tool_version_uuid = '8ec206ff-f59b-11e3-8775-001a4a81450b'
         where tool_version_uuid in ('176af780-94fc-04a6-04ac-9c9363ab3d58',
                                     '22b04d64-1418-aad1-90d4-7f737ef2a5d7',
                                     '22ea5b8c-b908-11e3-8775-001a4a81450b',
                                     '2f4b8bd4-0427-b597-a541-3fbd849c01eb',
                                     '4fe637c9-7f44-5301-8466-b83fc47fa445',
                                     '646b7dc7-55b1-5c75-c32e-788b24161704',
                                     'c8dd853a-ad8f-fb12-3198-6a7e63451104',
                                     'e430663e-7126-64fe-c834-2d4f21288f5e',
                                     'eacba579-c789-c023-957f-1b7977ff96c8');
        update assessment.execution_record
           set tool_version_uuid = '8ec206ff-f59b-11e3-8775-001a4a81450b'
         where tool_version_uuid in ('176af780-94fc-04a6-04ac-9c9363ab3d58',
                                     '22b04d64-1418-aad1-90d4-7f737ef2a5d7',
                                     '22ea5b8c-b908-11e3-8775-001a4a81450b',
                                     '2f4b8bd4-0427-b597-a541-3fbd849c01eb',
                                     '4fe637c9-7f44-5301-8466-b83fc47fa445',
                                     '646b7dc7-55b1-5c75-c32e-788b24161704',
                                     'c8dd853a-ad8f-fb12-3198-6a7e63451104',
                                     'e430663e-7126-64fe-c834-2d4f21288f5e',
                                     'eacba579-c789-c023-957f-1b7977ff96c8');
        update assessment.assessment_result
           set tool_version_uuid = '8ec206ff-f59b-11e3-8775-001a4a81450b'
         where tool_version_uuid in ('176af780-94fc-04a6-04ac-9c9363ab3d58',
                                     '22b04d64-1418-aad1-90d4-7f737ef2a5d7',
                                     '22ea5b8c-b908-11e3-8775-001a4a81450b',
                                     '2f4b8bd4-0427-b597-a541-3fbd849c01eb',
                                     '4fe637c9-7f44-5301-8466-b83fc47fa445',
                                     '646b7dc7-55b1-5c75-c32e-788b24161704',
                                     'c8dd853a-ad8f-fb12-3198-6a7e63451104',
                                     'e430663e-7126-64fe-c834-2d4f21288f5e',
                                     'eacba579-c789-c023-957f-1b7977ff96c8');
        # update existing assessments - cppcheck
        # select tool_version_uuid from tool_shed.tool_version where tool_uuid = '163e5d8c-156e-11e3-a239-001a4a81450b';
        update assessment.assessment_run
           set tool_version_uuid = '950734d0-f59b-11e3-8775-001a4a81450b'
         where tool_version_uuid in ('3aba0096-eabb-4098-349b-315de5420c34',
                                     '765efd9a-b908-11e3-8775-001a4a81450b',
                                     'a76e3fda-24e6-6a3d-6a3d-43fb1104677e',
                                     '2d7e943c-5ccf-d7be-d7ac-1d07ac9ddf7a',
                                     'a766ae91-b36b-b228-df66-58f070d626cf',
                                     '1d9a7a04-edb3-955d-9eb8-42e7a65448dd',
                                     'ca207cf5-c3f6-a5bc-1718-9ea95387e8f6',
                                     '0e4acecd-d303-827a-ea95-9dee2bf21aea',
                                     '589821f9-0f06-566c-4cf9-28b398349055');
        update assessment.execution_record
           set tool_version_uuid = '950734d0-f59b-11e3-8775-001a4a81450b'
         where tool_version_uuid in ('3aba0096-eabb-4098-349b-315de5420c34',
                                     '765efd9a-b908-11e3-8775-001a4a81450b',
                                     'a76e3fda-24e6-6a3d-6a3d-43fb1104677e',
                                     '2d7e943c-5ccf-d7be-d7ac-1d07ac9ddf7a',
                                     'a766ae91-b36b-b228-df66-58f070d626cf',
                                     '1d9a7a04-edb3-955d-9eb8-42e7a65448dd',
                                     'ca207cf5-c3f6-a5bc-1718-9ea95387e8f6',
                                     '0e4acecd-d303-827a-ea95-9dee2bf21aea',
                                     '589821f9-0f06-566c-4cf9-28b398349055');
        update assessment.assessment_result
           set tool_version_uuid = '950734d0-f59b-11e3-8775-001a4a81450b'
         where tool_version_uuid in ('3aba0096-eabb-4098-349b-315de5420c34',
                                     '765efd9a-b908-11e3-8775-001a4a81450b',
                                     'a76e3fda-24e6-6a3d-6a3d-43fb1104677e',
                                     '2d7e943c-5ccf-d7be-d7ac-1d07ac9ddf7a',
                                     'a766ae91-b36b-b228-df66-58f070d626cf',
                                     '1d9a7a04-edb3-955d-9eb8-42e7a65448dd',
                                     'ca207cf5-c3f6-a5bc-1718-9ea95387e8f6',
                                     '0e4acecd-d303-827a-ea95-9dee2bf21aea',
                                     '589821f9-0f06-566c-4cf9-28b398349055');

        # update database version number
        insert into assessment.database_version (database_version_no, description) values (script_version_no, 'upgrade');

        commit;
      end;
    end if;
END
$$
DELIMITER ;
