use project;
drop PROCEDURE if exists upgrade_5;
DELIMITER $$
CREATE PROCEDURE upgrade_5 ()
  BEGIN
    declare script_version_no int;
    declare cur_db_version_no int;
    set script_version_no = 5;

    select max(database_version_no)
      into cur_db_version_no
      from project.database_version;

    if cur_db_version_no < script_version_no then
      begin

        # remove project accept date
        alter table project.project drop column accept_date;

        # update database version number
        insert into project.database_version (database_version_no, description) values (script_version_no, 'upgrade');
        commit;
      end;
    end if;
END
$$
DELIMITER ;
