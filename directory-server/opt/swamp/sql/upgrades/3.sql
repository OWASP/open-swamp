use project;
drop PROCEDURE if exists upgrade_3;
DELIMITER $$
CREATE PROCEDURE upgrade_3 ()
  BEGIN
    declare script_version_no int;
    declare cur_db_version_no int;
    set script_version_no = 3;

    select max(database_version_no)
      into cur_db_version_no
      from project.database_version;

    if cur_db_version_no < script_version_no then
      begin
        # Add user_account table
        CREATE TABLE project.user_account (
          user_uid                  VARCHAR(45)                                  COMMENT 'user uuid',
          owner_flag                tinyint(1) NOT NULL DEFAULT 0                COMMENT 'Is user an owner: 0=false 1=true',
          admin_flag                tinyint(1) NOT NULL DEFAULT 0                COMMENT 'Is user a sys admin: 0=false 1=true',
          ldap_profile_update_date  TIMESTAMP NULL DEFAULT NULL                  COMMENT 'date of last ldap profile update',
          ultimate_login_date       TIMESTAMP NULL DEFAULT NULL                  COMMENT 'date of most recent login',
          penultimate_login_date    TIMESTAMP NULL DEFAULT NULL                  COMMENT 'date of 2nd to last login',
          create_user               VARCHAR(25)                                  COMMENT 'db user that inserted record',
          create_date               TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'date record inserted',
          update_user               VARCHAR(25)                                  COMMENT 'db user that last updated record',
          update_date               TIMESTAMP NULL DEFAULT NULL                  COMMENT 'date record last updated',
          PRIMARY KEY (user_uid)
         )COMMENT='user account info';

        # Add owner_application table
        CREATE TABLE project.owner_application (
          # applications to become owner
          owner_application_id    INT  NOT NULL  AUTO_INCREMENT                COMMENT 'internal id',
          user_uid                VARCHAR(45)                                  COMMENT 'user uuid',
          accept_date             TIMESTAMP NULL DEFAULT NULL                  COMMENT 'date invitation accepted',
          decline_date            TIMESTAMP NULL DEFAULT NULL                  COMMENT 'date invitation declined',
          create_user             VARCHAR(25)                                  COMMENT 'db user that inserted record',
          create_date             TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'date record inserted',
          update_user             VARCHAR(25)                                  COMMENT 'db user that last updated record',
          update_date             TIMESTAMP NULL DEFAULT NULL                  COMMENT 'date record last updated',
          PRIMARY KEY (owner_application_id)
         ) COMMENT='Owner Applications';


        # update database version number
        insert into project.database_version (database_version_no, description) values (script_version_no, 'upgrade');
        commit;
      end;
    end if;
END
$$
DELIMITER ;
