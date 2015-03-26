###############
# Oct 30, 2013
# Rename table: assessment_run_request
# rename table assessment_run_request_assoc
# column assessment_run_request_id is unchanged
use assessment;
drop PROCEDURE if exists upgrade_3;
DELIMITER $$
CREATE PROCEDURE upgrade_3 ()
  BEGIN
    declare script_version_no int;
    declare cur_db_version_no int;
    set script_version_no = 3;

    select max(database_version_no)
      into cur_db_version_no
      from assessment.database_version;

    if cur_db_version_no < script_version_no then
      begin
        # rename table assessment_run_request_assoc
        RENAME TABLE assessment.assessment_run_request_assoc TO assessment.assessment_run_request;

        # I made a quick fix of renaming the column to match laravel on Monday.  This is the long term solution.
        alter table assessment.assessment_run_request
          change assessment_run_request_assoc_id
          assessment_run_request_id INT  NOT NULL  AUTO_INCREMENT COMMENT 'internal id';

        # update database version number
        insert into assessment.database_version (database_version_no, description) values (script_version_no, 'upgrade');
        commit;
      end;
    end if;
END
$$
DELIMITER ;