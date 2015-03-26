###############
# 11/8/2013
# add system_setting table
# Create Database Version Table
# Make Windows 7 private
# make swa_admin the owner of the prepopulated platforms/tools/packages
# Increase project description to 500
# add system_setting table
use assessment;
drop PROCEDURE if exists upgrade_5;
DELIMITER $$
CREATE PROCEDURE upgrade_5 ()
  BEGIN
    declare script_version_no int;
    declare cur_db_version_no int;
    set script_version_no = 5;

    select max(database_version_no)
      into cur_db_version_no
      from assessment.database_version;

    if cur_db_version_no < script_version_no then
      begin
        # add system_setting table
        CREATE TABLE assessment.system_setting (
          system_setting_id     INT  NOT NULL  AUTO_INCREMENT                COMMENT 'internal id',
          system_setting_code   VARCHAR(25)                                  COMMENT 'setting code name',
          system_setting_value  VARCHAR(200)                                  COMMENT 'setting value',
          create_user           VARCHAR(50)                                  COMMENT 'db user that inserted record',
          create_date           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'date record inserted',
          update_user           VARCHAR(50)                                  COMMENT 'db user that last updated record',
          update_date           TIMESTAMP NULL DEFAULT NULL                  COMMENT 'date record last updated',
          PRIMARY KEY (system_setting_id)
         )COMMENT='system config values';

        insert into assessment.system_setting (system_setting_code, system_setting_value) values ('OUTGOING_BASE_URL','https://swa-csaweb-pd-01.cosalab.org/results/');
        commit;

        # Create Database Version Table
        CREATE TABLE assessment.database_version (
          database_version_id   INT  NOT NULL  AUTO_INCREMENT                COMMENT 'internal id',
          database_version_no   INT                                          COMMENT 'version number',
          description           VARCHAR(200)                                 COMMENT 'description',
          create_user           VARCHAR(50)                                  COMMENT 'db user that inserted record',
          create_date           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'date record inserted',
          update_user           VARCHAR(50)                                  COMMENT 'db user that last updated record',
          update_date           TIMESTAMP NULL DEFAULT NULL                  COMMENT 'date record last updated',
          PRIMARY KEY (database_version_id)
         )COMMENT='database version';

        # Make Windows 7 private
        update platform_store.platform set platform_sharing_status = 'PRIVATE' where platform_uuid = 'fc54ba0f-09d7-11e3-a239-001a4a81450b';
        commit;

        # make swa_admin the owner of the prepopulated platforms/tools/packages
        update platform_store.platform set platform_owner_uuid = '80835e30-d527-11e2-8b8b-0800200c9a66' where platform_owner_uuid is null;
        update tool_shed.tool          set tool_owner_uuid     = '80835e30-d527-11e2-8b8b-0800200c9a66' where tool_owner_uuid is null;
        update package_store.package   set package_owner_uuid  = '80835e30-d527-11e2-8b8b-0800200c9a66' where package_owner_uuid is null;
        commit;

        # update database version number
        insert into assessment.database_version (database_version_no, description) values (script_version_no, 'upgrade');
        commit;
      end;
    end if;
END
$$
DELIMITER ;

