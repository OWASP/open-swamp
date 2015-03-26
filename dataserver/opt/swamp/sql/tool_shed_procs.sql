use tool_shed;

####################
## Views

CREATE OR REPLACE VIEW user_tool_events as
  select t.tool_owner_uuid as user_uuid, v.create_date as event_date, 'Upload' as event_type, v.tool_version_uuid
    from tool t inner join tool_version v on v.tool_uuid = t.tool_uuid;


###################
## Triggers

DROP TRIGGER IF EXISTS tool_BINS;
DROP TRIGGER IF EXISTS tool_BUPD;
DROP TRIGGER IF EXISTS tool_version_BINS;
DROP TRIGGER IF EXISTS tool_version_BUPD;
DROP TRIGGER IF EXISTS specialized_tool_version_BINS;
DROP TRIGGER IF EXISTS specialized_tool_version_BUPD;
DROP TRIGGER IF EXISTS tool_language_BINS;
DROP TRIGGER IF EXISTS tool_language_BUPD;
DROP TRIGGER IF EXISTS tool_platform_BINS;
DROP TRIGGER IF EXISTS tool_platform_BUPD;

DELIMITER $$

CREATE TRIGGER tool_BINS BEFORE INSERT ON tool FOR EACH ROW SET NEW.create_user = user(), NEW.create_date = now();
$$
#CREATE TRIGGER tool_BUPD BEFORE UPDATE ON tool FOR EACH ROW SET NEW.update_user = user(), NEW.update_date = now();
#$$
#CREATE TRIGGER tool_version_BINS BEFORE INSERT ON tool_version FOR EACH ROW SET NEW.create_user = user(), NEW.create_date = now();
#$$
CREATE TRIGGER tool_version_BUPD BEFORE UPDATE ON tool_version FOR EACH ROW SET NEW.update_user = user(), NEW.update_date = now();
$$
CREATE TRIGGER specialized_tool_version_BINS BEFORE INSERT ON specialized_tool_version FOR EACH ROW SET NEW.create_user = user(), NEW.create_date = now();
$$
CREATE TRIGGER specialized_tool_version_BUPD BEFORE UPDATE ON specialized_tool_version FOR EACH ROW SET NEW.update_user = user(), NEW.update_date = now();
$$
CREATE TRIGGER tool_language_BINS BEFORE INSERT ON tool_language FOR EACH ROW SET NEW.create_user = user(), NEW.create_date = now();
$$
CREATE TRIGGER tool_language_BUPD BEFORE UPDATE ON tool_language FOR EACH ROW SET NEW.update_user = user(), NEW.update_date = now();
$$
CREATE TRIGGER tool_platform_BINS BEFORE INSERT ON tool_platform FOR EACH ROW SET NEW.create_user = user(), NEW.create_date = now();
$$
CREATE TRIGGER tool_platform_BUPD BEFORE UPDATE ON tool_platform FOR EACH ROW SET NEW.update_user = user(), NEW.update_date = now();
$$


CREATE TRIGGER tool_version_BINS BEFORE INSERT ON tool_version FOR EACH ROW
  begin
    declare max_version_no INT;
    select max(version_no) into max_version_no
      from tool_version where tool_uuid = NEW.tool_uuid;
    set NEW.create_user = user(),
        NEW.create_date = now(),
        NEW.version_no = ifnull(max_version_no,0)+1;
  end;
$$

CREATE TRIGGER tool_BUPD BEFORE UPDATE ON tool FOR EACH ROW
  BEGIN
    SET NEW.update_user = user(),
        NEW.update_date = now();
    IF IFNULL(NEW.tool_owner_uuid,'') != IFNULL(OLD.tool_owner_uuid,'')
      THEN
        insert into tool_owner_history (tool_uuid, old_tool_owner_uuid, new_tool_owner_uuid)
        values (NEW.tool_uuid, OLD.tool_owner_uuid, NEW.tool_owner_uuid);
    END IF;
  END;
$$

DELIMITER ;

###################
## Stored Procedures
####################################################
drop PROCEDURE if exists list_tools_by_project_user;
DELIMITER $$
CREATE PROCEDURE list_tools_by_project_user (
    IN user_uuid_in VARCHAR(45),
    IN project_uuid_in VARCHAR(45),
    OUT return_string varchar(100)
)
  BEGIN
    DECLARE user_account_valid_flag CHAR(1);
    DECLARE project_user_valid_flag CHAR(1);

    # check user is valid in user_account table
    select distinct 'Y'
      into user_account_valid_flag
      from project.user_account ua
     where ua.user_uid = user_uuid_in
       and ua.enabled_flag = 1;


    # check user is member of project specified
    select distinct 'Y'
      into project_user_valid_flag
      from project.project_user
     where project_uid = project_uuid_in
       and user_uid = user_uuid_in
       and delete_date is null
       and (expire_date > now() or expire_date is null);

    if user_account_valid_flag = 'Y' and project_user_valid_flag = 'Y'
    then
      begin
        select t.tool_uuid,
               tv.tool_version_uuid,
               t.name,
               t.tool_sharing_status,
               tv.version_string,
               tv.comment_public,
               tv.comment_private,
               #tv.tool_path,
               #tv.checksum,
               #t.is_build_needed,
               #tv.tool_executable,
               #tv.tool_arguments,
               #tv.tool_directory
               group_concat(tl.package_type_id) as package_type_ids,
               group_concat(pt.name) as package_type_names
          from tool t
         inner join tool_version tv on t.tool_uuid = tv.tool_uuid
         left outer join tool_language tl on tv.tool_version_uuid = tl.tool_version_uuid
         left outer join package_store.package_type pt on tl.package_type_id = pt.package_type_id
         where upper(t.tool_sharing_status) = 'PUBLIC'
          or ( upper(t.tool_sharing_status) = 'PROTECTED'
               and exists (select 1 from tool_sharing ts
                            where ts.tool_uuid = t.tool_uuid and ts.project_uuid = project_uuid_in)
              )
        group by t.tool_uuid, tv.tool_version_uuid, t.name, t.tool_sharing_status, tv.version_string, tv.comment_public, tv.comment_private;
        set return_string = 'SUCCESS';
      end;
    elseif ifnull(user_account_valid_flag,'N') != 'Y' THEN set return_string = 'ERROR: USER ACCOUNT NOT VALID';
    elseif ifnull(project_user_valid_flag,'N') != 'Y' THEN set return_string = 'ERROR: USER PROJECT PERMISSION NOT VALID';
    else set return_string = 'ERROR: UNSPECIFIED ERROR';
    end if;
END
$$
DELIMITER ;

####################################################
drop PROCEDURE if exists list_tools_by_owner;
DELIMITER $$
CREATE PROCEDURE list_tools_by_owner (
    IN user_uuid_in VARCHAR(45),
    OUT return_string varchar(100)
)
  BEGIN
    DECLARE user_account_valid_flag CHAR(1);

    # check user is valid in user_account table
    select distinct 'Y'
      into user_account_valid_flag
      from project.user_account ua
     where ua.user_uid = user_uuid_in
       and ua.enabled_flag = 1;

    if user_account_valid_flag = 'Y'
    then
      begin
        select t.tool_uuid,
               tv.tool_version_uuid,
               t.name,
               t.tool_sharing_status,
               tv.version_string,
               tv.comment_public,
               tv.comment_private,
               tv.tool_path,
               tv.checksum,
               t.is_build_needed,
               tv.tool_executable,
               tv.tool_arguments,
               tv.tool_directory,
               tv.create_date
          from tool t
         inner join tool_version tv on t.tool_uuid = tv.tool_uuid
         where t.tool_owner_uuid = user_uuid_in;
        set return_string = 'SUCCESS';
      end;
    elseif ifnull(user_account_valid_flag,'N') != 'Y' THEN set return_string = 'ERROR: USER ACCOUNT NOT VALID';
    else set return_string = 'ERROR: UNSPECIFIED ERROR';
    end if;
END
$$
DELIMITER ;

####################################################
drop PROCEDURE if exists select_all_pub_tools_and_vers;
DELIMITER $$
CREATE PROCEDURE select_all_pub_tools_and_vers ()
  BEGIN
    select tool.tool_uuid,
           tool_version.tool_version_uuid,
           tool.name as tool_name,
           tool.tool_sharing_status,
           tool_version.version_string,
           null as platform_id,
           tool_version.comment_public as public_version_comment,
           tool_version.comment_private as private_version_comment,
           tool_version.tool_path,
           tool_version.checksum,
           tool.is_build_needed as IsBuildNeeded,
           tool_version.tool_executable,
           tool_version.tool_arguments,
           tool_version.tool_directory,
           tl.package_type_id,
           pt.name as package_type_name
      from tool
     inner join tool_version on tool.tool_uuid = tool_version.tool_uuid
     inner join tool_language tl on tool_version.tool_version_uuid = tl.tool_version_uuid
     inner join package_store.package_type pt on tl.package_type_id = pt.package_type_id
     where tool.tool_sharing_status = 'PUBLIC'
       and tool_version.release_date is not null;
END
$$
DELIMITER ;
####################################################
drop PROCEDURE if exists select_tool_version;
DELIMITER $$
CREATE PROCEDURE select_tool_version (
    IN tool_version_uuid_in VARCHAR(45),
    IN platform_version_uuid_in VARCHAR(45),
    IN package_version_uuid_in VARCHAR(45)
)
  BEGIN
    DECLARE row_count_int int;
    DECLARE package_type_id_var int;

    # get pkg language
    select p.package_type_id
      into package_type_id_var
      from package_store.package p
     inner join package_store.package_version pv on pv.package_uuid = p.package_uuid
     where pv.package_version_uuid = package_version_uuid_in;

    # check if specialized version exists
    select count(1)
      into row_count_int
      from specialized_tool_version stv
       where stv.tool_version_uuid = tool_version_uuid_in
         and (
              (stv.specialization_type = 'PLATFORM' and stv.platform_version_uuid = platform_version_uuid_in)
              or
              (stv.specialization_type = 'LANGUAGE' and stv.package_type_id = package_type_id_var)
             );

    if row_count_int = 1 then
      select t.tool_uuid,
             tv.tool_version_uuid,
             t.name as tool_name,
             t.tool_sharing_status,
             tv.version_string,
             null as platform_id,
             tv.comment_public as public_version_comment,
             tv.comment_private as private_version_comment,
             stv.tool_path,
             stv.checksum,
             t.is_build_needed as IsBuildNeeded,
             stv.tool_executable,
             stv.tool_arguments,
             stv.tool_directory
        from tool t
       inner join tool_version tv on t.tool_uuid = tv.tool_uuid
       inner join specialized_tool_version stv on tv.tool_version_uuid = stv.tool_version_uuid
       where stv.tool_version_uuid = tool_version_uuid_in
         and (
              (stv.specialization_type = 'PLATFORM' and stv.platform_version_uuid = platform_version_uuid_in)
              or
              (stv.specialization_type = 'LANGUAGE' and stv.package_type_id = package_type_id_var)
             );
    else
      select tool.tool_uuid,
             tool_version.tool_version_uuid,
             tool.name as tool_name,
             tool.tool_sharing_status,
             tool_version.version_string,
             null as platform_id,
             tool_version.comment_public as public_version_comment,
             tool_version.comment_private as private_version_comment,
             tool_version.tool_path,
             tool_version.checksum,
             tool.is_build_needed as IsBuildNeeded,
             tool_version.tool_executable,
             tool_version.tool_arguments,
             tool_version.tool_directory
        from tool
       inner join tool_version on tool.tool_uuid = tool_version.tool_uuid
       where tool_version.tool_version_uuid = tool_version_uuid_in;
    end if;
END
$$
DELIMITER ;
####################################################
drop PROCEDURE if exists update_tool_cksum;
DELIMITER $$
CREATE PROCEDURE update_tool_cksum (
    IN tool_version_uuid_in VARCHAR(45),
    IN checksum_in VARCHAR(200),
    OUT return_string varchar(100)
)
  BEGIN
    DECLARE row_count_int int;
    set return_string = 'ERROR';

    select count(1)
      into row_count_int
      from tool_version
     where tool_version_uuid = tool_version_uuid_in;

   if row_count_int > 1 then
     set return_string = 'ERROR: TOO MANY ROWS';
   elseif row_count_int = 0 then
     set return_string = 'ERROR: NO RECORD FOUND';
   elseif row_count_int = 1 then
     BEGIN
       update tool_version
          set checksum = checksum_in
        where tool_version_uuid = tool_version_uuid_in;
       commit;

       set return_string = 'SUCCESS';
     END;
   end if;
END
$$
DELIMITER ;
####################################################
drop PROCEDURE if exists update_tool_path;
DELIMITER $$
CREATE PROCEDURE update_tool_path (
    IN tool_version_uuid_in VARCHAR(45),
    IN path_in VARCHAR(200),
    OUT return_string varchar(100)
)
  BEGIN
    DECLARE row_count_int int;
    set return_string = 'ERROR';

    select count(1)
      into row_count_int
      from tool_version
     where tool_version_uuid = tool_version_uuid_in;

   if row_count_int > 1 then
     set return_string = 'ERROR: TOO MANY ROWS';
   elseif row_count_int = 0 then
     set return_string = 'ERROR: NO RECORD FOUND';
   elseif row_count_int = 1 then
     BEGIN
       update tool_version
          set tool_path = path_in
        where tool_version_uuid = tool_version_uuid_in;
       commit;

       set return_string = 'SUCCESS';
     END;
   end if;
END
$$
DELIMITER ;

############################################
drop PROCEDURE if exists add_tool_version;
DELIMITER $$
CREATE PROCEDURE add_tool_version (
    IN tool_version_uuid_in VARCHAR(45),
    IN tool_path_in VARCHAR(200),
    OUT return_status varchar(12),
    OUT return_msg varchar(100)
)
  BEGIN
    DECLARE dir_name_only VARCHAR(500);
    DECLARE incoming_dir VARCHAR(500);
    DECLARE dest_dir VARCHAR(500);
    DECLARE dest_full_path VARCHAR(200);
    DECLARE cmd1 VARCHAR(500);
    DECLARE file_move_return_code INT;
    DECLARE chmod_return_code INT;
    DECLARE rm_return_code INT;
    DECLARE test_count INT;
    DECLARE cksum VARCHAR(200);

    set dir_name_only = substr(tool_path_in,1,instr(tool_path_in,'/')-1);  # directory name without file
    set incoming_dir = concat('/swamp/incoming/',dir_name_only);
    set dest_dir = concat('/swamp/store/SCATools/', dir_name_only);
    set dest_full_path = concat('/swamp/store/SCATools/',tool_path_in);

    # check that there's one record
    select count(1)
      into test_count
     from tool_version
     where tool_version_uuid = tool_version_uuid_in;

    # copy file
    set cmd1 = CONCAT('cp -r ', incoming_dir, ' ', dest_dir);
    set file_move_return_code = sys_exec(cmd1);

    # remove incoming file, make sure path isn't '/' first
    # NOTE: If the rm encounters an error, it will be logged but, we don't fail the procedure.
    #       If everything else succedded, removing the incoming copy isn't essential.
    #       The cron job will delete the incoming copy in a few minutes anyway.
    if (incoming_dir != '/') and (incoming_dir not like '/ %') then
      begin
        set cmd1 = null;
        set cmd1 = CONCAT('rm -rf ', incoming_dir);
        set rm_return_code = sys_exec(cmd1);
      end;
    end if;

    # set permissions
    set cmd1 = null;
    set cmd1 = CONCAT('chmod -R 755 ', dest_dir);
    set chmod_return_code = sys_exec(cmd1);
    #insert into assessment.sys_exec_cmd_log (cmd, caller) values (cmd1, concat('upload new pkg: return code: ',chmod_return_code));

    # calculate checksum, parse until first space
    set cksum = sys_eval(concat('sha512sum ',dest_full_path));
    set cksum = substr(cksum,1,instr(cksum,' ')-1);

    if test_count != 1 then
      set return_status = 'ERROR', return_msg = 'Tool version not found';
    elseif file_move_return_code != 0 then
      set return_status = 'ERROR', return_msg = 'Error moving tool to storage';
    elseif chmod_return_code != 0 then
      set return_status = 'ERROR', return_msg = 'Error setting tool permissions';
    elseif cksum is null then
      set return_status = 'ERROR', return_msg = 'Error calculating checksum';
    else
      begin
        update tool_version
           set tool_path = dest_full_path,
               checksum = cksum
         where tool_version_uuid = tool_version_uuid_in;
        set return_status = 'SUCCESS', return_msg = 'Tool sucessfully moved to storage';
      end;
    end if;

END
$$
DELIMITER ;


drop PROCEDURE if exists download_tool;
DELIMITER $$
############################################
CREATE PROCEDURE download_tool (
    IN tool_version_uuid_in VARCHAR(45),
    OUT return_url varchar(200),
    OUT return_success_flag char(1),
    OUT return_msg varchar(100)
  )
  BEGIN
    DECLARE row_count_int INT;
    DECLARE tool_path_var VARCHAR(200);

    # verify exists 1 matching record
    select count(1)
      into row_count_int
     from tool_version
     where tool_version_uuid = tool_version_uuid_in;

    if row_count_int = 1 then
      BEGIN
        # get file path
        select tool_path
          into tool_path_var
         from tool_version
         where tool_version_uuid = tool_version_uuid_in;

        # call download procedure
        call assessment.download(tool_path_var, return_url, return_success_flag, return_msg);

      END;
    else set return_success_flag = 'N', return_msg = 'ERROR: RECORD NOT FOUND';
    end if;

END
$$
DELIMITER ;

###################
## Grants

# 'web'@'%'
GRANT SELECT, INSERT, UPDATE, DELETE ON tool_shed.* TO 'web'@'%';
GRANT EXECUTE ON PROCEDURE tool_shed.add_tool TO 'web'@'%';
GRANT EXECUTE ON PROCEDURE tool_shed.add_tool_version TO 'web'@'%';
GRANT EXECUTE ON PROCEDURE tool_shed.list_tools_by_project_user TO 'web'@'%';
GRANT EXECUTE ON PROCEDURE tool_shed.list_tools_by_owner TO 'web'@'%';

# 'java_agent'@'%'
GRANT EXECUTE ON PROCEDURE tool_shed.select_all_pub_tools_and_vers TO 'java_agent'@'%';
GRANT EXECUTE ON PROCEDURE tool_shed.select_tool_version TO 'java_agent'@'%';
GRANT EXECUTE ON PROCEDURE tool_shed.update_tool_cksum TO 'java_agent'@'%';
GRANT EXECUTE ON PROCEDURE tool_shed.update_tool_path TO 'java_agent'@'%';

# 'java_agent'@'localhost'
GRANT EXECUTE ON PROCEDURE tool_shed.select_all_pub_tools_and_vers TO 'java_agent'@'localhost';
GRANT EXECUTE ON PROCEDURE tool_shed.select_tool_version TO 'java_agent'@'localhost';
GRANT EXECUTE ON PROCEDURE tool_shed.update_tool_cksum TO 'java_agent'@'localhost';
GRANT EXECUTE ON PROCEDURE tool_shed.update_tool_path TO 'java_agent'@'localhost';

# 'java_agent'@'swa-csaper-dt-01.mirsam.org'
GRANT EXECUTE ON PROCEDURE tool_shed.select_all_pub_tools_and_vers TO 'java_agent'@'swa-csaper-dt-01.mirsam.org';
GRANT EXECUTE ON PROCEDURE tool_shed.select_tool_version TO 'java_agent'@'swa-csaper-dt-01.mirsam.org';
GRANT EXECUTE ON PROCEDURE tool_shed.update_tool_cksum TO 'java_agent'@'swa-csaper-dt-01.mirsam.org';
GRANT EXECUTE ON PROCEDURE tool_shed.update_tool_path TO 'java_agent'@'swa-csaper-dt-01.mirsam.org';

