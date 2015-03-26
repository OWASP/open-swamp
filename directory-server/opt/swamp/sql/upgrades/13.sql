# v1.17
use project;
drop PROCEDURE if exists upgrade_13;
DELIMITER $$
CREATE PROCEDURE upgrade_13 ()
  BEGIN
    declare script_version_no int;
    declare cur_db_version_no int;
    set script_version_no = 13;

    select max(database_version_no)
      into cur_db_version_no
      from project.database_version;

    if cur_db_version_no < script_version_no then
      begin

        # Add meta_information to user permission table
        ALTER TABLE project.project_user
          ADD COLUMN expire_date TIMESTAMP NULL DEFAULT NULL COMMENT 'date membership expires' AFTER delete_date;

        # insert GrammaTech permission
        insert into project.permission (permission_code, title, description, admin_only_flag, policy_code) values ('grammatech-user', 'GrammaTech User', 'GrammaTech User', 0, 'grammatech-user-policy');

        # update database version number
        insert into project.database_version (database_version_no, description) values (script_version_no, 'upgrade to v1.17');
        commit;
      end;
    end if;
END
$$
DELIMITER ;
