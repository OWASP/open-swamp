use assessment;
drop PROCEDURE if exists upgrade_28;
DELIMITER $$
CREATE PROCEDURE upgrade_28 ()
  BEGIN
    declare script_version_no int;
    declare cur_db_version_no int;
    set script_version_no = 28;

    select max(database_version_no)
      into cur_db_version_no
      from assessment.database_version;

    if cur_db_version_no < script_version_no then
      begin

        # Add groups to the data model
        drop table if exists assessment.group_list;
        CREATE TABLE assessment.group_list (
          group_uuid       VARCHAR(45)  NOT NULL                        COMMENT 'group uuid',
          name             VARCHAR(45)                                  COMMENT 'display name of group',
          group_type       VARCHAR(45)                                  COMMENT 'group type',
          uuid_list        VARCHAR(5000)                                COMMENT 'group elements',
          create_user      VARCHAR(25)                                  COMMENT 'db user that inserted record',
          create_date      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'date record inserted',
          update_user      VARCHAR(25)                                  COMMENT 'db user that last updated record',
          update_date      TIMESTAMP NULL DEFAULT NULL                  COMMENT 'date record last updated',
          PRIMARY KEY (group_uuid)
         )COMMENT='group records';

        # Add system_status table
        drop table if exists assessment.system_status;
        CREATE TABLE assessment.system_status (
          status_key   VARCHAR(512)  NOT NULL                       COMMENT 'key value',
          value        VARCHAR(5000)                                COMMENT 'status value',
          update_date  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'date record last updated',
          PRIMARY KEY (status_key)
         )COMMENT='system status records';

        # update database version number
        insert into assessment.database_version (database_version_no, description) values (script_version_no, 'upgrade');

        commit;
      end;
    end if;
END
$$
DELIMITER ;
