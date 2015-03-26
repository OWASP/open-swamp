use assessment;
drop PROCEDURE if exists upgrade_17;
DELIMITER $$
CREATE PROCEDURE upgrade_17 ()
  BEGIN
    declare script_version_no int;
    declare cur_db_version_no int;
    set script_version_no = 17;

    select max(database_version_no)
      into cur_db_version_no
      from assessment.database_version;

    if cur_db_version_no < script_version_no then
      begin

        # Remove package_language table
        drop TABLE package_store.package_language;

        # add new columns to viewer_instance table
        ALTER TABLE viewer_store.viewer_instance ADD COLUMN vm_ip_address VARCHAR(50)  COMMENT 'ip address of vm' AFTER api_key;
        ALTER TABLE viewer_store.viewer_instance ADD COLUMN proxy_url     VARCHAR(100) COMMENT 'proxy url'        AFTER vm_ip_address;

        # update database version number
        insert into assessment.database_version (database_version_no, description) values (script_version_no, 'upgrade');

        commit;
      end;
    end if;
END
$$
DELIMITER ;
