use project;
drop PROCEDURE if exists upgrade_1;
DELIMITER $$
CREATE PROCEDURE upgrade_1 ()
  BEGIN
    declare script_version_no int;
    declare cur_db_version_no int;
    set script_version_no = 1;

    select max(database_version_no)
      into cur_db_version_no
      from project.database_version;

    if cur_db_version_no < script_version_no then
      begin
        # Increase project description to 500
        alter table project change column description description VARCHAR(500) NULL DEFAULT NULL COMMENT 'description of project';

        # add create_date and delete_date to project_user
        # also remove unique constraint because now users might leave and re-join projects
        alter table project_user add column create_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'date user joined project';
        alter table project_user add column delete_date TIMESTAMP NULL DEFAULT NULL COMMENT 'date user left project';
        alter table project_user drop foreign key fk_project_user;
        alter table project_user drop index project_user_uc;
        alter table project_user add index project_user_idx (project_uid ASC);
        alter table project_user add constraint fk_project_user foreign key (project_uid)
          references project (project_uid) on delete cascade on update cascade;

        /*# Create Database Version Table
        CREATE TABLE database_version (
          database_version_id   INT  NOT NULL  AUTO_INCREMENT                COMMENT 'internal id',
          database_version_no   INT                                          COMMENT 'version number',
          description           VARCHAR(200)                                 COMMENT 'description',
          create_user           VARCHAR(50)                                  COMMENT 'db user that inserted record',
          create_date           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'date record inserted',
          update_user           VARCHAR(50)                                  COMMENT 'db user that last updated record',
          update_date           TIMESTAMP NULL DEFAULT NULL                  COMMENT 'date record last updated',
          PRIMARY KEY (database_version_id)
         )COMMENT='database version';
        */

        # update database version number
        insert into project.database_version (database_version_no, description) values (script_version_no, 'upgrade');
        commit;
      end;
    end if;
END
$$
DELIMITER ;
