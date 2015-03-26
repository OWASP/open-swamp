# 11/26/2013
# add new fields to package_version table
use assessment;
drop PROCEDURE if exists upgrade_6;
DELIMITER $$
CREATE PROCEDURE upgrade_6 ()
  BEGIN
    declare script_version_no int;
    declare cur_db_version_no int;
    set script_version_no = 6;

    select max(database_version_no)
      into cur_db_version_no
      from assessment.database_version;

    if cur_db_version_no < script_version_no then
      begin
        # data model updates
        ALTER TABLE package_store.package_version
          ADD COLUMN build_dir        VARCHAR(200) NULL DEFAULT '.'  COMMENT 'path with the package where the build step should occur'                             AFTER build_target,
          ADD COLUMN build_opt        VARCHAR(200) NULL DEFAULT NULL COMMENT 'specifies additional options to pass to the build tool that may be package specific' AFTER build_dir,
          ADD COLUMN config_cmd       VARCHAR(200) NULL DEFAULT NULL COMMENT 'command to run to configure a package prior to building the package'                 AFTER build_opt,
          ADD COLUMN config_opt       VARCHAR(200) NULL DEFAULT NULL COMMENT 'options to provide to the config_cmd'                                                AFTER config_cmd,
          ADD COLUMN config_dir       VARCHAR(200) NULL DEFAULT '.'  COMMENT 'path where the configure step should occur within the package tree'                  AFTER config_opt,
          ADD COLUMN custom_shell_cmd VARCHAR(500) NULL DEFAULT NULL COMMENT 'shell commands for any configuration or build step not already specified'            AFTER config_dir;

        # update database version number
        insert into assessment.database_version (database_version_no, description) values (script_version_no, 'upgrade');

        commit;
      end;
    end if;
END
$$
DELIMITER ;

