# v1.09
use project;
drop PROCEDURE if exists upgrade_9;
DELIMITER $$
CREATE PROCEDURE upgrade_9 ()
  BEGIN
    declare script_version_no int;
    declare cur_db_version_no int;
    set script_version_no = 9;

    select max(database_version_no)
      into cur_db_version_no
      from project.database_version;

    if cur_db_version_no < script_version_no then
      begin

        # remove email column from password reset table
        alter table project.password_reset drop column email;

        # permissions table
        CREATE TABLE project.user_permission (
          user_permission_uid       VARCHAR(45) NOT NULL                         COMMENT 'internal id',
          user_uid                  VARCHAR(45) NOT NULL                         COMMENT 'user uuid',
          permission_code           VARCHAR(100) NOT NULL                        COMMENT 'permission being granted',
          user_comment              VARCHAR(8000)                                COMMENT 'why user is requesting permission',
          admin_comment             VARCHAR(8000)                                COMMENT 'why admin granted or denied permission',
          request_date              TIMESTAMP NULL DEFAULT NULL                  COMMENT 'date permission requested',
          grant_date                TIMESTAMP NULL DEFAULT NULL                  COMMENT 'date permission granted',
          denial_date               TIMESTAMP NULL DEFAULT NULL                  COMMENT 'date permission denied',
          expiration_date           TIMESTAMP NULL DEFAULT NULL                  COMMENT 'date permission expires',
          delete_date               TIMESTAMP NULL DEFAULT NULL                  COMMENT 'date permission revoked',
          create_user               VARCHAR(25)                                  COMMENT 'db user that inserted record',
          create_date               TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'date record inserted',
          update_user               VARCHAR(25)                                  COMMENT 'db user that last updated record',
          update_date               TIMESTAMP NULL DEFAULT NULL                  COMMENT 'date record last updated',
          PRIMARY KEY (user_permission_uid)
         )COMMENT='user permission info';

        CREATE TABLE project.permission (
          permission_code           VARCHAR(100) NOT NULL                        COMMENT 'permission code',
          title                     VARCHAR(100)                                 COMMENT 'display name',
          description               VARCHAR(200)                                 COMMENT 'explanation of permission',
          admin_only_flag           tinyint(1) NOT NULL DEFAULT 0                COMMENT 'Is visible to admins only: 0=false 1=true',
          create_user               VARCHAR(25)                                  COMMENT 'db user that inserted record',
          create_date               TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'date record inserted',
          update_user               VARCHAR(25)                                  COMMENT 'db user that last updated record',
          update_date               TIMESTAMP NULL DEFAULT NULL                  COMMENT 'date record last updated',
          PRIMARY KEY (permission_code)
         )COMMENT='lists all possible user permissions';

        # populate permission table
        insert into project.permission (permission_code, title, description, admin_only_flag) values ('project-owner', 'Project Ownership', 'Permission to create new Projects.', 0);
        insert into project.permission (permission_code, title, description, admin_only_flag) values ('dashboard-access', 'Admin Dasbhoard Access', 'Access to use the SWAMP Admin Dashboard.', 1);

        insert into project.user_permission (user_permission_uid, user_uid, permission_code, request_date, grant_date, expiration_date)
        select uuid(), user_uid, 'project-owner', now(), now(), date_add(now(), interval 1 YEAR)
        from project.user_account
        where owner_flag = 1;

        # bkup old permissions
        create table user_account_bkup_v109 as select * from user_account;
        create table owner_application_bkup_v109 as select * from owner_application;

        alter table project.user_account drop column owner_flag;
        drop table if exists project.owner_application;

        # update database version number
        insert into project.database_version (database_version_no, description) values (script_version_no, 'upgrade');
        commit;
      end;
    end if;
END
$$
DELIMITER ;
