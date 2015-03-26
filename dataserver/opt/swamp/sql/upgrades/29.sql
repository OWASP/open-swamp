use assessment;
drop PROCEDURE if exists upgrade_29;
DELIMITER $$
CREATE PROCEDURE upgrade_29 ()
  BEGIN
    declare script_version_no int;
    declare cur_db_version_no int;
    set script_version_no = 29;

    select max(database_version_no)
      into cur_db_version_no
      from assessment.database_version;

    if cur_db_version_no < script_version_no then
      begin

        # insert new run request record
        insert into assessment.run_request (run_request_uuid, project_uuid, name, description) values ('f18550dd-fdca-11e3-8775-001a4a81450b', ' ', 'Run on new pkg versions', 'Run each time a new version of package is available');

        # update database version number
        insert into assessment.database_version (database_version_no, description) values (script_version_no, 'upgrade');

        commit;
      end;
    end if;
END
$$
DELIMITER ;
