# v1.10
use assessment;
drop PROCEDURE if exists upgrade_32;
DELIMITER $$
CREATE PROCEDURE upgrade_32 ()
  BEGIN
    declare script_version_no int;
    declare cur_db_version_no int;
    set script_version_no = 32;

    select max(database_version_no)
      into cur_db_version_no
      from assessment.database_version;

    if cur_db_version_no < script_version_no then
      begin

        # create table for ssh request log
        CREATE TABLE assessment.ssh_request (
          ssh_request_id         INT  NOT NULL  AUTO_INCREMENT                COMMENT 'internal id',
          user_uuid              VARCHAR(45)                                  COMMENT 'user',
          execution_record_uuid  VARCHAR(45)                                  COMMENT 'execution record uuid',
          source_ip              VARCHAR(50)                                  COMMENT 'db user that inserted record',
          destination_ip         VARCHAR(50)                                  COMMENT 'db user that inserted record',
          destination_hostname   VARCHAR(100)                                 COMMENT 'db user that inserted record',
          create_user            VARCHAR(50)                                  COMMENT 'db user that inserted record',
          create_date            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'date record inserted',
          update_user            VARCHAR(50)                                  COMMENT 'db user that last updated record',
          update_date            TIMESTAMP NULL DEFAULT NULL                  COMMENT 'date record last updated',
          PRIMARY KEY (ssh_request_id)
         )COMMENT='ssh request log';

        # add ssh fields to execution record
        ALTER TABLE assessment.execution_record ADD COLUMN vm_hostname  VARCHAR(100) COMMENT 'vm ssh hostname' AFTER cpu_utilization;
        ALTER TABLE assessment.execution_record ADD COLUMN vm_username  VARCHAR(50)  COMMENT 'vm ssh username' AFTER vm_hostname;
        ALTER TABLE assessment.execution_record ADD COLUMN vm_password  VARCHAR(50)  COMMENT 'vm ssh password' AFTER vm_username;

        # update database version number
        insert into assessment.database_version (database_version_no, description) values (script_version_no, 'upgrade');

        commit;
      end;
    end if;
END
$$
DELIMITER ;
