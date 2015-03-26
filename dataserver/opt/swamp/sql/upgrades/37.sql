# v1.15
use assessment;
drop PROCEDURE if exists upgrade_37;
DELIMITER $$
CREATE PROCEDURE upgrade_37 ()
  BEGIN
    declare script_version_no int;
    declare cur_db_version_no int;
    set script_version_no = 37;

    select max(database_version_no)
      into cur_db_version_no
      from assessment.database_version;

    if cur_db_version_no < script_version_no then
      begin

        # Fix packages with nothing in version field
        update package_store.package_version
           set version_string = case when version_string is null then CAST(version_no as CHAR(100))
                                        when version_string = ''    then CAST(version_no as CHAR(100))
                                        else version_string end
         where version_string is null or version_string = '';

        # Change table to make version field required
        ALTER TABLE package_store.package_version
          CHANGE version_string version_string VARCHAR(100) NOT NULL  DEFAULT '' COMMENT 'eg version 5.0 stable release for Windows 7 64-bit';

        # Add New Tool Python Flake - One tool version with two specialized tool versions for Python2 and Python3. Compatible with all platforms except Android.
        insert into tool_shed.tool (tool_uuid, tool_owner_uuid, name, tool_sharing_status, is_build_needed) values ('63695cd8-a73e-11e4-a335-001a4a81450b','80835e30-d527-11e2-8b8b-0800200c9a66','Flake8','PUBLIC',0);
        insert into tool_shed.tool_version (tool_version_uuid, tool_uuid, version_string, release_date, comment_public, comment_private, tool_path, tool_executable, tool_arguments, tool_directory, checksum)
          values ('fe360cd7-a7e3-11e4-a335-001a4a81450b','63695cd8-a73e-11e4-a335-001a4a81450b','2.3.0', now(), 'Flake8 v2.3.0 for Python 2 & 3', NULL, NULL, NULL, NULL, NULL, NULL);
        insert into tool_shed.specialized_tool_version
            (specialization_type, specialized_tool_version_uuid, tool_uuid, tool_version_uuid, package_type_id, tool_path, tool_executable, tool_arguments, tool_directory, checksum) values
            ('LANGUAGE', '134873d9-a7e4-11e4-a335-001a4a81450b', '63695cd8-a73e-11e4-a335-001a4a81450b', 'fe360cd7-a7e3-11e4-a335-001a4a81450b', 4,
             '/swamp/store/SCATools/flake/flake8-py2-2.3.0.tar.gz', 'flake8', '--verbose --exit-zero --format=pylint', 'flake8-2.3.0',
             '70cd4a48254a7bbd473a90919b6a8400b1a38cbcdc814e4407d94c51c47d83702f8b4f6e3d1dcc06d7dc23af4359f7eb472ad285f543934bf528057119476107'),
            ('LANGUAGE', '1e58fe0c-a7e4-11e4-a335-001a4a81450b', '63695cd8-a73e-11e4-a335-001a4a81450b', 'fe360cd7-a7e3-11e4-a335-001a4a81450b', 5,
             '/swamp/store/SCATools/flake/flake8-py3-2.3.0.tar.gz', 'flake8', '--verbose --exit-zero --format=pylint', 'flake8-2.3.0',
             '7445ab5cd44663b0066266cf4cb9c2b5c3fcbc302358e4b340392780ced6334acc1d575b718cff65c49f2f6b5664ba16ed086b1cce3d68f7b3de0049e6146562');
        insert into tool_shed.tool_language (tool_uuid, tool_version_uuid, package_type_id) values ('63695cd8-a73e-11e4-a335-001a4a81450b', 'fe360cd7-a7e3-11e4-a335-001a4a81450b',4);
        insert into tool_shed.tool_language (tool_uuid, tool_version_uuid, package_type_id) values ('63695cd8-a73e-11e4-a335-001a4a81450b', 'fe360cd7-a7e3-11e4-a335-001a4a81450b',5);
        insert into tool_shed.tool_platform (tool_uuid, tool_version_uuid, platform_uuid, compatible_flag) values
          ('63695cd8-a73e-11e4-a335-001a4a81450b', 'fe360cd7-a7e3-11e4-a335-001a4a81450b', '1088c3ce-20aa-11e3-9a3e-001a4a81450b', 1),
          ('63695cd8-a73e-11e4-a335-001a4a81450b', 'fe360cd7-a7e3-11e4-a335-001a4a81450b', '8a51ecea-209d-11e3-9a3e-001a4a81450b', 1),
          ('63695cd8-a73e-11e4-a335-001a4a81450b', 'fe360cd7-a7e3-11e4-a335-001a4a81450b', 'a4f024eb-f317-11e3-8775-001a4a81450b', 1),
          ('63695cd8-a73e-11e4-a335-001a4a81450b', 'fe360cd7-a7e3-11e4-a335-001a4a81450b', 'd531f0f0-f273-11e3-8775-001a4a81450b', 1),
          ('63695cd8-a73e-11e4-a335-001a4a81450b', 'fe360cd7-a7e3-11e4-a335-001a4a81450b', 'd95fcb5f-209d-11e3-9a3e-001a4a81450b', 1),
          ('63695cd8-a73e-11e4-a335-001a4a81450b', 'fe360cd7-a7e3-11e4-a335-001a4a81450b', 'ee2c1193-209b-11e3-9a3e-001a4a81450b', 1),
          ('63695cd8-a73e-11e4-a335-001a4a81450b', 'fe360cd7-a7e3-11e4-a335-001a4a81450b', 'fc55810b-09d7-11e3-a239-001a4a81450b', 1),
          ('63695cd8-a73e-11e4-a335-001a4a81450b', 'fe360cd7-a7e3-11e4-a335-001a4a81450b', '48f9a9b0-976f-11e4-829b-001a4a81450b', 0);

        # Add New Version of Checkstyle. Compatible languages: Java Source Code and Android Java Source Code. Compatible platforms: all.
        insert into tool_shed.tool_version
          (tool_version_uuid, tool_uuid, version_string, release_date, comment_public, comment_private,
          tool_path, tool_executable, tool_arguments, tool_directory, checksum)
        values
        ('0667d30a-a7f0-11e4-a335-001a4a81450b','992A48A5-62EC-4EE9-8429-45BB94275A41','6.2', now(), 'Checkstyle 6.2', NULL,
        '/swamp/store/SCATools/checkstyle/checkstyle-6.2-2.tar.gz', 'checkstyle-6.2-all.jar', '', 'checkstyle-6.2',
        'd8d1af94bb9ace19e2312333c83f3399c43a868f9c34be0d28509716f57887fc53e4f90e1862e6496357cb58617862944fa7745492ea926d9e43cdd4bb5c8287');
        insert into tool_shed.tool_language (tool_uuid, tool_version_uuid, package_type_id) values ('992A48A5-62EC-4EE9-8429-45BB94275A41', '0667d30a-a7f0-11e4-a335-001a4a81450b',2);
        insert into tool_shed.tool_language (tool_uuid, tool_version_uuid, package_type_id) values ('992A48A5-62EC-4EE9-8429-45BB94275A41', '0667d30a-a7f0-11e4-a335-001a4a81450b',6);
        insert into tool_shed.tool_platform (tool_uuid, tool_version_uuid, platform_uuid, compatible_flag) values
          ('992A48A5-62EC-4EE9-8429-45BB94275A41', '0667d30a-a7f0-11e4-a335-001a4a81450b', '1088c3ce-20aa-11e3-9a3e-001a4a81450b', 1),
          ('992A48A5-62EC-4EE9-8429-45BB94275A41', '0667d30a-a7f0-11e4-a335-001a4a81450b', '8a51ecea-209d-11e3-9a3e-001a4a81450b', 1),
          ('992A48A5-62EC-4EE9-8429-45BB94275A41', '0667d30a-a7f0-11e4-a335-001a4a81450b', 'a4f024eb-f317-11e3-8775-001a4a81450b', 1),
          ('992A48A5-62EC-4EE9-8429-45BB94275A41', '0667d30a-a7f0-11e4-a335-001a4a81450b', 'd531f0f0-f273-11e3-8775-001a4a81450b', 1),
          ('992A48A5-62EC-4EE9-8429-45BB94275A41', '0667d30a-a7f0-11e4-a335-001a4a81450b', 'd95fcb5f-209d-11e3-9a3e-001a4a81450b', 1),
          ('992A48A5-62EC-4EE9-8429-45BB94275A41', '0667d30a-a7f0-11e4-a335-001a4a81450b', 'ee2c1193-209b-11e3-9a3e-001a4a81450b', 1),
          ('992A48A5-62EC-4EE9-8429-45BB94275A41', '0667d30a-a7f0-11e4-a335-001a4a81450b', 'fc55810b-09d7-11e3-a239-001a4a81450b', 1),
          ('992A48A5-62EC-4EE9-8429-45BB94275A41', '0667d30a-a7f0-11e4-a335-001a4a81450b', '48f9a9b0-976f-11e4-829b-001a4a81450b', 1);

        # Add New Version of Findbugs. Compatible languages: Java Source Code, Java Bytecode and Android Java Source Code. Compatible platforms: all.
        insert into tool_shed.tool_version
          (tool_version_uuid, tool_uuid, version_string, release_date, comment_public, comment_private,
          tool_path, tool_executable, tool_arguments, tool_directory, checksum)
        values
        ('27ea7f63-a813-11e4-a335-001a4a81450b','163d56a7-156e-11e3-a239-001a4a81450b','3.0.0 (FindSecurityBugs 1.3)', now(), 'Findbugs 3.0.0 (with FindSecurityBugs-1.3.0 plugin)', NULL,
        '/swamp/store/SCATools/findbugs/findbugs-3.0.0-2.tar.gz', 'lib/findbugs.jar', '', 'findbugs-3.0.0',
        '4f97ca68cbb02973f909162c8386d4a28713cd45042bceea2047fc1459ed8c6f2e564a21ee40353501a4fc63256319f112bff2f185f8fe4822241c267e647f14');
        insert into tool_shed.tool_language (tool_uuid, tool_version_uuid, package_type_id) values ('163d56a7-156e-11e3-a239-001a4a81450b', '27ea7f63-a813-11e4-a335-001a4a81450b',2);
        insert into tool_shed.tool_language (tool_uuid, tool_version_uuid, package_type_id) values ('163d56a7-156e-11e3-a239-001a4a81450b', '27ea7f63-a813-11e4-a335-001a4a81450b',3);
        insert into tool_shed.tool_language (tool_uuid, tool_version_uuid, package_type_id) values ('163d56a7-156e-11e3-a239-001a4a81450b', '27ea7f63-a813-11e4-a335-001a4a81450b',6);
        insert into tool_shed.tool_platform (tool_uuid, tool_version_uuid, platform_uuid, compatible_flag) values
          ('163d56a7-156e-11e3-a239-001a4a81450b', '27ea7f63-a813-11e4-a335-001a4a81450b', '1088c3ce-20aa-11e3-9a3e-001a4a81450b', 1),
          ('163d56a7-156e-11e3-a239-001a4a81450b', '27ea7f63-a813-11e4-a335-001a4a81450b', '8a51ecea-209d-11e3-9a3e-001a4a81450b', 1),
          ('163d56a7-156e-11e3-a239-001a4a81450b', '27ea7f63-a813-11e4-a335-001a4a81450b', 'a4f024eb-f317-11e3-8775-001a4a81450b', 1),
          ('163d56a7-156e-11e3-a239-001a4a81450b', '27ea7f63-a813-11e4-a335-001a4a81450b', 'd531f0f0-f273-11e3-8775-001a4a81450b', 1),
          ('163d56a7-156e-11e3-a239-001a4a81450b', '27ea7f63-a813-11e4-a335-001a4a81450b', 'd95fcb5f-209d-11e3-9a3e-001a4a81450b', 1),
          ('163d56a7-156e-11e3-a239-001a4a81450b', '27ea7f63-a813-11e4-a335-001a4a81450b', 'ee2c1193-209b-11e3-9a3e-001a4a81450b', 1),
          ('163d56a7-156e-11e3-a239-001a4a81450b', '27ea7f63-a813-11e4-a335-001a4a81450b', 'fc55810b-09d7-11e3-a239-001a4a81450b', 1),
          ('163d56a7-156e-11e3-a239-001a4a81450b', '27ea7f63-a813-11e4-a335-001a4a81450b', '48f9a9b0-976f-11e4-829b-001a4a81450b', 1);

        # Add New Version of PMD. Compatible languages: Java Source Code and Android Java Source Code. Compatible platforms: all.
        insert into tool_shed.tool_version
          (tool_version_uuid, tool_uuid, version_string, release_date, comment_public, comment_private,
          tool_path, tool_executable, tool_arguments, tool_directory, checksum)
        values
        ('bdaf4b93-a811-11e4-a335-001a4a81450b','163f2b01-156e-11e3-a239-001a4a81450b','5.2.3', now(), 'PMD 5.2.3', NULL,
        '/swamp/store/SCATools/pmd/pmd-5.2.3-3.tar.gz', 'net.sourceforge.pmd.PMD', '', 'pmd-bin-5.2.3',
        '652a9d818922c00494591c9bbef43bb2cb321a371ae99c4713054bd534f8d55c695244fab26dc24d1271bc469429b3d1da59e81067c34271e10e981935ac4d32');
        insert into tool_shed.tool_language (tool_uuid, tool_version_uuid, package_type_id) values ('163f2b01-156e-11e3-a239-001a4a81450b', 'bdaf4b93-a811-11e4-a335-001a4a81450b',2);
        insert into tool_shed.tool_language (tool_uuid, tool_version_uuid, package_type_id) values ('163f2b01-156e-11e3-a239-001a4a81450b', 'bdaf4b93-a811-11e4-a335-001a4a81450b',6);
        insert into tool_shed.tool_platform (tool_uuid, tool_version_uuid, platform_uuid, compatible_flag) values
          ('163f2b01-156e-11e3-a239-001a4a81450b', 'bdaf4b93-a811-11e4-a335-001a4a81450b', '1088c3ce-20aa-11e3-9a3e-001a4a81450b', 1),
          ('163f2b01-156e-11e3-a239-001a4a81450b', 'bdaf4b93-a811-11e4-a335-001a4a81450b', '8a51ecea-209d-11e3-9a3e-001a4a81450b', 1),
          ('163f2b01-156e-11e3-a239-001a4a81450b', 'bdaf4b93-a811-11e4-a335-001a4a81450b', 'a4f024eb-f317-11e3-8775-001a4a81450b', 1),
          ('163f2b01-156e-11e3-a239-001a4a81450b', 'bdaf4b93-a811-11e4-a335-001a4a81450b', 'd531f0f0-f273-11e3-8775-001a4a81450b', 1),
          ('163f2b01-156e-11e3-a239-001a4a81450b', 'bdaf4b93-a811-11e4-a335-001a4a81450b', 'd95fcb5f-209d-11e3-9a3e-001a4a81450b', 1),
          ('163f2b01-156e-11e3-a239-001a4a81450b', 'bdaf4b93-a811-11e4-a335-001a4a81450b', 'ee2c1193-209b-11e3-9a3e-001a4a81450b', 1),
          ('163f2b01-156e-11e3-a239-001a4a81450b', 'bdaf4b93-a811-11e4-a335-001a4a81450b', 'fc55810b-09d7-11e3-a239-001a4a81450b', 1),
          ('163f2b01-156e-11e3-a239-001a4a81450b', 'bdaf4b93-a811-11e4-a335-001a4a81450b', '48f9a9b0-976f-11e4-829b-001a4a81450b', 1);

        drop table if exists assessment.scheduler_log;
        create table assessment.scheduler_log (
          scheduler_log_id  INT  NOT NULL AUTO_INCREMENT,
          msg VARCHAR(100),
          assessment_run_uuid VARCHAR(45),
          run_request_uuid VARCHAR(45),
          notify_when_complete_flag tinyint(1),
          user_uuid VARCHAR(45),
          return_msg VARCHAR(100),
          create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (scheduler_log_id)
          );

        # Resize description field on package
        ALTER TABLE package_store.package CHANGE description description VARCHAR(500) COMMENT 'description';
        # Add description to tool, platform
        ALTER TABLE tool_shed.tool          ADD COLUMN description VARCHAR(500) COMMENT 'description' AFTER name;
        ALTER TABLE platform_store.platform ADD COLUMN description VARCHAR(500) COMMENT 'description' AFTER name;
        ALTER TABLE viewer_store.viewer     ADD COLUMN description VARCHAR(500) COMMENT 'description' AFTER name;

        # Add delete date to execution record
        ALTER TABLE assessment.execution_record ADD COLUMN delete_date TIMESTAMP NULL DEFAULT NULL COMMENT 'date record deleted';

        # update database version number
        insert into assessment.database_version (database_version_no, description) values (script_version_no, 'upgrade to v1.15');

        commit;
      end;
    end if;
END
$$
DELIMITER ;
