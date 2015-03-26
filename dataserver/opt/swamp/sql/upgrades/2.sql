###############
# Oct 30, 2013
# Tool - new columns
# update data for PMD, FindBugs
use assessment;
drop PROCEDURE if exists upgrade_2;
DELIMITER $$
CREATE PROCEDURE upgrade_2 ()
  BEGIN
    declare script_version_no int;
    declare cur_db_version_no int;
    set script_version_no = 2;

    select max(database_version_no)
      into cur_db_version_no
      from assessment.database_version;

    if cur_db_version_no < script_version_no then
      begin
        # data model updates
        alter table tool_shed.tool_version change deployment_cmd tool_arguments VARCHAR(200) COMMENT '';
        alter table tool_shed.tool_version change invocation_cmd tool_executable VARCHAR(200) COMMENT '';
        alter table tool_shed.tool_version add column tool_directory VARCHAR(200) COMMENT 'top level directory within the archive' after tool_arguments;

        # update data for PMD, FindBugs
        update tool_shed.tool_version set tool_directory = tool_arguments, tool_arguments = '' where tool_uuid in ('163d56a7-156e-11e3-a239-001a4a81450b','163f2b01-156e-11e3-a239-001a4a81450b');

        # update database version number
        insert into assessment.database_version (database_version_no, description) values (script_version_no, 'upgrade');
        commit;
      end;
    end if;
END
$$
DELIMITER ;