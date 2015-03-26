use assessment;
drop PROCEDURE if exists upgrade_31;
DELIMITER $$
CREATE PROCEDURE upgrade_31 ()
  BEGIN
    declare script_version_no int;
    declare cur_db_version_no int;
    set script_version_no = 31;

    select max(database_version_no)
      into cur_db_version_no
      from assessment.database_version;

    if cur_db_version_no < script_version_no then
      begin

        # Add system setting currently_processing_execution_records
        insert into assessment.system_status (status_key, value) values ('CURRENTLY_PROCESSING_EXECUTION_RECORDS', 'N');

        # update database version number
        insert into assessment.database_version (database_version_no, description) values (script_version_no, 'upgrade');

        commit;
      end;
    end if;
END
$$
DELIMITER ;
