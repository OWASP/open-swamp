# v1.10
use project;
drop PROCEDURE if exists upgrade_10;
DELIMITER $$
CREATE PROCEDURE upgrade_10 ()
  BEGIN
    declare script_version_no int;
    declare cur_db_version_no int;
    set script_version_no = 10;

    select max(database_version_no)
      into cur_db_version_no
      from project.database_version;

    if cur_db_version_no < script_version_no then
      begin

        # add linked account provider support, such as github
        CREATE TABLE project.linked_account_provider (
          linked_account_provider_code  VARCHAR(100) NOT NULL                        COMMENT 'linked account provider code',
          title                         VARCHAR(256)                                 COMMENT 'display name',
          description                   VARCHAR(2000)                                COMMENT 'description',
          enabled_flag                  tinyint(1) NOT NULL DEFAULT 1                COMMENT 'Is provider enabled: 0=false 1=true',
          create_user                   VARCHAR(50)                                  COMMENT 'db user that inserted record',
          create_date                   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'date record inserted',
          update_user                   VARCHAR(50)                                  COMMENT 'db user that last updated record',
          update_date                   TIMESTAMP NULL DEFAULT NULL                  COMMENT 'date record last updated',
          PRIMARY KEY (linked_account_provider_code)
         )COMMENT='linked account providers';

        CREATE TABLE project.linked_account (
          linked_account_id             INT  NOT NULL  AUTO_INCREMENT                COMMENT 'internal id',
          user_uid                      VARCHAR(45) NOT NULL                         COMMENT 'user uuid',
          linked_account_provider_code  VARCHAR(100) NOT NULL                        COMMENT 'linked account provider code',
          user_external_id              VARCHAR(1000)                                COMMENT 'user id in remote system',
          enabled_flag                  tinyint(1) NOT NULL DEFAULT 1                COMMENT 'Is provider enabled: 0=false 1=true',
          create_user                   VARCHAR(50)                                  COMMENT 'db user that inserted record',
          create_date                   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'date record inserted',
          update_user                   VARCHAR(50)                                  COMMENT 'db user that last updated record',
          update_date                   TIMESTAMP NULL DEFAULT NULL                  COMMENT 'date record last updated',
          PRIMARY KEY (linked_account_id),
            CONSTRAINT fk_linked_account FOREIGN KEY (linked_account_provider_code) REFERENCES linked_account_provider (linked_account_provider_code)
         )COMMENT='linked accounts';

        # create user_event table
        CREATE TABLE project.user_event (
          user_event_id             INT  NOT NULL  AUTO_INCREMENT                COMMENT 'internal id',
          user_uid                  VARCHAR(45)                                  COMMENT 'user uuid',
          event_type                VARCHAR(255)                                 COMMENT 'event type',
          value                     VARCHAR(8000)                                COMMENT 'event value',
          create_user               VARCHAR(25)                                  COMMENT 'db user that inserted record',
          create_date               TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'date record inserted',
          update_user               VARCHAR(25)                                  COMMENT 'db user that last updated record',
          update_date               TIMESTAMP NULL DEFAULT NULL                  COMMENT 'date record last updated',
          PRIMARY KEY (user_event_id)
         )COMMENT='user events';

        # Add Github to linked_account_provider
        insert into project.linked_account_provider (linked_account_provider_code, title, description, enabled_flag, create_user, create_date)
               values ('github', 'GitHub', 'The GitHub git repository service.', 1, user(), now());

        # Add last url visited
        ALTER TABLE project.user_account
          ADD COLUMN last_url VARCHAR(1024) COMMENT 'last url visteded' AFTER promo_code_id;

        # insert ssh permission
        insert into project.permission (permission_code, title, description, admin_only_flag) values ('ssh-access', 'SSH Access', 'Log in to assessment virtual machines using SSH.', 1);

        # update database version number
        insert into project.database_version (database_version_no, description) values (script_version_no, 'upgrade');
        commit;
      end;
    end if;
END
$$
DELIMITER ;
