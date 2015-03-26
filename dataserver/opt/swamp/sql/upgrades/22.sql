use assessment;
drop PROCEDURE if exists upgrade_22;
DELIMITER $$
CREATE PROCEDURE upgrade_22 ()
  BEGIN
    declare script_version_no int;
    declare cur_db_version_no int;
    set script_version_no = 22;

    select max(database_version_no)
      into cur_db_version_no
      from assessment.database_version;

    if cur_db_version_no < script_version_no then
      begin

        # create assessment.execution_event table
        drop table if exists assessment.execution_event;
        CREATE TABLE assessment.execution_event (
          execution_event_id      INT  NOT NULL  AUTO_INCREMENT                COMMENT 'internal id',
          execution_record_uuid   VARCHAR(45) NOT NULL                         COMMENT 'execution record uuid',
          event_time              VARCHAR(25)                                  COMMENT 'event',
          event                   VARCHAR(25)                                  COMMENT 'event',
          payload                 VARCHAR(100)                                 COMMENT 'optional additional info',
          create_user             VARCHAR(25)                                  COMMENT 'db user that inserted record',
          create_date             TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'date record inserted',
          update_user             VARCHAR(25)                                  COMMENT 'db user that last updated record',
          update_date             TIMESTAMP NULL DEFAULT NULL                  COMMENT 'date record last updated',
          PRIMARY KEY (execution_event_id),
            CONSTRAINT fk_execution_event FOREIGN KEY (execution_record_uuid) REFERENCES execution_record (execution_record_uuid) ON DELETE CASCADE ON UPDATE CASCADE
         )COMMENT='execution event log';

        # update database version number
        insert into assessment.database_version (database_version_no, description) values (script_version_no, 'upgrade');

        commit;
      end;
    end if;
END
$$
DELIMITER ;
