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
   where pu.delete_date is not null;

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

###################
## Grants

# 'web'@'%'
GRANT SELECT ON project.* TO 'web'@'%';
GRANT EXECUTE ON PROCEDURE project.list_projects_by_member TO 'web'@'%';
GRANT EXECUTE ON PROCEDURE project.list_tools_by_owner TO 'web'@'%';
