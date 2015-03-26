# v1.13
use assessment;
drop PROCEDURE if exists upgrade_35;
DELIMITER $$
CREATE PROCEDURE upgrade_35 ()
  BEGIN
    declare script_version_no int;
    declare cur_db_version_no int;
    set script_version_no = 35;

    select max(database_version_no)
      into cur_db_version_no
      from assessment.database_version;

    if cur_db_version_no < script_version_no then
      begin

        # Android Package Version Columns
        ALTER TABLE package_store.package_version ADD COLUMN android_sdk_target VARCHAR(255) NULL DEFAULT NULL COMMENT 'used for android java source code only' AFTER bytecode_source_path;
        ALTER TABLE package_store.package_version ADD COLUMN android_redo_build tinyint(1) NULL DEFAULT NULL COMMENT 'used for android java source code only' AFTER android_sdk_target;

        # update database version number
        insert into assessment.database_version (database_version_no, description) values (script_version_no, 'upgrade to v1.13');

        commit;
      end;
    end if;
END
$$
DELIMITER ;
