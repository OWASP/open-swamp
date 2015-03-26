# 12/5/2013
# update cpp check
# add viewer db
use assessment;
drop PROCEDURE if exists upgrade_8;
DELIMITER $$
CREATE PROCEDURE upgrade_8 ()
  BEGIN
    declare script_version_no int;
    declare cur_db_version_no int;
    set script_version_no = 8;

    select max(database_version_no)
      into cur_db_version_no
      from assessment.database_version;

    if cur_db_version_no < script_version_no then
      begin
        # data model updates
        drop database if exists viewer_store;
        create database viewer_store;

        ##############################################
        CREATE TABLE viewer_store.viewer (
          viewer_uuid             VARCHAR(45) NOT NULL                         COMMENT 'viewer uuid',
          viewer_owner_uuid       VARCHAR(45)                                  COMMENT 'viewer owner uuid',
          name                    VARCHAR(100)  NOT NULL                       COMMENT 'viewer name',
          viewer_sharing_status   VARCHAR(25) NOT NULL DEFAULT 'PRIVATE'       COMMENT 'private, shared, public or retired',
          create_user             VARCHAR(25)                                  COMMENT 'db user that inserted record',
          create_date             TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'date record inserted',
          update_user             VARCHAR(25)                                  COMMENT 'db user that last updated record',
          update_date             TIMESTAMP NULL DEFAULT NULL                  COMMENT 'date record last updated',
          PRIMARY KEY (viewer_uuid)
         )COMMENT='contains all viewers';

        CREATE TABLE viewer_store.viewer_version (
          viewer_version_uuid    VARCHAR(45) NOT NULL                COMMENT 'version uuid',
          viewer_uuid            VARCHAR(45) NOT NULL                COMMENT 'each version belongs to a viewer; links to viewer',
          version_int            INT                                 COMMENT 'auto incremented version number',
          version_string         VARCHAR(100)                        COMMENT 'eg version 5.0 stable release for Windows 7 64-bit',
          invocation_cmd         VARCHAR(200)                        COMMENT 'command to invoke viewer',
          sign_in_cmd            VARCHAR(200)                        COMMENT 'command to sign in user to viewer',
          add_user_cmd           VARCHAR(200)                        COMMENT 'command to add user to viewer',
          add_result_cmd         VARCHAR(200)                        COMMENT 'command to add results to viewer',
          viewer_path            VARCHAR(200)                        COMMENT 'cannonical path of viewer',
          viewer_checksum        VARCHAR(200)                        COMMENT 'checksum of viewer',
          viewer_db_path         VARCHAR(200)                        COMMENT 'cannonical path of viewer',
          viewer_db_checksum     VARCHAR(200)                        COMMENT 'checksum of viewer',
          create_user            VARCHAR(25)                         COMMENT 'user that inserted record',
          create_date            TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'date record inserted',
          update_user            VARCHAR(25)                         COMMENT 'user that last updated record',
          update_date            TIMESTAMP NULL DEFAULT NULL         COMMENT 'date record last changed',
          PRIMARY KEY (viewer_version_uuid),
            CONSTRAINT fk_version_viewer FOREIGN KEY (viewer_uuid) REFERENCES viewer (viewer_uuid) ON DELETE CASCADE ON UPDATE CASCADE
         )COMMENT='viewer can have many versions';

        CREATE TABLE viewer_store.viewer_owner_history (
          viewer_owner_history_id  INT  NOT NULL AUTO_INCREMENT                 COMMENT 'internal id',
          viewer_uuid              VARCHAR(45) NOT NULL                         COMMENT 'viewer uuid',
          old_viewer_owner_uuid    VARCHAR(45)                                  COMMENT 'viewer owner uuid',
          new_viewer_owner_uuid    VARCHAR(45)                                  COMMENT 'viewer owner uuid',
          change_date              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'date record changed',
          PRIMARY KEY (viewer_owner_history_id)
         )COMMENT='viewer owner history';

        CREATE TABLE viewer_store.project_default_viewer (
          project_uuid   VARCHAR(45) NOT NULL                         COMMENT 'project uuid',
          viewer_uuid    VARCHAR(45)                                  COMMENT 'viewer uuid',
          create_user    VARCHAR(25)                                  COMMENT 'db user that inserted record',
          create_date    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'date record inserted',
          update_user    VARCHAR(25)                                  COMMENT 'db user that last updated record',
          update_date    TIMESTAMP NULL DEFAULT NULL                  COMMENT 'date record last updated',
          PRIMARY KEY (project_uuid)
         )COMMENT='each project can have one default viewer';

        CREATE TABLE viewer_store.viewer_storage (
          viewer_storage_id   INT  NOT NULL AUTO_INCREMENT                 COMMENT 'internal id',
          viewer_uuid         VARCHAR(45)                                  COMMENT 'viewer uuid',
          project_uuid        VARCHAR(45) NOT NULL                         COMMENT 'project uuid',
          reference_count     INT                                          COMMENT 'number of active users',
          viewer_db_path      VARCHAR(200)                                 COMMENT 'cannonical path of viewer',
          viewer_db_checksum  VARCHAR(200)                                 COMMENT 'checksum of viewer',
          create_user         VARCHAR(25)                                  COMMENT 'db user that inserted record',
          create_date         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'date record inserted',
          update_user         VARCHAR(25)                                  COMMENT 'db user that last updated record',
          update_date         TIMESTAMP NULL DEFAULT NULL                  COMMENT 'date record last updated',
          PRIMARY KEY (viewer_storage_id)
         )COMMENT='storage and ref count for each viewer instance';

        CREATE TABLE viewer_store.viewer_sharing (
          viewer_sharing_id  INT  NOT NULL AUTO_INCREMENT                 COMMENT 'internal id',
          viewer_uuid        VARCHAR(45) NOT NULL                         COMMENT 'viewer uuid',
          project_uuid       VARCHAR(45)                                  COMMENT 'project uuid',
          create_user        VARCHAR(25)                                  COMMENT 'db user that inserted record',
          create_date        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'date record inserted',
          update_user        VARCHAR(25)                                  COMMENT 'db user that last updated record',
          update_date        TIMESTAMP NULL DEFAULT NULL                  COMMENT 'date record last updated',
          PRIMARY KEY (viewer_sharing_id),
             CONSTRAINT fk_viewer_sharing FOREIGN KEY (viewer_uuid) REFERENCES viewer (viewer_uuid) ON DELETE CASCADE ON UPDATE CASCADE,
             CONSTRAINT viewer_sharing_uc UNIQUE (viewer_uuid,project_uuid)
         )COMMENT='contains viewers shared with specific projects';


          # Populate Viewer Store
          # Native Viewer
          insert into viewer_store.viewer (viewer_uuid, viewer_owner_uuid, name, viewer_sharing_status)
            values ('b7289170-5c46-11e3-9fa4-001a4a81450b', '80835e30-d527-11e2-8b8b-0800200c9a66', 'Native', 'PUBLIC');
          insert into viewer_store.viewer_version (viewer_version_uuid, viewer_uuid,
                              version_string,
                              invocation_cmd, sign_in_cmd, add_user_cmd, add_result_cmd,
                              viewer_path, viewer_checksum,
                              viewer_db_path, viewer_db_checksum)
                      values ('8f9213ef-5d04-11e3-9fa4-001a4a81450b', 'b7289170-5c46-11e3-9fa4-001a4a81450b',
                              '1',
                              'invocation_cmd', 'sign_in_cmd', 'add_user_cmd', 'add_result_cmd',
                              'viewer_path', 'viewer_checksum',
                              'viewer_db_path', 'viewer_db_checksum');
          commit;


#        update package_store.package_version set build_needed = 1;
        update tool_shed.tool set name = 'cppcheck' where tool_uuid = '163e5d8c-156e-11e3-a239-001a4a81450b';
        commit;

        update tool_shed.tool_version
           set tool_path = '/opt/SCATools/cppcheck/cppcheck-1.61.tar.gz',
               version_string = '1.61',
               tool_executable = 'cppcheck',
               tool_directory = 'cppcheck-1.61'
          where tool_version_uuid = '1640cc00-156e-11e3-a239-001a4a81450b';
        commit;

        # update database version number
        insert into assessment.database_version (database_version_no, description) values (script_version_no, 'upgrade');

        commit;
      end;
    end if;
END
$$
DELIMITER ;
