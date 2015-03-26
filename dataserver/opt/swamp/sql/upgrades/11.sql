use assessment;
drop PROCEDURE if exists upgrade_11;
DELIMITER $$
CREATE PROCEDURE upgrade_11 ()
  BEGIN
    declare script_version_no int;
    declare cur_db_version_no int;
    set script_version_no = 11;

    select max(database_version_no)
      into cur_db_version_no
      from assessment.database_version;

    if cur_db_version_no < script_version_no then
      begin

        # Version Numbers
        ALTER TABLE package_store.package_version   ADD COLUMN version_no INT COMMENT 'incremental integer version number' AFTER package_uuid;
        ALTER TABLE tool_shed.tool_version          ADD COLUMN version_no INT COMMENT 'incremental integer version number' AFTER tool_uuid;
        ALTER TABLE platform_store.platform_version ADD COLUMN version_no INT COMMENT 'incremental integer version number' AFTER platform_uuid;
        ALTER TABLE viewer_store.viewer_version CHANGE COLUMN version_int version_no INT COMMENT 'incremental integer version number';

        # Package Version Sharing - Add column package_version.version_sharing_status
        ALTER TABLE package_store.package_version ADD COLUMN version_sharing_status VARCHAR(25) NOT NULL DEFAULT 'PRIVATE' AFTER platform_id;

        # Package Version Sharing - create table package_version_sharing
        CREATE TABLE package_store.package_version_sharing (
          package_version_sharing_id   INT  NOT NULL AUTO_INCREMENT  COMMENT 'internal id',
          package_version_uuid         VARCHAR(45) NOT NULL          COMMENT 'package version uuid',
          project_uuid                 VARCHAR(45)                   COMMENT 'project uuid',
          PRIMARY KEY (package_version_sharing_id),
             CONSTRAINT fk_package_version_sharing FOREIGN KEY (package_version_uuid) REFERENCES package_store.package_version (package_version_uuid) ON DELETE CASCADE ON UPDATE CASCADE,
             CONSTRAINT package_sharing_uc UNIQUE (package_version_uuid,project_uuid)
         )COMMENT='contains package versions shared with specific projects';

        # Change Passwords
        SET PASSWORD FOR 'web'@'%' = PASSWORD('password');
        SET PASSWORD FOR 'java_agent'@'%' = PASSWORD('password');
        SET PASSWORD FOR 'java_agent'@'localhost' = PASSWORD('password');
        SET PASSWORD FOR 'java_agent'@'swa-csaper-dt-01.mirsam.org' = PASSWORD('password');

        # Add platform Scientific Linux 5.9 32-bit
        insert into platform_store.platform_version (platform_version_uuid, platform_uuid, version_string, release_date, platform_path) values ('35bc77b9-7d3e-11e3-88bb-001a4a81450b', 'd95fcb5f-209d-11e3-9a3e-001a4a81450b', '5.9 32-bit', now(), 'scientific-5.9-32');
        UPDATE platform_store.platform_version SET version_no='1' WHERE platform_version_uuid='35bc77b9-7d3e-11e3-88bb-001a4a81450b';
        UPDATE platform_store.platform_version SET version_no='2' WHERE platform_version_uuid='27f0588b-209e-11e3-9a3e-001a4a81450b';
        UPDATE platform_store.platform_version SET version_no='3' WHERE platform_version_uuid='e16f4023-209d-11e3-9a3e-001a4a81450b';

        # Add honeypot pkg and tool
        insert into package_store.package (package_uuid, package_owner_uuid, name, package_sharing_status)
        values ('a3af7552-7e13-11e3-88bb-001a4a81450b','80835e30-d527-11e2-8b8b-0800200c9a66','CHT','PRIVATE');
        insert into package_store.package_version
        (package_version_uuid,                   package_uuid,                         version_string,     release_date, comment_public, comment_private,    package_path,                                                                                                    source_path,                              build_needed,  build_file,         build_system,             build_cmd,      build_target,    build_dir,    build_opt,                                         config_cmd,                                                                                  config_opt,                                                                                             config_dir,   custom_shell_cmd, checksum) values
        ('776f039b-7e3a-11e3-88bb-001a4a81450b','a3af7552-7e13-11e3-88bb-001a4a81450b','1.5.1',            now(),        NULL,           NULL,               '/swamp/store/SCAPackages/5def8397-7f8e-11e3-88bb-001a4a81450b/CHT-1.5.1.tar.gz',                                'CHT-1.5.1',                              1,             '',                 'configure+make',          NULL,          '',              '.',          NULL,                                              NULL,                                                                                        NULL,                                                                                                   '.',          NULL,             'a5873bb03514af2d65ec893810f9ec8e1f3236ca4ae0b650fad35fa1b2da0dfeac471dc211c00256a5a78f45e69fa0f27709d5b5eb089fda3934307a1bfb50e1');
        insert into tool_shed.tool (tool_uuid, tool_owner_uuid, name, tool_sharing_status, is_build_needed) values ('cdbeaccc-7f8f-11e3-88bb-001a4a81450b','80835e30-d527-11e2-8b8b-0800200c9a66','SCK','PRIVATE',0);
        insert into tool_shed.tool_version
        (tool_version_uuid,                      tool_uuid,                            version_string,                 release_date,  comment_public,                                         comment_private,   tool_path,                                                                      tool_executable,         tool_arguments,  tool_directory,    checksum) values
        ('ec886745-7f8f-11e3-88bb-001a4a81450b','cdbeaccc-7f8f-11e3-88bb-001a4a81450b','0.8.17',                        now(),        'SCK Ver.0.8.17 Beta Release',                           NULL,             '/swamp/store/SCATools/471176e7-7e16-11e3-88bb-001a4a81450b/sck-0.8.17.tar.bz2','sck',                   '',              'sck-0.8.17',      '75e0ae2af2705670d2fb257447890f1214ceb341fde90b5380d5a47267bdf905ef5dd4d188e16e51662fa06f740c4b901b6c6376817070ebe69228654f4c9d2b');

        # Package Version Sharing - transfer old sharing settings to new
        update package_store.package_version pv set pv.version_sharing_status =
          ifnull((select p.package_sharing_status from package_store.package p where p.package_uuid = pv.package_uuid),'PRIVATE');
        insert into package_store.package_version_sharing (package_version_uuid, project_uuid)
          select pv.package_version_uuid, ps.project_uuid
            from package_store.package_version pv
           inner join package_store.package_sharing ps on ps.package_uuid = pv.package_uuid;

        # Add Gcc to Tool Shed
        insert into tool_shed.tool (tool_uuid, tool_owner_uuid, name, tool_sharing_status, is_build_needed) values ('7A08B82D-3A3B-45CA-8644-105088741AF6','80835e30-d527-11e2-8b8b-0800200c9a66','GCC','PUBLIC',0);
        insert into tool_shed.tool_version
        (tool_version_uuid,                      tool_uuid,                            version_string,                 release_date,  comment_public,                                         comment_private,   tool_path,                                                                      tool_executable,         tool_arguments,  tool_directory,    checksum) values
        ('325CA868-0D19-4B00-B034-3786887541AA','7A08B82D-3A3B-45CA-8644-105088741AF6','current',                       now(),        'GCC',                                                   NULL,             '/swamp/store/SCATools/gcc/gcc.txt',                                            'gcc',                   '',              '.',               '212a4cc25a916d008aa2cf1c43ea9b99a96d59728dd280114229ad741c871c93f415d91ec7e637d132e97e03737e1ce6bdfe3f8190246a4bcefa56c327b348a2');


        # update database version number
        insert into assessment.database_version (database_version_no, description) values (script_version_no, 'upgrade');

        commit;
      end;
    end if;
END
$$
DELIMITER ;
