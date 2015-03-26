use package_store;

####################
## Views

CREATE OR REPLACE VIEW user_package_events as
  select t.package_owner_uuid as user_uuid, v.create_date as event_date, 'Upload' as event_type, v.package_version_uuid
    from package t inner join package_version v on v.package_uuid = t.package_uuid;


###################
## Triggers

DROP TRIGGER IF EXISTS package_BINS;
DROP TRIGGER IF EXISTS package_BUPD;
DROP TRIGGER IF EXISTS package_version_BINS;
DROP TRIGGER IF EXISTS package_version_BUPD;
DROP TRIGGER IF EXISTS package_version_dependency_BINS;
DROP TRIGGER IF EXISTS package_version_dependency_BUPD;
DROP TRIGGER IF EXISTS package_platform_BINS;
DROP TRIGGER IF EXISTS package_platform_BUPD;
DROP TRIGGER IF EXISTS package_type_BINS;
DROP TRIGGER IF EXISTS package_type_BUPD;
DROP TRIGGER IF EXISTS package_version_AINS;
DROP TRIGGER IF EXISTS package_version_AUPD;
DROP TRIGGER IF EXISTS package_version_sharing_AINS;

DELIMITER $$

CREATE TRIGGER package_BINS BEFORE INSERT ON package FOR EACH ROW SET NEW.create_user = user(), NEW.create_date = now();
$$
#CREATE TRIGGER package_BUPD BEFORE UPDATE ON package FOR EACH ROW SET NEW.update_user = user(), NEW.update_date = now();
#$$
#CREATE TRIGGER package_version_BINS BEFORE INSERT ON package_version FOR EACH ROW SET NEW.create_user = user(), NEW.create_date = now();
#$$
#CREATE TRIGGER package_version_BUPD BEFORE UPDATE ON package_version FOR EACH ROW SET NEW.update_user = user(), NEW.update_date = now();
#$$
CREATE TRIGGER package_version_dependency_BINS BEFORE INSERT ON package_version_dependency FOR EACH ROW SET NEW.create_user = user(), NEW.create_date = now();
$$
CREATE TRIGGER package_version_dependency_BUPD BEFORE UPDATE ON package_version_dependency FOR EACH ROW SET NEW.update_user = user(), NEW.update_date = now();
$$
CREATE TRIGGER package_platform_BINS BEFORE INSERT ON package_platform FOR EACH ROW SET NEW.create_user = user(), NEW.create_date = now();
$$
CREATE TRIGGER package_platform_BUPD BEFORE UPDATE ON package_platform FOR EACH ROW SET NEW.update_user = user(), NEW.update_date = now();
$$
CREATE TRIGGER package_type_BINS BEFORE INSERT ON package_type FOR EACH ROW SET NEW.create_user = user(), NEW.create_date = now();
$$
CREATE TRIGGER package_type_BUPD BEFORE UPDATE ON package_type FOR EACH ROW SET NEW.update_user = user(), NEW.update_date = now();
$$

CREATE TRIGGER package_BUPD BEFORE UPDATE ON package FOR EACH ROW
  BEGIN
    SET NEW.update_user = user(),
        NEW.update_date = now();
    IF IFNULL(NEW.package_owner_uuid,'') != IFNULL(OLD.package_owner_uuid,'')
      THEN
        insert into package_owner_history (package_uuid, old_package_owner_uuid, new_package_owner_uuid)
        values (NEW.package_uuid, OLD.package_owner_uuid, NEW.package_owner_uuid);
    END IF;
  END;
$$

CREATE TRIGGER package_version_BINS BEFORE INSERT ON package_version FOR EACH ROW
  begin
    declare max_version_no INT;
    select max(version_no) into max_version_no
      from package_version where package_uuid = NEW.package_uuid;
    set NEW.create_user = user(),
        NEW.create_date = now(),
        NEW.version_no = ifnull(max_version_no,0)+1,
        NEW.version_string = case when NEW.version_string is null then CAST((ifnull(max_version_no,0)+1) as CHAR(100))
                                  when NEW.version_string = ''    then CAST((ifnull(max_version_no,0)+1) as CHAR(100))
                                  else NEW.version_string end;
  end;
$$

CREATE TRIGGER package_version_BUPD BEFORE UPDATE ON package_version FOR EACH ROW
  SET NEW.update_user = user(), NEW.update_date = now(),
      NEW.version_string = case when NEW.version_string is null then CAST(NEW.version_no as CHAR(100))
                                when NEW.version_string = ''    then CAST(NEW.version_no as CHAR(100))
                                else NEW.version_string end;
$$

CREATE TRIGGER package_version_AINS AFTER INSERT ON package_version FOR EACH ROW
  BEGIN
    DECLARE assessment_run_uuid_var VARCHAR(45);
    DECLARE run_request_uuid_var VARCHAR(45);
    DECLARE user_uuid_var VARCHAR(45);
    DECLARE return_var VARCHAR(100);
    DECLARE end_of_loop BOOL;
    DECLARE row_count_int int;

    DECLARE cur1 CURSOR FOR
    select distinct ar.assessment_run_uuid, rr.run_request_uuid, arr.user_uuid
      from assessment.assessment_run ar
     inner join assessment.assessment_run_request arr on arr.assessment_run_id = ar.assessment_run_id
     inner join assessment.run_request rr on rr.run_request_id = arr.run_request_id
     where ar.package_uuid = NEW.package_uuid
       and ar.package_version_uuid is null
       and rr.run_request_uuid = 'f18550dd-fdca-11e3-8775-001a4a81450b';


    DECLARE CONTINUE HANDLER FOR NOT FOUND
        SET end_of_loop = TRUE;

    if upper(NEW.version_sharing_status) = 'PUBLIC' then
      begin

        # if anything in cursor, go thru each record
        OPEN cur1;
        read_loop: LOOP
          FETCH cur1 INTO assessment_run_uuid_var, run_request_uuid_var, user_uuid_var;
          IF end_of_loop IS TRUE THEN
            LEAVE read_loop;
          END IF;

          # Only create ER if this package version has not already been run with this assessment
          select count(1)
            into row_count_int
            from assessment.execution_record
           where assessment_run_uuid = assessment_run_uuid_var
             and package_version_uuid = NEW.package_version_uuid;

          if row_count_int = 0 then
            call assessment.create_execution_record(assessment_run_uuid_var, run_request_uuid_var, user_uuid_var, return_var);
          end if;

        END LOOP;
        CLOSE cur1;
      end;
    end if;

    # workaround for server bug
    DO (SELECT 'nothing' FROM package WHERE FALSE);
END;
$$

CREATE TRIGGER package_version_AUPD AFTER UPDATE ON package_version FOR EACH ROW
  BEGIN
    DECLARE assessment_run_uuid_var VARCHAR(45);
    DECLARE run_request_uuid_var VARCHAR(45);
    DECLARE user_uuid_var VARCHAR(45);
    DECLARE return_var VARCHAR(100);
    DECLARE end_of_loop BOOL;
    DECLARE row_count_int int;

    DECLARE cur1 CURSOR FOR
    select distinct ar.assessment_run_uuid, rr.run_request_uuid, arr.user_uuid
      from assessment.assessment_run ar
     inner join assessment.assessment_run_request arr on arr.assessment_run_id = ar.assessment_run_id
     inner join assessment.run_request rr on rr.run_request_id = arr.run_request_id
     where ar.package_uuid = NEW.package_uuid
       and ar.package_version_uuid is null
       and rr.run_request_uuid = 'f18550dd-fdca-11e3-8775-001a4a81450b';


    DECLARE CONTINUE HANDLER FOR NOT FOUND
        SET end_of_loop = TRUE;

    if upper(NEW.version_sharing_status) = 'PUBLIC' then
      begin

        # if anything in cursor, go thru each record
        OPEN cur1;
        read_loop: LOOP
          FETCH cur1 INTO assessment_run_uuid_var, run_request_uuid_var, user_uuid_var;
          IF end_of_loop IS TRUE THEN
            LEAVE read_loop;
          END IF;

          # Only create ER if this package version has not already been run with this assessment
          select count(1)
            into row_count_int
            from assessment.execution_record
           where assessment_run_uuid = assessment_run_uuid_var
             and package_version_uuid = NEW.package_version_uuid;

          if row_count_int = 0 then
            call assessment.create_execution_record(assessment_run_uuid_var, run_request_uuid_var, user_uuid_var, return_var);
          end if;

        END LOOP;
        CLOSE cur1;
      end;
    end if;

    # workaround for server bug
    DO (SELECT 'nothing' FROM package WHERE FALSE);
END;
$$

CREATE TRIGGER package_version_sharing_AINS AFTER INSERT ON package_version_sharing FOR EACH ROW
  BEGIN
    DECLARE assessment_run_uuid_var VARCHAR(45);
    DECLARE run_request_uuid_var VARCHAR(45);
    DECLARE user_uuid_var VARCHAR(45);
    DECLARE return_var VARCHAR(100);
    DECLARE end_of_loop BOOL;
    DECLARE row_count_int int;
    DECLARE notify_when_complete_flag_var tinyint(1);

    DECLARE cur1 CURSOR FOR
    select distinct ar.assessment_run_uuid, rr.run_request_uuid, arr.user_uuid, arr.notify_when_complete_flag
      from package_version pv
     inner join assessment.assessment_run ar on ar.package_uuid = pv.package_uuid
     inner join assessment.assessment_run_request arr on arr.assessment_run_id = ar.assessment_run_id
     inner join assessment.run_request rr on rr.run_request_id = arr.run_request_id
     where pv.package_version_uuid = NEW.package_version_uuid
       and ar.package_version_uuid is null
       and ar.project_uuid = NEW.project_uuid
       and rr.run_request_uuid = 'f18550dd-fdca-11e3-8775-001a4a81450b';

    DECLARE CONTINUE HANDLER FOR NOT FOUND
        SET end_of_loop = TRUE;

    # if anything in cursor, go thru each record
    OPEN cur1;
    read_loop: LOOP
      FETCH cur1 INTO assessment_run_uuid_var, run_request_uuid_var, user_uuid_var, notify_when_complete_flag_var;
      IF end_of_loop IS TRUE THEN
        LEAVE read_loop;
      END IF;

      # Only create ER if this package version has not already been run with this assessment
      select count(1)
        into row_count_int
        from assessment.execution_record
       where assessment_run_uuid = assessment_run_uuid_var
         and package_version_uuid = NEW.package_version_uuid;

      if row_count_int = 0 then
        call assessment.create_execution_record(assessment_run_uuid_var, run_request_uuid_var, notify_when_complete_flag_var, user_uuid_var, return_var);
      end if;

    END LOOP;
    CLOSE cur1;

    # workaround for server bug
    DO (SELECT 'nothing' FROM package WHERE FALSE);
END;
$$
DELIMITER ;

####################################################
## Stored Procedures
####################################################
drop PROCEDURE if exists list_pkgs_by_project_user;
DELIMITER $$
CREATE PROCEDURE list_pkgs_by_project_user (
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
        select distinct p.package_uuid, p.name, p.description,
               (select pt.name from package_type pt where pt.package_type_id = p.package_type_id) as package_type
          from package p
         inner join package_version pv on p.package_uuid = pv.package_uuid
         where upper(pv.version_sharing_status) = 'PUBLIC'
          or ( upper(pv.version_sharing_status) = 'PROTECTED'
               and exists (select 1 from package_version_sharing pvs
                            where pvs.package_version_uuid = pv.package_version_uuid and pvs.project_uuid = project_uuid_in)
              );
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
drop PROCEDURE if exists list_protected_pkgs_by_project_user;
DELIMITER $$
CREATE PROCEDURE list_protected_pkgs_by_project_user (
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
        select distinct p.package_uuid, p.name, p.description,
               (select pt.name from package_type pt where pt.package_type_id = p.package_type_id) as package_type
          from package p
         inner join package_version pv on p.package_uuid = pv.package_uuid
         where upper(pv.version_sharing_status) = 'PROTECTED'
               and exists (select 1 from package_version_sharing pvs
                            where pvs.package_version_uuid = pv.package_version_uuid and pvs.project_uuid = project_uuid_in);
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
drop PROCEDURE if exists list_pkg_vers_by_project_user;
DELIMITER $$
CREATE PROCEDURE list_pkg_vers_by_project_user (
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
        select p.package_uuid,
               pv.package_version_uuid,
               p.name,
               (select pt.name from package_type pt where pt.package_type_id = p.package_type_id) as package_type,
               p.package_sharing_status,
               pv.version_sharing_status,
               pv.version_string,
               #pv.platform_id,
               pv.notes
               #pv.package_path,
               #pv.checksum,
               #pv.source_path,
               #pv.build_file,
               #pv.build_system,
               #pv.build_cmd,
               #pv.build_target,
               #pv.build_dir,
               #pv.build_opt,
               #pv.config_cmd,
               #pv.config_opt,
               #pv.config_dir,
          from package p
         inner join package_version pv on p.package_uuid = pv.package_uuid
         where upper(pv.version_sharing_status) = 'PUBLIC'
          or ( upper(pv.version_sharing_status) = 'PROTECTED'
               and exists (select 1 from package_version_sharing pvs
                            where pvs.package_version_uuid = pv.package_version_uuid and pvs.project_uuid = project_uuid_in)
              );
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
drop PROCEDURE if exists list_pkgs_by_owner;
DELIMITER $$
CREATE PROCEDURE list_pkgs_by_owner (
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
        select p.package_uuid,
               p.name, p.description,
               (select pt.name from package_type pt where pt.package_type_id = p.package_type_id) as package_type
          from package p
         #inner join package_version pv on p.package_uuid = pv.package_uuid
         where p.package_owner_uuid = user_uuid_in;
        set return_string = 'SUCCESS';
      end;
    elseif ifnull(user_account_valid_flag,'N') != 'Y' THEN set return_string = 'ERROR: USER ACCOUNT NOT VALID';
    else set return_string = 'ERROR: UNSPECIFIED ERROR';
    end if;
END
$$
DELIMITER ;

####################################################
drop PROCEDURE if exists list_pkg_vers_by_owner;
DELIMITER $$
CREATE PROCEDURE list_pkg_vers_by_owner (
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
        select p.package_uuid,
               pv.package_version_uuid,
               p.name,
               (select pt.name from package_type pt where pt.package_type_id = p.package_type_id) as package_type,
               p.package_sharing_status,
               pv.version_sharing_status,
               pv.version_string,
               #pv.platform_id,
               pv.notes,
               pv.package_path,
               pv.checksum,
               pv.source_path,
               pv.build_file,
               pv.build_system,
               pv.build_cmd,
               pv.build_target,
               pv.build_dir,
               pv.build_opt,
               pv.config_cmd,
               pv.config_opt,
               pv.config_dir,
               pv.create_date
          from package p
         inner join package_version pv on p.package_uuid = pv.package_uuid
         where p.package_owner_uuid = user_uuid_in;
        set return_string = 'SUCCESS';
      end;
    elseif ifnull(user_account_valid_flag,'N') != 'Y' THEN set return_string = 'ERROR: USER ACCOUNT NOT VALID';
    else set return_string = 'ERROR: UNSPECIFIED ERROR';
    end if;
END
$$
DELIMITER ;

####################################################
drop PROCEDURE if exists list_pkg_by_user;
DELIMITER $$
CREATE PROCEDURE list_pkg_by_user (
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
        select p2.name, p2.description, p2.package_uuid, pv2.version_string, pv2.package_version_uuid, pv2.comment_public, pv2.create_date version_create_date
        from
        (
        select p.package_uuid, max(pv.version_no) as version_no
          from package p
         inner join package_version pv on p.package_uuid = pv.package_uuid
         where p.package_owner_uuid = user_uuid_in # owner
            or upper(pv.version_sharing_status) = 'PUBLIC' # public
            or (upper(pv.version_sharing_status) = 'PROTECTED'
                and exists (select 1 from package_version_sharing pvs
                            inner join project.project_user pu on pu.project_uid = pvs.project_uuid
                            where pvs.package_version_uuid = pv.package_version_uuid
                              and pu.user_uid = user_uuid_in
                              and pu.delete_date is null
                              and (pu.expire_date > now() or pu.expire_date is null))
               )
        group by p.package_uuid
        ) as x
        inner join package p2 on x.package_uuid = p2.package_uuid
        inner join package_version pv2 on x.package_uuid = pv2.package_uuid and x.version_no = pv2.version_no;
        set return_string = 'SUCCESS';
      end;
    elseif ifnull(user_account_valid_flag,'N') != 'Y' THEN set return_string = 'ERROR: USER ACCOUNT NOT VALID';
    else set return_string = 'ERROR: UNSPECIFIED ERROR';
    end if;
END
$$
DELIMITER ;

####################################################
drop PROCEDURE if exists select_all_pub_pkgs_and_vers;
DELIMITER $$
CREATE PROCEDURE select_all_pub_pkgs_and_vers ()
  BEGIN
    select package.package_uuid,
           package_version.package_version_uuid,
           package.name as package_name,
           (select pt.name from package_type pt where pt.package_type_id = package.package_type_id) as package_type,
           package_version.version_sharing_status,
           package_version.version_string,
           package_version.platform_id,
           package_version.notes as public_version_comment,
           null as private_version_comment,
           package_version.package_path,
           package_version.checksum,
           package_version.source_path,
           package_version.build_file,
           package_version.build_system,
           package_version.build_cmd,
           package_version.build_target,
           package_version.build_dir,
           package_version.build_opt,
           package_version.config_cmd,
           package_version.config_opt,
           package_version.config_dir,
           package_version.bytecode_class_path,
           package_version.bytecode_aux_class_path,
           package_version.bytecode_source_path
      from package
     inner join package_version on package.package_uuid = package_version.package_uuid;
END
$$
DELIMITER ;

####################################################
drop PROCEDURE if exists select_pkg_version;
DELIMITER $$
CREATE PROCEDURE select_pkg_version (
    IN package_version_uuid_in VARCHAR(45)
)
  BEGIN
    select package.package_uuid,
           package_version.package_version_uuid,
           package.name as package_name,
           (select pt.name from package_type pt where pt.package_type_id = package.package_type_id) as package_type,
           package_version.version_sharing_status,
           package_version.version_string,
           package_version.platform_id,
           package_version.notes as public_version_comment,
           null as private_version_comment,
           package_version.package_path,
           package_version.checksum,
           package_version.source_path,
           package_version.build_file,
           package_version.build_system,
           package_version.build_cmd,
           package_version.build_target,
           package_version.build_dir,
           package_version.build_opt,
           package_version.config_cmd,
           package_version.config_opt,
           package_version.config_dir,
           package_version.bytecode_class_path,
           package_version.bytecode_aux_class_path,
           package_version.bytecode_source_path,
           package_version.android_sdk_target,
           package_version.android_redo_build
      from package
     inner join package_version on package.package_uuid = package_version.package_uuid
     where package_version.package_version_uuid = package_version_uuid_in;
END
$$
DELIMITER ;

####################################################
drop PROCEDURE if exists fetch_pkg_dependency;
DELIMITER $$
CREATE PROCEDURE fetch_pkg_dependency (
    IN package_version_uuid_in VARCHAR(45),
    IN platform_version_uuid_in VARCHAR(45),
    OUT dependency_found_flag CHAR(1),
    OUT dependency_list_out VARCHAR(8000)

)
  BEGIN
    select dependency_list
      into dependency_list_out
      from package_store.package_version_dependency
     where package_version_uuid = package_version_uuid_in
       and platform_version_uuid = platform_version_uuid_in;

    if dependency_list_out is null
    then set dependency_found_flag = 'N';
    else set dependency_found_flag = 'Y';
    end if;

END
$$
DELIMITER ;

####################################################
drop PROCEDURE if exists update_package_cksum;
DELIMITER $$
CREATE PROCEDURE update_package_cksum (
    IN package_version_uuid_in VARCHAR(45),
    IN checksum_in VARCHAR(200),
    OUT return_string varchar(100)
)
  BEGIN
    DECLARE row_count_int int;
    set return_string = 'ERROR';

    select count(1)
      into row_count_int
      from package_version
     where package_version_uuid = package_version_uuid_in;

   if row_count_int > 1 then
     set return_string = 'ERROR: TOO MANY ROWS';
   elseif row_count_int = 0 then
     set return_string = 'ERROR: NO RECORD FOUND';
   elseif row_count_int = 1 then
     BEGIN
       update package_version
          set checksum = checksum_in
        where package_version_uuid = package_version_uuid_in;
       commit;

       set return_string = 'SUCCESS';
     END;
   end if;
END
$$
DELIMITER ;

############################################
drop PROCEDURE if exists update_package_path;
DELIMITER $$
CREATE PROCEDURE update_package_path (
    IN package_version_uuid_in VARCHAR(45),
    IN path_in VARCHAR(200),
    OUT return_string varchar(100)
)
  BEGIN
    DECLARE row_count_int int;
    set return_string = 'ERROR';

    select count(1)
      into row_count_int
      from package_version
     where package_version_uuid = package_version_uuid_in;

   if row_count_int > 1 then
     set return_string = 'ERROR: TOO MANY ROWS';
   elseif row_count_int = 0 then
     set return_string = 'ERROR: NO RECORD FOUND';
   elseif row_count_int = 1 then
     BEGIN
       update package_version
          set package_path = path_in
        where package_version_uuid = package_version_uuid_in;
       commit;

       set return_string = 'SUCCESS';
     END;
   end if;
END
$$
DELIMITER ;

############################################
drop PROCEDURE if exists add_package_version;
DELIMITER $$
CREATE PROCEDURE add_package_version (
    IN package_version_uuid_in VARCHAR(45),
    IN package_path_in VARCHAR(200),
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

    set dir_name_only = substr(package_path_in,1,instr(package_path_in,'/')-1);  # directory name without file
    set incoming_dir = concat('/swamp/incoming/',dir_name_only);
    set dest_dir = concat('/swamp/store/SCAPackages/', dir_name_only);
    set dest_full_path = concat('/swamp/store/SCAPackages/',package_path_in);

    # check that there's one record
    select count(1)
      into test_count
     from package_version
     where package_version_uuid = package_version_uuid_in;

    # copy file
    set cmd1 = CONCAT('cp -r ', incoming_dir, ' ', dest_dir);
    set file_move_return_code = sys_exec(cmd1);

    # Note: no longer attempting to remove files from incoming_dir
    # There is a cron job that deletes them.

    # set permissions
    set cmd1 = null;
    set cmd1 = CONCAT('chmod -R 755 ', dest_dir);
    set chmod_return_code = sys_exec(cmd1);
    #insert into assessment.sys_exec_cmd_log (cmd, caller) values (cmd1, concat('upload new pkg: return code: ',chmod_return_code));

    # calculate checksum, parse until first space
    set cksum = sys_eval(concat('sha512sum ',dest_full_path));
    set cksum = substr(cksum,1,instr(cksum,' ')-1);

    if test_count != 1 then
      set return_status = 'ERROR', return_msg = 'Package version not found';
    elseif file_move_return_code != 0 then
      set return_status = 'ERROR', return_msg = 'Error moving package to storage';
    elseif chmod_return_code != 0 then
      set return_status = 'ERROR', return_msg = 'Error setting package permissions';
    elseif cksum is null then
      set return_status = 'ERROR', return_msg = 'Error calculating checksum';
    else
      begin
        update package_version
           set package_path = dest_full_path,
               checksum = cksum
         where package_version_uuid = package_version_uuid_in;
        set return_status = 'SUCCESS', return_msg = 'Package sucessfully moved to storage';
      end;
    end if;

END
$$
DELIMITER ;

drop PROCEDURE if exists store_package_version;
DELIMITER $$
############################################
CREATE PROCEDURE store_package_version (
    IN package_uuid_in VARCHAR(45),
    IN package_path_in VARCHAR(200),
    OUT package_path_out VARCHAR(200),
    OUT cksum_out VARCHAR(200),
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

    set dir_name_only = substr(package_path_in,1,instr(package_path_in,'/')-1);  # directory name without file
    set incoming_dir = concat('/swamp/incoming/',dir_name_only);
    set dest_dir = concat('/swamp/store/SCAPackages/', dir_name_only);
    set dest_full_path = concat('/swamp/store/SCAPackages/',package_path_in);

    # check that there's one parent package
    select count(1)
      into test_count
     from package
     where package_uuid = package_uuid_in;

    # copy file
    set cmd1 = CONCAT('cp -r ', incoming_dir, ' ', dest_dir);
    set file_move_return_code = sys_exec(cmd1);

    # Note: no longer attempting to remove files from incoming_dir
    # There is a cron job that deletes them.

    # set permissions
    set cmd1 = null;
    set cmd1 = CONCAT('chmod -R 755 ', dest_dir);
    set chmod_return_code = sys_exec(cmd1);
    #insert into assessment.sys_exec_cmd_log (cmd, caller) values (cmd1, concat('upload new pkg: return code: ',chmod_return_code));

    # calculate checksum, parse until first space
    set cksum = sys_eval(concat('sha512sum ',dest_full_path));
    set cksum = substr(cksum,1,instr(cksum,' ')-1);

    if test_count != 1 then
      set return_status = 'ERROR', return_msg = 'Package record not found';
    elseif file_move_return_code != 0 then
      set return_status = 'ERROR', return_msg = 'Error moving package to storage';
    elseif chmod_return_code != 0 then
      set return_status = 'ERROR', return_msg = 'Error setting package permissions';
    elseif cksum is null then
      set return_status = 'ERROR', return_msg = 'Error calculating checksum';
    else
      set package_path_out = dest_full_path,
          cksum_out = cksum,
          return_status = 'SUCCESS',
          return_msg = 'Package sucessfully moved to storage';
    end if;

END
$$
DELIMITER ;

drop PROCEDURE if exists download_package;
DELIMITER $$
############################################
CREATE PROCEDURE download_package (
    IN package_version_uuid_in VARCHAR(45),
    OUT return_url varchar(200),
    OUT return_success_flag char(1),
    OUT return_msg varchar(100)
  )
  BEGIN
    DECLARE row_count_int INT;
    DECLARE package_path_var VARCHAR(200);

    # verify exists 1 matching record
    select count(1)
      into row_count_int
     from package_version
     where package_version_uuid = package_version_uuid_in;

    if row_count_int = 1 then
      BEGIN
        # get file path
        select package_path
          into package_path_var
         from package_version
         where package_version_uuid = package_version_uuid_in;

        # call download procedure
        call assessment.download(package_path_var, return_url, return_success_flag, return_msg);

      END;
    else set return_success_flag = 'N', return_msg = 'ERROR: RECORD NOT FOUND';
    end if;

END
$$
DELIMITER ;

###################
## Grants

# 'web'@'%'
GRANT SELECT, INSERT, UPDATE, DELETE ON package_store.* TO 'web'@'%';
GRANT EXECUTE ON PROCEDURE package_store.add_package_version TO 'web'@'%';
GRANT EXECUTE ON PROCEDURE package_store.store_package_version TO 'web'@'%';
GRANT EXECUTE ON PROCEDURE package_store.list_pkgs_by_project_user TO 'web'@'%';
GRANT EXECUTE ON PROCEDURE package_store.list_protected_pkgs_by_project_user TO 'web'@'%';
GRANT EXECUTE ON PROCEDURE package_store.list_pkg_vers_by_project_user TO 'web'@'%';
GRANT EXECUTE ON PROCEDURE package_store.list_pkgs_by_owner TO 'web'@'%';
GRANT EXECUTE ON PROCEDURE package_store.list_pkg_vers_by_owner TO 'web'@'%';
GRANT EXECUTE ON PROCEDURE package_store.list_pkg_by_user TO 'web'@'%';

# 'java_agent'@'%'
GRANT EXECUTE ON PROCEDURE package_store.select_all_pub_pkgs_and_vers TO 'java_agent'@'%';
GRANT EXECUTE ON PROCEDURE package_store.select_pkg_version TO 'java_agent'@'%';
GRANT EXECUTE ON PROCEDURE package_store.fetch_pkg_dependency TO 'java_agent'@'%';
GRANT EXECUTE ON PROCEDURE package_store.update_package_cksum TO 'java_agent'@'%';
GRANT EXECUTE ON PROCEDURE package_store.update_package_path TO 'java_agent'@'%';

# 'java_agent'@'localhost'
GRANT EXECUTE ON PROCEDURE package_store.select_all_pub_pkgs_and_vers TO 'java_agent'@'localhost';
GRANT EXECUTE ON PROCEDURE package_store.select_pkg_version TO 'java_agent'@'localhost';
GRANT EXECUTE ON PROCEDURE package_store.fetch_pkg_dependency TO 'java_agent'@'localhost';
GRANT EXECUTE ON PROCEDURE package_store.update_package_cksum TO 'java_agent'@'localhost';
GRANT EXECUTE ON PROCEDURE package_store.update_package_path TO 'java_agent'@'localhost';

# 'java_agent'@'swa-csaper-dt-01.mirsam.org'
GRANT EXECUTE ON PROCEDURE package_store.select_all_pub_pkgs_and_vers TO 'java_agent'@'swa-csaper-dt-01.mirsam.org';
GRANT EXECUTE ON PROCEDURE package_store.select_pkg_version TO 'java_agent'@'swa-csaper-dt-01.mirsam.org';
GRANT EXECUTE ON PROCEDURE package_store.fetch_pkg_dependency TO 'java_agent'@'swa-csaper-dt-01.mirsam.org';
GRANT EXECUTE ON PROCEDURE package_store.update_package_cksum TO 'java_agent'@'swa-csaper-dt-01.mirsam.org';
GRANT EXECUTE ON PROCEDURE package_store.update_package_path TO 'java_agent'@'swa-csaper-dt-01.mirsam.org';
