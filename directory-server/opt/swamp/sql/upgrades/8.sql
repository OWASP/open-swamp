use project;
drop PROCEDURE if exists upgrade_8;
DELIMITER $$
CREATE PROCEDURE upgrade_8 ()
  BEGIN
    declare script_version_no int;
    declare cur_db_version_no int;
    set script_version_no = 8;

    select max(database_version_no)
      into cur_db_version_no
      from project.database_version;

    if cur_db_version_no < script_version_no then
      begin

        # Set default description for MyProject
        update project.project
           set description = 'Starter project for running assessments.'
          where trial_project_flag = 1
            and description is null;

        # Promo Code support
        CREATE TABLE project.promo_code (
          promo_code_id   INT  NOT NULL  AUTO_INCREMENT                COMMENT 'internal id',
          promo_code      VARCHAR(45)                                  COMMENT 'promo code',
          display_name    VARCHAR(45)                                  COMMENT 'display name',
          description     VARCHAR(200)                                 COMMENT 'description',
          expiration_date TIMESTAMP NULL DEFAULT NULL                  COMMENT 'date promo code expires',
          create_user     VARCHAR(50)                                  COMMENT 'db user that inserted record',
          create_date     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'date record inserted',
          update_user     VARCHAR(50)                                  COMMENT 'db user that last updated record',
          update_date     TIMESTAMP NULL DEFAULT NULL                  COMMENT 'date record last updated',
          PRIMARY KEY (promo_code_id)
         )COMMENT='promo_code';

        ALTER TABLE project.user_account
          ADD COLUMN promo_code_id INT COMMENT 'promo code id' AFTER penultimate_login_date;

        # update database version number
        insert into project.database_version (database_version_no, description) values (script_version_no, 'upgrade');
        commit;
      end;
    end if;
END
$$
DELIMITER ;
