use assessment;
drop PROCEDURE if exists upgrade_20;
DELIMITER $$
CREATE PROCEDURE upgrade_20 ()
  BEGIN
    declare script_version_no int;
    declare cur_db_version_no int;
    set script_version_no = 20;

    select max(database_version_no)
      into cur_db_version_no
      from assessment.database_version;

    if cur_db_version_no < script_version_no then
      begin

        # add new versions of PMD & Findbugs
        insert into tool_shed.tool_version
        (tool_version_uuid,                      tool_uuid,                            version_string,                 release_date,  comment_public,                                         comment_private,   tool_path,                                                                      tool_executable,         tool_arguments,  tool_directory,    checksum) values
        ('4c1ec754-cb53-11e3-8775-001a4a81450b','163d56a7-156e-11e3-a239-001a4a81450b','2.0.3 (FindSecurityBugs 1.1.0)',now(),        'FindBugs+FindSecurityBugs',                             NULL,             '/swamp/store/SCATools/findbugs/findbugs-2.0.3.tar.gz',                         'bin/findbugs',          '',              'findbugs-2.0.3',  '9733111d49c906c4166abf8e3db4172909bb4babc0aac0cf3a0ceebf798b8c1c01d5d87fcd89795d90b73da83cf69c3fd6adebb54005c542e2b71cd81aa25ec1'),
        ('a2d949ef-cb53-11e3-8775-001a4a81450b','163f2b01-156e-11e3-a239-001a4a81450b','5.1.0',                         now(),        NULL,                                                    NULL,             '/swamp/store/SCATools/pmd/pmd-5.1.0.tar.gz',                                   'bin/run.sh',            '',              'pmd-bin-5.1.0',   'c5fec03457ce5c1144a18a649c4fe52e34ae4eb634483be983719950000126eb8dd9877c6349c1913318900fda2f64c0ff41712aed05ae428352c650fd67547f');

        # update tool_language table
        drop table tool_shed.tool_language;
        CREATE TABLE tool_shed.tool_language (
          tool_language_id   INT  NOT NULL AUTO_INCREMENT                 COMMENT 'internal id',
          tool_uuid          VARCHAR(45)                                  COMMENT 'tool uuid',
          tool_version_uuid  VARCHAR(45)                                  COMMENT 'version uuid',
          package_type_id    INT                                          COMMENT 'references package_store.package_type',
          create_user        VARCHAR(50)                                  COMMENT 'db user that inserted record',
          create_date        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'date record inserted',
          update_user        VARCHAR(50)                                  COMMENT 'db user that last updated record',
          update_date        TIMESTAMP NULL DEFAULT NULL                  COMMENT 'date record last updated',
          PRIMARY KEY (tool_language_id)
             #,CONSTRAINT fk_tool_language FOREIGN KEY (tool_uuid) REFERENCES tool (tool_uuid) ON DELETE CASCADE ON UPDATE CASCADE,
             #CONSTRAINT fk_tool_language_ver FOREIGN KEY (tool_version_uuid) REFERENCES tool_version (tool_version_uuid) ON DELETE CASCADE ON UPDATE CASCADE
         )COMMENT='Lists languages that each tool is capable of assessing';

        # update tool_platform table
        drop table tool_shed.tool_platform;
        CREATE TABLE tool_shed.tool_platform (
          tool_platform_id      INT  NOT NULL AUTO_INCREMENT                 COMMENT 'internal id',
          tool_uuid             VARCHAR(45)                                  COMMENT 'tool uuid',
          tool_version_uuid     VARCHAR(45)                                  COMMENT 'version uuid',
          platform_uuid         VARCHAR(45)                                  COMMENT 'platform uuid',
          platform_version_uuid VARCHAR(45)                                  COMMENT 'version uuid',
          compatible_flag       tinyint(1) NOT NULL DEFAULT 1                COMMENT 'Is combo compatible: 0=false 1=true',
          create_user           VARCHAR(50)                                  COMMENT 'db user that inserted record',
          create_date           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'date record inserted',
          update_user           VARCHAR(50)                                  COMMENT 'db user that last updated record',
          update_date           TIMESTAMP NULL DEFAULT NULL                  COMMENT 'date record last updated',
          PRIMARY KEY (tool_platform_id)
             #,CONSTRAINT fk_tool_platform FOREIGN KEY (tool_uuid) REFERENCES tool (tool_uuid) ON DELETE CASCADE ON UPDATE CASCADE
         )COMMENT='Lists known tool platform compatibilities';

        # populate tool_language table
          # Code Table from package_store.package_type
            # 1 = C/C++
            # 2 = Java Source Code
            # 3 = Java Bytecode
        insert into tool_shed.tool_language (tool_uuid, tool_version_uuid, package_type_id) values
        # Clang -> C/C++
        ('f212557c-3050-11e3-9a3e-001a4a81450b', '176af780-94fc-04a6-04ac-9c9363ab3d58', 1),
        ('f212557c-3050-11e3-9a3e-001a4a81450b', '22b04d64-1418-aad1-90d4-7f737ef2a5d7', 1),
        ('f212557c-3050-11e3-9a3e-001a4a81450b', '22ea5b8c-b908-11e3-8775-001a4a81450b', 1),
        ('f212557c-3050-11e3-9a3e-001a4a81450b', '2f4b8bd4-0427-b597-a541-3fbd849c01eb', 1),
        ('f212557c-3050-11e3-9a3e-001a4a81450b', '4fe637c9-7f44-5301-8466-b83fc47fa445', 1),
        ('f212557c-3050-11e3-9a3e-001a4a81450b', '646b7dc7-55b1-5c75-c32e-788b24161704', 1),
        ('f212557c-3050-11e3-9a3e-001a4a81450b', 'c8dd853a-ad8f-fb12-3198-6a7e63451104', 1),
        ('f212557c-3050-11e3-9a3e-001a4a81450b', 'e430663e-7126-64fe-c834-2d4f21288f5e', 1),
        ('f212557c-3050-11e3-9a3e-001a4a81450b', 'eacba579-c789-c023-957f-1b7977ff96c8', 1),
        # cppcheck -> C/C++
        ('163e5d8c-156e-11e3-a239-001a4a81450b', '0e4acecd-d303-827a-ea95-9dee2bf21aea', 1),
        ('163e5d8c-156e-11e3-a239-001a4a81450b', '1d9a7a04-edb3-955d-9eb8-42e7a65448dd', 1),
        ('163e5d8c-156e-11e3-a239-001a4a81450b', '2d7e943c-5ccf-d7be-d7ac-1d07ac9ddf7a', 1),
        ('163e5d8c-156e-11e3-a239-001a4a81450b', '3aba0096-eabb-4098-349b-315de5420c34', 1),
        ('163e5d8c-156e-11e3-a239-001a4a81450b', '589821f9-0f06-566c-4cf9-28b398349055', 1),
        ('163e5d8c-156e-11e3-a239-001a4a81450b', '765efd9a-b908-11e3-8775-001a4a81450b', 1),
        ('163e5d8c-156e-11e3-a239-001a4a81450b', 'a766ae91-b36b-b228-df66-58f070d626cf', 1),
        ('163e5d8c-156e-11e3-a239-001a4a81450b', 'a76e3fda-24e6-6a3d-6a3d-43fb1104677e', 1),
        ('163e5d8c-156e-11e3-a239-001a4a81450b', 'ca207cf5-c3f6-a5bc-1718-9ea95387e8f6', 1),
        # FindBugs -> Java Source Code & Java Bytecode
        ('163d56a7-156e-11e3-a239-001a4a81450b', '163fe1e7-156e-11e3-a239-001a4a81450b', 2),
        ('163d56a7-156e-11e3-a239-001a4a81450b', '4c1ec754-cb53-11e3-8775-001a4a81450b', 2),
        ('163d56a7-156e-11e3-a239-001a4a81450b', '163fe1e7-156e-11e3-a239-001a4a81450b', 3),
        ('163d56a7-156e-11e3-a239-001a4a81450b', '4c1ec754-cb53-11e3-8775-001a4a81450b', 3),
        # GCC -> C/C++
        ('7A08B82D-3A3B-45CA-8644-105088741AF6', '325CA868-0D19-4B00-B034-3786887541AA', 1),
        # PMD -> Java Source Code
        ('163f2b01-156e-11e3-a239-001a4a81450b', '16414980-156e-11e3-a239-001a4a81450b', 2),
        ('163f2b01-156e-11e3-a239-001a4a81450b', 'a2d949ef-cb53-11e3-8775-001a4a81450b', 2);
        # Archie -> (not implemented yet)
        # checkstyle -> (not implemented yet)
        # error-prone -> (not implemented yet)

        # set create user and date since this script runs before triggers
        update tool_shed.tool_language
           set create_user = user(),
               create_date = now();

        # update database version number
        insert into assessment.database_version (database_version_no, description) values (script_version_no, 'upgrade');

        commit;
      end;
    end if;
END
$$
DELIMITER ;
