# 12/5/2013
# add new fields to package_version table, again
use assessment;
drop PROCEDURE if exists upgrade_7;
DELIMITER $$
CREATE PROCEDURE upgrade_7 ()
  BEGIN
    declare script_version_no int;
    declare cur_db_version_no int;
    set script_version_no = 7;

    select max(database_version_no)
      into cur_db_version_no
      from assessment.database_version;

    if cur_db_version_no < script_version_no then
      begin
        # data model updates
        alter table package_store.package_version change
          build_tool
          build_system VARCHAR(200) COMMENT 'specify build system';

        alter table package_store.package_version change
          custom_shell_cmd
          custom_shell_cmd VARCHAR(8000) NULL DEFAULT NULL COMMENT 'shell commands for any configuration or build step not already specified';

        alter table package_store.package_version
          add column build_cmd VARCHAR(200) NULL DEFAULT NULL COMMENT 'populated only is build_system is other' AFTER build_system;

        alter table package_store.package_version
          add column build_needed           TINYINT                             COMMENT 'Does pkg need to be built from source' AFTER source_path;

        update package_store.package_version set build_needed = 1;

        # update database version number
        insert into assessment.database_version (database_version_no, description) values (script_version_no, 'upgrade');

        commit;
      end;
    end if;
END
$$
DELIMITER ;
