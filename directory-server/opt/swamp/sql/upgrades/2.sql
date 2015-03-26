use project;
drop PROCEDURE if exists upgrade_2;
DELIMITER $$
CREATE PROCEDURE upgrade_2 ()
  BEGIN
    declare script_version_no int;
    declare cur_db_version_no int;
    set script_version_no = 2;

    select max(database_version_no)
      into cur_db_version_no
      from project.database_version;

    if cur_db_version_no < script_version_no then
      begin
        # Make project_invitation fields not null
        ALTER TABLE project.project_invitation
          CHANGE COLUMN invitation_key invitation_key VARCHAR(100) NOT NULL COMMENT 'invitation key' ,
          CHANGE COLUMN email email VARCHAR(100) NOT NULL COMMENT 'email address' ,
          CHANGE COLUMN inviter_uid inviter_uid VARCHAR(45) NOT NULL COMMENT 'inviter user uuid' ;

        # update database version number
        insert into project.database_version (database_version_no, description) values (script_version_no, 'upgrade');
        commit;
      end;
    end if;
END
$$
DELIMITER ;
