use project;
drop PROCEDURE if exists upgrade_4;
DELIMITER $$
CREATE PROCEDURE upgrade_4 ()
  BEGIN
    declare script_version_no int;
    declare cur_db_version_no int;
    set script_version_no = 4;

    select max(database_version_no)
      into cur_db_version_no
      from project.database_version;

    if cur_db_version_no < script_version_no then
      begin

        drop table if exists project.admins;

        # add enabled_flag
        ALTER TABLE project.user_account
          ADD COLUMN enabled_flag tinyint(1) NOT NULL DEFAULT 1 COMMENT 'Is account enabled: 0=false 1=true' AFTER user_uid;

        # add email verification field
        ALTER TABLE project.user_account
          ADD COLUMN email_verified_flag tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Is email verified: 0=false 1=true' AFTER admin_flag;

        # populate for users already verified
        update project.user_account
           set email_verified_flag = 1
          where user_uid in (select user_uid from project.email_verification where verify_date is not null);

        # update database version number
        insert into project.database_version (database_version_no, description) values (script_version_no, 'upgrade');
        commit;
      end;
    end if;
END
$$
DELIMITER ;
