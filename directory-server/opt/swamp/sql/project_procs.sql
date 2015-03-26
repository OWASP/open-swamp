use project;

####################
## Views
CREATE OR REPLACE VIEW project_events as
  select full_name, short_name,
         'created' as event_type,
         create_date as event_date,
         project_uid
    from project
  union
  select full_name, short_name,
         'revoked' as event_type,
         denial_date as event_date,
         project_uid
    from project
   where denial_date is not null
  union
  select full_name, short_name,
         'deleted' as event_type,
         deactivation_date as event_date,
         project_uid
    from project
   where deactivation_date is not null;

CREATE OR REPLACE VIEW personal_events as
  select user_uid, 'registered' as event_type,
         create_date as event_date
    from user_account
  union
  select user_uid, 'last_login' as event_type,
         penultimate_login_date as event_date
    from user_account where penultimate_login_date is not null
  union
  select user_uid, 'last_profile_update' as event_type,
         ldap_profile_update_date as event_date
    from user_account where ldap_profile_update_date is not null;

drop VIEW if exists project_invitation_events;

CREATE OR REPLACE VIEW user_project_events as
  select pu.user_uid, pu.create_date as event_date, 'Join' as event_type, p.project_uid
    from project.project_user pu inner join project.project p on p.project_uid = pu.project_uid
  union
  select pu.user_uid, pu.delete_date as event_date, 'Leave' as event_type, p.project_uid
    from project.project_user pu inner join project.project p on p.project_uid = pu.project_uid
   where pu.delete_date is not null or pu.expire_date < now();

###################
## Triggers
DROP TRIGGER IF EXISTS project_BUPD;
#DROP TRIGGER IF EXISTS project_BINS;
DROP TRIGGER IF EXISTS database_version_BINS;
DROP TRIGGER IF EXISTS database_version_BUPD;
DROP TRIGGER IF EXISTS user_account_BINS;
DROP TRIGGER IF EXISTS user_account_BUPD;
DROP TRIGGER IF EXISTS user_event_BINS;
DROP TRIGGER IF EXISTS user_event_BUPD;
DROP TRIGGER IF EXISTS permission_BINS;
DROP TRIGGER IF EXISTS permission_BUPD;
DROP TRIGGER IF EXISTS user_permission_BINS;
DROP TRIGGER IF EXISTS user_permission_BUPD;
DROP TRIGGER IF EXISTS user_permission_project_BINS;
DROP TRIGGER IF EXISTS user_permission_project_BUPD;
DROP TRIGGER IF EXISTS user_permission_package_BINS;
DROP TRIGGER IF EXISTS user_permission_package_BUPD;
DROP TRIGGER IF EXISTS policy_BINS;
DROP TRIGGER IF EXISTS policy_BUPD;
DROP TRIGGER IF EXISTS user_policy_BINS;
DROP TRIGGER IF EXISTS user_policy_BUPD;
DROP TRIGGER IF EXISTS promo_code_BINS;
DROP TRIGGER IF EXISTS promo_code_BUPD;
DROP TRIGGER IF EXISTS linked_account_provider_BINS;
DROP TRIGGER IF EXISTS linked_account_provider_BUPD;
DROP TRIGGER IF EXISTS linked_account_BINS;
DROP TRIGGER IF EXISTS linked_account_BUPD;

DELIMITER $$

CREATE TRIGGER project_BUPD BEFORE UPDATE ON project FOR EACH ROW
  BEGIN
    IF NEW.project_owner_uid != OLD.project_owner_uid
      THEN
        insert into project_owner_history (project_id, old_project_owner_uid, new_project_owner_uid)
        values (NEW.project_id, OLD.project_owner_uid, NEW.project_owner_uid);
    END IF;
  END;
$$

CREATE TRIGGER user_account_BINS BEFORE INSERT ON user_account FOR EACH ROW
  BEGIN
    DECLARE new_project_uuid_var VARCHAR(45);
    set new_project_uuid_var = uuid();
    SET NEW.create_user = user(), NEW.create_date = now();
    insert into project.project (project_uid, project_owner_uid, full_name, short_name, description, affiliation, trial_project_flag)
      values (new_project_uuid_var, NEW.user_uid, 'MyProject', 'MyProject', 'Starter project for running assessments.', null, 1);
    insert into project.project_user (project_uid, user_uid, membership_uid, admin_flag)
      values (new_project_uuid_var, NEW.user_uid, uuid(), 1);
  END;
$$


#CREATE TRIGGER project_BINS BEFORE INSERT ON project FOR EACH ROW SET NEW.accept_date = now();
#$$

CREATE TRIGGER database_version_BINS BEFORE INSERT ON database_version FOR EACH ROW SET NEW.create_user = user(), NEW.create_date = now();
$$
CREATE TRIGGER database_version_BUPD BEFORE UPDATE ON database_version FOR EACH ROW SET NEW.update_user = user(), NEW.update_date = now();
$$
#CREATE TRIGGER user_account_BINS BEFORE INSERT ON user_account FOR EACH ROW SET NEW.create_user = user(), NEW.create_date = now();
#$$
CREATE TRIGGER user_account_BUPD BEFORE UPDATE ON user_account FOR EACH ROW SET NEW.update_user = user(), NEW.update_date = now();
$$
CREATE TRIGGER user_event_BINS BEFORE INSERT ON user_event FOR EACH ROW SET NEW.create_user = user(), NEW.create_date = now();
$$
CREATE TRIGGER user_event_BUPD BEFORE UPDATE ON user_event FOR EACH ROW SET NEW.update_user = user(), NEW.update_date = now();
$$
CREATE TRIGGER permission_BINS BEFORE INSERT ON permission FOR EACH ROW SET NEW.create_user = user(), NEW.create_date = now();
$$
CREATE TRIGGER permission_BUPD BEFORE UPDATE ON permission FOR EACH ROW SET NEW.update_user = user(), NEW.update_date = now();
$$
CREATE TRIGGER user_permission_BINS BEFORE INSERT ON user_permission FOR EACH ROW SET NEW.create_user = user(), NEW.create_date = now(), NEW.request_date = now();
$$
CREATE TRIGGER user_permission_BUPD BEFORE UPDATE ON user_permission FOR EACH ROW SET NEW.update_user = user(), NEW.update_date = now();
$$
CREATE TRIGGER user_permission_project_BINS BEFORE INSERT ON user_permission_project FOR EACH ROW SET NEW.create_user = user(), NEW.create_date = now();
$$
CREATE TRIGGER user_permission_project_BUPD BEFORE UPDATE ON user_permission_project FOR EACH ROW SET NEW.update_user = user(), NEW.update_date = now();
$$
CREATE TRIGGER user_permission_package_BINS BEFORE INSERT ON user_permission_package FOR EACH ROW SET NEW.create_user = user(), NEW.create_date = now();
$$
CREATE TRIGGER user_permission_package_BUPD BEFORE UPDATE ON user_permission_package FOR EACH ROW SET NEW.update_user = user(), NEW.update_date = now();
$$
CREATE TRIGGER policy_BINS BEFORE INSERT ON policy FOR EACH ROW SET NEW.create_user = user(), NEW.create_date = now();
$$
CREATE TRIGGER policy_BUPD BEFORE UPDATE ON policy FOR EACH ROW SET NEW.update_user = user(), NEW.update_date = now();
$$
CREATE TRIGGER user_policy_BINS BEFORE INSERT ON user_policy FOR EACH ROW SET NEW.create_user = user(), NEW.create_date = now();
$$
CREATE TRIGGER user_policy_BUPD BEFORE UPDATE ON user_policy FOR EACH ROW SET NEW.update_user = user(), NEW.update_date = now();
$$
CREATE TRIGGER promo_code_BINS BEFORE INSERT ON promo_code FOR EACH ROW SET NEW.create_user = user(), NEW.create_date = now();
$$
CREATE TRIGGER promo_code_BUPD BEFORE UPDATE ON promo_code FOR EACH ROW SET NEW.update_user = user(), NEW.update_date = now();
$$
CREATE TRIGGER linked_account_provider_BINS BEFORE INSERT ON linked_account_provider FOR EACH ROW SET NEW.create_user = user(), NEW.create_date = now();
$$
CREATE TRIGGER linked_account_provider_BUPD BEFORE UPDATE ON linked_account_provider FOR EACH ROW SET NEW.update_user = user(), NEW.update_date = now();
$$
CREATE TRIGGER linked_account_BINS BEFORE INSERT ON linked_account FOR EACH ROW SET NEW.create_user = user(), NEW.create_date = now();
$$
CREATE TRIGGER linked_account_BUPD BEFORE UPDATE ON linked_account FOR EACH ROW SET NEW.update_user = user(), NEW.update_date = now();
$$

DELIMITER ;

####################################################
## Stored Procedures

####################################################
drop PROCEDURE if exists list_projects_by_member;
DELIMITER $$
CREATE PROCEDURE list_projects_by_member (
    IN user_uuid_in VARCHAR(45),
    OUT return_string varchar(100)
)
  BEGIN
    /*------------------------------------------
      Lists all projects of which the specifed user is a member (or owner.)
       - User must be enabled_flag in the user_account table.
       - User must be a current member of the project(s) listed in the project_user table.
           Note that this includes project owners.
       - Only lists active projects: not revoked or deactivated ones.
    /*------------------------------------------*/
    DECLARE user_account_valid_flag CHAR(1);

    # check user is valid in user_account table
    select distinct 'Y'
      into user_account_valid_flag
      from project.user_account
     where user_uid = user_uuid_in
       and enabled_flag = 1;

    if user_account_valid_flag = 'Y'
    then
      begin
        select p.project_uid,
               p.project_owner_uid,
               p.full_name,
               p.short_name,
               p.description,
               p.affiliation,
               p.create_date,
               p.denial_date,
               p.deactivation_date,
               pu.admin_flag
          from project p
         inner join project_user pu on p.project_uid = pu.project_uid
         where p.project_uid = pu.project_uid
           and pu.user_uid = user_uuid_in
           and pu.delete_date is null #user membership is active
           and (pu.expire_date > now() or pu.expire_date is null) #user membership is active
           and p.denial_date is null # project isn't revoked
           and p.deactivation_date is null; #project is active

        set return_string = 'SUCCESS';
      end;
    elseif ifnull(user_account_valid_flag,'N') != 'Y' THEN set return_string = 'ERROR: USER ACCOUNT NOT VALID';
    else set return_string = 'ERROR: UNSPECIFIED ERROR';
    end if;
END
$$
DELIMITER ;

drop PROCEDURE if exists list_projects_by_owner;
DELIMITER $$
CREATE PROCEDURE list_projects_by_owner (
    IN user_uuid_in VARCHAR(45),
    OUT return_string varchar(100)
)
  BEGIN
    /*------------------------------------------
      Lists all projects of which the specifed user is the owner.
       - User must be enabled_flag in the user_account table.
       - User must be the current owner of the project(s) listed in the project table.
       - Only lists active projects: not revoked or deactivated ones.
    /*------------------------------------------*/
    DECLARE user_account_valid_flag CHAR(1);

    # check user is valid in user_account table
    select distinct 'Y'
      into user_account_valid_flag
      from project.user_account
     where user_uid = user_uuid_in
       and enabled_flag = 1;

    if user_account_valid_flag = 'Y'
    then
      begin
        select p.project_uid,
               p.project_owner_uid,
               p.full_name,
               p.short_name,
               p.description,
               p.affiliation,
               p.create_date,
               p.denial_date,
               p.deactivation_date
          from project p
         where p.project_owner_uid = user_uuid_in
           and p.denial_date is null # project isn't revoked
           and p.deactivation_date is null; #project is active

        set return_string = 'SUCCESS';
      end;
    elseif ifnull(user_account_valid_flag,'N') != 'Y' THEN set return_string = 'ERROR: USER ACCOUNT NOT VALID';
    else set return_string = 'ERROR: UNSPECIFIED ERROR';
    end if;
END
$$
DELIMITER ;
drop PROCEDURE if exists deactivate_test_projects;
/*
DELIMITER $$
CREATE PROCEDURE deactivate_test_projects ()
  BEGIN
    # deactivate all test projects older than X days
    update project
       set deactivation_date = now()
     where trial_project_flag = 1
       and deactivation_date is null
       and create_date < CURDATE() - INTERVAL 14 DAY;
END
$$
DELIMITER ;
*/
drop PROCEDURE if exists remove_user_from_all_projects;
DELIMITER $$
CREATE PROCEDURE remove_user_from_all_projects (
    IN user_uuid_in VARCHAR(45),
    OUT return_string varchar(100)
)
  BEGIN
    update project.project_user
       set delete_date = now()
     where user_uid = user_uuid_in
       and delete_date is null;
    set return_string = 'SUCCESS';
END
$$
DELIMITER ;

###################
## Events
SET GLOBAL event_scheduler = ON;
/*
drop EVENT if exists deactivate_test_projects;
CREATE EVENT deactivate_test_projects
  ON SCHEDULE EVERY 12 HOUR
  #STARTS CURRENT_TIMESTAMP + 10 HOUR
  DO CALL project.deactivate_test_projects();
*/
###################
## Grants

# 'web'@'%'
GRANT SELECT, INSERT, UPDATE, DELETE ON project.* TO 'web'@'%';
GRANT EXECUTE ON PROCEDURE project.list_projects_by_member TO 'web'@'%';
GRANT EXECUTE ON PROCEDURE project.list_tools_by_owner TO 'web'@'%';
GRANT EXECUTE ON PROCEDURE project.remove_user_from_all_projects TO 'web'@'%';


# 'replication_user'@'%'
GRANT REPLICATION SLAVE ON *.* TO replication_user;
