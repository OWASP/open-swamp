use viewer_store;

####################
## Views


###################
## Triggers

DROP TRIGGER IF EXISTS viewer_BINS;
DROP TRIGGER IF EXISTS viewer_BUPD;
DROP TRIGGER IF EXISTS viewer_version_BINS;
DROP TRIGGER IF EXISTS viewer_version_BUPD;
DROP TRIGGER IF EXISTS project_default_viewer_BINS;
DROP TRIGGER IF EXISTS project_default_viewer_BUPD;
DROP TRIGGER IF EXISTS viewer_instance_BINS;
DROP TRIGGER IF EXISTS viewer_instance_BUPD;
DROP TRIGGER IF EXISTS viewer_sharing_BINS;
DROP TRIGGER IF EXISTS viewer_sharing_BUPD;

DELIMITER $$

CREATE TRIGGER viewer_BINS BEFORE INSERT ON viewer FOR EACH ROW SET NEW.create_user = user(), NEW.create_date = now();
$$
#CREATE TRIGGER viewer_BUPD BEFORE UPDATE ON viewer FOR EACH ROW SET NEW.update_user = user(), NEW.update_date = now();
#$$
#CREATE TRIGGER viewer_version_BINS BEFORE INSERT ON viewer_version FOR EACH ROW SET NEW.create_user = user(), NEW.create_date = now();
#$$
CREATE TRIGGER viewer_version_BUPD BEFORE UPDATE ON viewer_version FOR EACH ROW SET NEW.update_user = user(), NEW.update_date = now();
$$
CREATE TRIGGER project_default_viewer_BINS BEFORE INSERT ON project_default_viewer FOR EACH ROW SET NEW.create_user = user(), NEW.create_date = now();
$$
CREATE TRIGGER project_default_viewer_BUPD BEFORE UPDATE ON project_default_viewer FOR EACH ROW SET NEW.update_user = user(), NEW.update_date = now();
$$
CREATE TRIGGER viewer_instance_BINS BEFORE INSERT ON viewer_instance FOR EACH ROW SET NEW.create_user = user(), NEW.create_date = now();
$$
CREATE TRIGGER viewer_instance_BUPD BEFORE UPDATE ON viewer_instance FOR EACH ROW SET NEW.update_user = user(), NEW.update_date = now();
$$
CREATE TRIGGER viewer_sharing_BINS BEFORE INSERT ON viewer_sharing FOR EACH ROW SET NEW.create_user = user(), NEW.create_date = now();
$$
CREATE TRIGGER viewer_sharing_BUPD BEFORE UPDATE ON viewer_sharing FOR EACH ROW SET NEW.update_user = user(), NEW.update_date = now();
$$
# view owner history trigger
CREATE TRIGGER viewer_BUPD BEFORE UPDATE ON viewer FOR EACH ROW
  BEGIN
    SET NEW.update_user = user(),
        NEW.update_date = now();
    IF IFNULL(NEW.viewer_owner_uuid,'') != IFNULL(OLD.viewer_owner_uuid,'')
      THEN
        insert into viewer_owner_history (viewer_uuid, old_viewer_owner_uuid, new_viewer_owner_uuid)
        values (NEW.viewer_uuid, OLD.viewer_owner_uuid, NEW.viewer_owner_uuid);
    END IF;
  END;
$$

# version number auto-populate
CREATE TRIGGER viewer_version_BINS BEFORE INSERT ON viewer_version FOR EACH ROW
  begin
    declare max_version_no INT;
    select max(version_no) into max_version_no
      from viewer_version where viewer_uuid = NEW.viewer_uuid;
    set NEW.create_user = user(),
        NEW.create_date = now(),
        NEW.version_no = ifnull(max_version_no,0)+1;
  end;
$$

DELIMITER ;

####################################################
## Stored Procedures

drop PROCEDURE if exists store_viewer;
DELIMITER $$
###############################
CREATE PROCEDURE store_viewer (
    IN viewer_instance_uuid_in VARCHAR(45),
    IN viewer_db_path_in VARCHAR(200),
    IN viewer_db_checksum_in VARCHAR(200),
    OUT return_string varchar(100)
  )
  BEGIN
    DECLARE row_count_int int;
    DECLARE project_uuid_var VARCHAR(45);
    DECLARE viewer_db_filename VARCHAR(200);
    DECLARE dest_path VARCHAR(200);
    DECLARE dest_full_path VARCHAR(200);
    DECLARE mkdir_return_code INT;
    DECLARE mv_return_code INT;
    DECLARE chmod_return_code INT;
    DECLARE rm_return_code INT;
    DECLARE cmd VARCHAR(500);

    # verify exists 1 matching viewer_instance
    select count(1)
      into row_count_int
      from viewer_store.viewer_instance
     where viewer_instance_uuid = viewer_instance_uuid_in;

    if row_count_int = 1 then
      BEGIN
        # fetch viewer instance info
        select project_uuid
          into project_uuid_var
          from viewer_store.viewer_instance
         where viewer_instance_uuid = viewer_instance_uuid_in;

        # Set filenames and paths
        set viewer_db_filename = substring_index(viewer_db_path_in,'/',-1);
        set dest_full_path = concat('/swamp/SCAProjects/',project_uuid_var,'/V-Runs/',viewer_instance_uuid_in,'/',viewer_db_filename);
        set dest_path = concat('/swamp/SCAProjects/',project_uuid_var,'/V-Runs/',viewer_instance_uuid_in,'/');

        # mkdir for viewer_instance
        set cmd = null;
        set cmd = CONCAT('mkdir -p ', dest_path);
        set mkdir_return_code = sys_exec(cmd);

        # move viewer_db file
        set cmd = null;
        set cmd = CONCAT('cp -f ', viewer_db_path_in, ' ', dest_full_path);
        set mv_return_code = sys_exec(cmd);

        # set permissions
        set cmd = null;
        set cmd = CONCAT('chmod 444 ', dest_full_path);
        set chmod_return_code = sys_exec(cmd);


        # Confirm file moves, then update record and return success.
        if mkdir_return_code     != 0 then set return_string = 'ERROR CREATING DIR';
        elseif mv_return_code    != 0 then set return_string = 'ERROR MOVING VIEWER DB';
        elseif chmod_return_code != 0 then set return_string = 'ERROR CHMOD VIEWER DB';
        else begin
            # delete incoming viewer_db file - not required for SUCCESS
            set cmd = null;
            set cmd = CONCAT('rm -rf ', viewer_db_path_in);
            set rm_return_code = sys_exec(cmd);
            #insert into sys_exec_cmd_log (cmd, caller) values (cmd, 'store_viewer: remove incoming viewer_db');
            #if rmdir_return_code != 0 then set return_string = 'ERROR REMOVING INCOMING VIEWER_DB';

            update viewer_instance
               set viewer_db_path = dest_full_path,
                   viewer_db_checksum = viewer_db_checksum_in
              where viewer_instance_uuid = viewer_instance_uuid_in;

            set return_string = 'SUCCESS';
          end;
        end if;
      END;
    else
      set return_string = 'ERROR: Viewer Instance Not Found';
    end if;

END
$$
DELIMITER ;

drop PROCEDURE if exists fetch_viewer;
DELIMITER $$
###############################
CREATE PROCEDURE fetch_viewer (
    IN viewer_instance_uuid_in VARCHAR(45),
    OUT viewer_db_path_out VARCHAR(200),
    OUT viewer_db_checksum_out VARCHAR(200),
    OUT api_key_out VARCHAR(50),
    OUT return_string varchar(100)
  )
  BEGIN
    DECLARE row_count_int int;
    DECLARE viewer_db_filename VARCHAR(200);
    DECLARE dest_path VARCHAR(200);
    DECLARE viewer_db_path_var VARCHAR(200);
    #DECLARE viewer_db_checksum_var VARCHAR(200);
    #DECLARE dest_full_path VARCHAR(200);
    DECLARE mkdir_return_code INT;
    DECLARE mv_return_code INT;
    DECLARE chmod_return_code INT;
    DECLARE rm_return_code INT;
    DECLARE cmd VARCHAR(500);

    # Set filenames and paths
    set dest_path = concat('/swamp/working/viewers/',viewer_instance_uuid_in,'/');


    # verify exists 1 matching viewer_instance
    select count(1)
      into row_count_int
      from viewer_store.viewer_instance
     where viewer_instance_uuid = viewer_instance_uuid_in;

    if row_count_int = 1 then
      BEGIN

        # lookup viewer_instance details
        select v.viewer_db_path, v.viewer_db_checksum, api_key
          into viewer_db_path_var, viewer_db_checksum_out, api_key_out
          from viewer_instance v
         where viewer_instance_uuid = viewer_instance_uuid_in;

        # get filename from path, set full destination path
        set viewer_db_filename = substring_index(viewer_db_path_var,'/',-1);
        set viewer_db_path_out = concat(dest_path,viewer_db_filename);

        # mkdir for viewer_instance destination
        set cmd = null;
        set cmd = CONCAT('mkdir -p ', dest_path);
        set mkdir_return_code = sys_exec(cmd);

        # move viewer_db file
        set cmd = null;
        set cmd = CONCAT('cp ', viewer_db_path_var, ' ', viewer_db_path_out);
        set mv_return_code = sys_exec(cmd);

        # set permissions
        set cmd = null;
        set cmd = CONCAT('chmod 777 ', viewer_db_path_out);
        set chmod_return_code = sys_exec(cmd);

        # Confirm file moves, then update record and return success.
        if mkdir_return_code     != 0 then set return_string = 'ERROR MKDIR VIEWER DB';
        elseif mv_return_code    != 0 then set return_string = 'ERROR MOVING VIEWER DB';
        elseif chmod_return_code != 0 then set return_string = 'ERROR CHMOD VIEWER DB';
        else                               set return_string = 'SUCCESS';
        end if;
      END;
    else
      set return_string = 'ERROR: Record Not Found';
    end if;

END
$$
DELIMITER ;


drop PROCEDURE if exists update_viewer_instance;
DELIMITER $$
###############################
CREATE PROCEDURE update_viewer_instance (
    IN viewer_instance_uuid_in VARCHAR(45),
    IN status_in VARCHAR(100),
    IN status_code_in INT,
    IN vm_ip_address_in VARCHAR(50),
    IN proxy_url_in VARCHAR(100),
    OUT return_string varchar(100)
  )
  BEGIN
    DECLARE row_count_int int;

    # verify exists 1 matching viewer_instance
    select count(1)
      into row_count_int
      from viewer_store.viewer_instance
     where viewer_instance_uuid = viewer_instance_uuid_in;

    if row_count_int = 1 then
      BEGIN
        update viewer_store.viewer_instance
           set status = status_in,
               status_code = status_code_in,
               vm_ip_address = vm_ip_address_in,
               proxy_url = proxy_url_in
         where viewer_instance_uuid = viewer_instance_uuid_in;

        set return_string = 'SUCCESS';
      END;
    else
      set return_string = 'ERROR: Record Not Found';
    end if;

END
$$
DELIMITER ;

###################
## Grants

# 'web'@'%'
GRANT SELECT, INSERT, UPDATE, DELETE ON viewer_store.* TO 'web'@'%';

# 'java_agent'@'%'
GRANT EXECUTE ON PROCEDURE viewer_store.store_viewer TO 'java_agent'@'%';
GRANT EXECUTE ON PROCEDURE viewer_store.fetch_viewer TO 'java_agent'@'%';
GRANT EXECUTE ON PROCEDURE viewer_store.update_viewer_instance TO 'java_agent'@'%';

# 'java_agent'@'localhost'
GRANT EXECUTE ON PROCEDURE viewer_store.store_viewer TO 'java_agent'@'localhost';
GRANT EXECUTE ON PROCEDURE viewer_store.fetch_viewer TO 'java_agent'@'localhost';
GRANT EXECUTE ON PROCEDURE viewer_store.update_viewer_instance TO 'java_agent'@'localhost';
