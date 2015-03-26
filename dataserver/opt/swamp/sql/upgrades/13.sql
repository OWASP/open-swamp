use assessment;
drop PROCEDURE if exists upgrade_13;
DELIMITER $$
CREATE PROCEDURE upgrade_13 ()
  BEGIN
    declare script_version_no int;
    declare cur_db_version_no int;
    set script_version_no = 13;

    select max(database_version_no)
      into cur_db_version_no
      from assessment.database_version;

    if cur_db_version_no < script_version_no then
      begin
        # Add bytecode package fields
        ALTER TABLE package_store.package_version ADD COLUMN bytecode_class_path     VARCHAR(1000) NULL DEFAULT NULL COMMENT 'used for java bytecode only' AFTER config_dir;
        ALTER TABLE package_store.package_version ADD COLUMN bytecode_aux_class_path VARCHAR(1000) NULL DEFAULT NULL COMMENT 'used for java bytecode only' AFTER bytecode_class_path;
        ALTER TABLE package_store.package_version ADD COLUMN bytecode_source_path    VARCHAR(1000) NULL DEFAULT NULL COMMENT 'used for java bytecode only' AFTER bytecode_aux_class_path;

        # update database version number
        insert into assessment.database_version (database_version_no, description) values (script_version_no, 'upgrade');

        commit;
      end;
    end if;
END
$$
DELIMITER ;
