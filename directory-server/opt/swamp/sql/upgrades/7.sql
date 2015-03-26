use project;
drop PROCEDURE if exists upgrade_7;
DELIMITER $$
CREATE PROCEDURE upgrade_7 ()
  BEGIN
    declare script_version_no int;
    declare cur_db_version_no int;
    set script_version_no = 7;

    select max(database_version_no)
      into cur_db_version_no
      from project.database_version;

    if cur_db_version_no < script_version_no then
      begin

        # Add Column
        ALTER TABLE project.project
          ADD COLUMN trial_project_flag tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Is project a trial project: 0=false 1=true' AFTER affiliation;

        # update database version number
        insert into project.database_version (database_version_no, description) values (script_version_no, 'upgrade');
        commit;
      end;
    end if;
END
$$
DELIMITER ;
