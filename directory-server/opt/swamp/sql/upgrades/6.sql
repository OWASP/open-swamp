use project;
drop PROCEDURE if exists upgrade_6;
DELIMITER $$
CREATE PROCEDURE upgrade_6 ()
  BEGIN
    declare script_version_no int;
    declare cur_db_version_no int;
    set script_version_no = 6;

    select max(database_version_no)
      into cur_db_version_no
      from project.database_version;

    if cur_db_version_no < script_version_no then
      begin

        # change password
        SET PASSWORD FOR 'web'@'%' = PASSWORD('password');

        # update database version number
        insert into project.database_version (database_version_no, description) values (script_version_no, 'upgrade');
        commit;
      end;
    end if;
END
$$
DELIMITER ;
