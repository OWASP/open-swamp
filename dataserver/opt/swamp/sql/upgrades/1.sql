###############
# Oct 30, 2013
# upload package
#########################
# add sys eval
#########################
# changing field names in package table
# repopulate table, breaking up tuple into seperate fields
#########################
# remove add package procedure (it was never used)
#########################
use assessment;
drop PROCEDURE if exists upgrade_1;
DELIMITER $$
CREATE PROCEDURE upgrade_1 ()
  BEGIN
    declare script_version_no int;
    declare cur_db_version_no int;
    set script_version_no = 1;

    select max(database_version_no)
      into cur_db_version_no
      from assessment.database_version;

    if cur_db_version_no < script_version_no then
      begin
        # add sys eval
        CREATE FUNCTION sys_eval RETURNS string SONAME 'lib_mysqludf_sys.so';

        # changing field names
        alter table package_store.package_version change build_output_path build_file   VARCHAR(200) COMMENT '';
        alter table package_store.package_version change deployment_cmd    build_tool   VARCHAR(200) COMMENT '';
        alter table package_store.package_version change build_cmd         build_target VARCHAR(200) COMMENT '';

        # re-populate table
        update package_store.package_version
           set build_tool = case when instr(build_target, ',') = 0 then build_target
                                 else substr(build_target from 1 for instr(build_target, ',')-1)
                             end,
             build_file = case when instr(build_target, ',') = 0 then ''
                                 else substr(substr(build_target from instr(build_target, ',') + 2) from 1 for instr(substr(build_target from instr(build_target, ',') + 2), ',')-1)
                             end,
           build_target = case when instr(build_target, ',') = 0 then ''
                                 else substr(substr(build_target from instr(build_target, ',') + 2) from instr(substr(build_target from instr(build_target, ',') + 2), ',') + 1)
                             end;
        update package_store.package_version set build_target = ltrim(build_target);

        # remove add package procedure (it was never used)
        #drop PROCEDURE if exists package_store.add_package;

        # update database version number
        insert into assessment.database_version (database_version_no, description) values (script_version_no, 'upgrade');
        commit;
      end;
    end if;
END
$$
DELIMITER ;