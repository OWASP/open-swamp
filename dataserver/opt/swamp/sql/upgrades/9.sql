# 12/5/2013
# modify viewer db
use assessment;
drop PROCEDURE if exists upgrade_9;
DELIMITER $$
CREATE PROCEDURE upgrade_9 ()
  BEGIN
    declare script_version_no int;
    declare cur_db_version_no int;
    set script_version_no = 9;

    select max(database_version_no)
      into cur_db_version_no
      from assessment.database_version;

    if cur_db_version_no < script_version_no then
      begin
        # data model updates
        ALTER TABLE viewer_store.project_default_viewer
          ADD COLUMN viewer_version_uuid  VARCHAR(45) COMMENT 'version uuid' AFTER viewer_uuid;

        drop table if exists viewer_store.viewer_storage;

        CREATE TABLE viewer_store.viewer_instance (
          viewer_instance_uuid  VARCHAR(45)                                  COMMENT 'viewer uuid',
          viewer_version_uuid   VARCHAR(45)                                  COMMENT 'viewer uuid',
          project_uuid          VARCHAR(45) NOT NULL                         COMMENT 'project uuid',
          reference_count       INT                                          COMMENT 'number of active users',
          viewer_db_path        VARCHAR(200)                                 COMMENT 'cannonical path of viewer',
          viewer_db_checksum    VARCHAR(200)                                 COMMENT 'checksum of viewer',
          api_key               VARCHAR(50)                                  COMMENT 'api key of viewer',
          create_user           VARCHAR(25)                                  COMMENT 'db user that inserted record',
          create_date           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'date record inserted',
          update_user           VARCHAR(25)                                  COMMENT 'db user that last updated record',
          update_date           TIMESTAMP NULL DEFAULT NULL                  COMMENT 'date record last updated',
          PRIMARY KEY (viewer_instance_uuid),
            CONSTRAINT fk_viewer_instance FOREIGN KEY (viewer_version_uuid) REFERENCES viewer_version (viewer_version_uuid) ON DELETE CASCADE ON UPDATE CASCADE
         )COMMENT='storage and ref count for each viewer instance';

        # pkg admin
        DROP TRIGGER IF EXISTS package_store.package_admin_BINS;
        DROP TRIGGER IF EXISTS package_store.package_admin_BUPD;
        drop table if exists package_store.package_admin;

        # tool admin
        DROP TRIGGER IF EXISTS tool_shed.tool_admin_BINS;
        DROP TRIGGER IF EXISTS tool_shed.tool_admin_BUPD;
        drop table if exists tool_shed.tool_admin;

        # platform admin
        DROP TRIGGER IF EXISTS platform_store.platform_admin_BINS;
        DROP TRIGGER IF EXISTS platform_store.platform_admin_BUPD;
        drop table if exists platform_store.platform_admin;



        # update database version number
        insert into assessment.database_version (database_version_no, description) values (script_version_no, 'upgrade');

        commit;
      end;
    end if;
END
$$
DELIMITER ;
