use assessment;
drop PROCEDURE if exists upgrade_16;
DELIMITER $$
CREATE PROCEDURE upgrade_16 ()
  BEGIN
    declare script_version_no int;
    declare cur_db_version_no int;
    set script_version_no = 16;

    select max(database_version_no)
      into cur_db_version_no
      from assessment.database_version;

    if cur_db_version_no < script_version_no then
      begin

        # Remove custom_shell_cmd
        ALTER TABLE package_store.package_version DROP COLUMN custom_shell_cmd;

        # update database version number
        insert into assessment.database_version (database_version_no, description) values (script_version_no, 'upgrade');

        commit;
      end;
    end if;
END
$$
DELIMITER ;
