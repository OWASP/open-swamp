use assessment;
drop PROCEDURE if exists upgrade_24;
DELIMITER $$
CREATE PROCEDURE upgrade_24 ()
  BEGIN
    declare script_version_no int;
    declare cur_db_version_no int;
    set script_version_no = 24;

    select max(database_version_no)
      into cur_db_version_no
      from assessment.database_version;

    if cur_db_version_no < script_version_no then
      begin

        # add new column to assessment_run_request table
        ALTER TABLE assessment.assessment_run_request ADD COLUMN user_uuid VARCHAR(45)  COMMENT 'user that requested run' AFTER run_request_id;

        # add new column to execution_record table
        ALTER TABLE assessment.execution_record ADD COLUMN user_uuid VARCHAR(45)  COMMENT 'user that requested run' AFTER run_request_uuid;

        # update database version number
        insert into assessment.database_version (database_version_no, description) values (script_version_no, 'upgrade');

        commit;
      end;
    end if;
END
$$
DELIMITER ;
