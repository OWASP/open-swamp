# v1.12
use project;
drop PROCEDURE if exists upgrade_12;
DELIMITER $$
CREATE PROCEDURE upgrade_12 ()
  BEGIN
    declare script_version_no int;
    declare cur_db_version_no int;
    set script_version_no = 12;

    select max(database_version_no)
      into cur_db_version_no
      from project.database_version;

    if cur_db_version_no < script_version_no then
      begin

        # drop last url field
        ALTER TABLE project.user_account DROP COLUMN last_url;
        # Add meta_information to user permission table
        ALTER TABLE project.user_permission
          ADD COLUMN meta_information VARCHAR(8000) COMMENT 'user info specific to request' AFTER admin_comment;

        # Add policy_code to permission table and populate
        ALTER TABLE project.permission
          ADD COLUMN policy_code VARCHAR(100) COMMENT 'links to policy' AFTER admin_only_flag;
        update project.permission set policy_code = 'project-owner-policy' where permission_code = 'project-owner';

        # Expanded Permission Tables for Commercial Tools
        CREATE TABLE project.user_permission_project (
          user_permission_project_uid VARCHAR(45)  NOT NULL                        COMMENT 'internal id',
          user_permission_uid         VARCHAR(45)  NOT NULL                        COMMENT 'references user_permission table',
          project_uid                 VARCHAR(45)  NOT NULL                        COMMENT 'project to which user permission applies',
          create_user                 VARCHAR(25)                                  COMMENT 'db user that inserted record',
          create_date                 TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'date record inserted',
          update_user                 VARCHAR(25)                                  COMMENT 'db user that last updated record',
          update_date                 TIMESTAMP NULL DEFAULT NULL                  COMMENT 'date record last updated',
          PRIMARY KEY (user_permission_project_uid),
            CONSTRAINT fk_usr_prmssn_prjct FOREIGN KEY (user_permission_uid) REFERENCES user_permission (user_permission_uid) ON DELETE CASCADE ON UPDATE CASCADE,
            CONSTRAINT fk_usr_prmssn_prjct_to_prjct FOREIGN KEY (project_uid) REFERENCES project (project_uid) ON DELETE CASCADE ON UPDATE CASCADE
         )COMMENT='projects to which user permission applies';

        CREATE TABLE project.user_permission_package (
          user_permission_package_uid VARCHAR(45)  NOT NULL                        COMMENT 'internal id',
          user_permission_uid         VARCHAR(45)  NOT NULL                        COMMENT 'references user_permission table',
          package_uuid                VARCHAR(45)  NOT NULL                        COMMENT 'package to which user permission applies',
          create_user                 VARCHAR(25)                                  COMMENT 'db user that inserted record',
          create_date                 TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'date record inserted',
          update_user                 VARCHAR(25)                                  COMMENT 'db user that last updated record',
          update_date                 TIMESTAMP NULL DEFAULT NULL                  COMMENT 'date record last updated',
          PRIMARY KEY (user_permission_package_uid),
            CONSTRAINT fk_usr_prmssn_pkg FOREIGN KEY (user_permission_uid) REFERENCES user_permission (user_permission_uid) ON DELETE CASCADE ON UPDATE CASCADE
         )COMMENT='packages to which user permission applies';

        # new policy tables
        CREATE TABLE project.policy (
          policy_code               VARCHAR(100) NOT NULL                        COMMENT 'policy code',
          description               VARCHAR(200)                                 COMMENT 'explanation of policy',
          policy                    TEXT                                         COMMENT 'Use Policy or License Agreement',
          create_user               VARCHAR(25)                                  COMMENT 'db user that inserted record',
          create_date               TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'date record inserted',
          update_user               VARCHAR(25)                                  COMMENT 'db user that last updated record',
          update_date               TIMESTAMP NULL DEFAULT NULL                  COMMENT 'date record last updated',
          PRIMARY KEY (policy_code)
         )COMMENT='Use Policies or License Agreements';

        CREATE TABLE project.user_policy (
          user_policy_uid           VARCHAR(45) NOT NULL                         COMMENT 'internal id',
          user_uid                  VARCHAR(45) NOT NULL                         COMMENT 'user uuid',
          policy_code               VARCHAR(100) NOT NULL                        COMMENT 'policy code',
          accept_flag               tinyint(1)                                   COMMENT 'Did user accept or decline: 0=decline 1=accept',
          create_user               VARCHAR(25)                                  COMMENT 'db user that inserted record',
          create_date               TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'date record inserted',
          update_user               VARCHAR(25)                                  COMMENT 'db user that last updated record',
          update_date               TIMESTAMP NULL DEFAULT NULL                  COMMENT 'date record last updated',
          PRIMARY KEY (user_policy_uid)
         )COMMENT='user policy info';

        # insert Parasoft permission
        #insert into project.permission (permission_code, title, description, admin_only_flag) values ('parasoft-admin', 'Parasoft Admin', 'Parasoft Administrator', 1);
        insert into project.permission (permission_code, title, description, admin_only_flag, policy_code) values ('parasoft-user-c-test', 'Parasoft C-Test User', 'Parasoft C-Test User', 0, 'parasoft-user-c-test-policy');
        insert into project.permission (permission_code, title, description, admin_only_flag, policy_code) values ('parasoft-user-j-test', 'Parasoft J-Test User', 'Parasoft J-Test User', 0, 'parasoft-user-j-test-policy');

        # Insert Policies
        insert into project.policy (policy_code, description, create_user, policy)
          values ('project-owner-policy', 'Project Ownership Policy', user(),
                  CONCAT('<p>SWAMP users agree to this policy when accepting the Project Owner privilege, which enables users to create and own Projects. ',
                         'This policy is a supplement to the SWAMP Acceptable Use Policy that all SWAMP users agree to.</p> ',
                         '<h2>SWAMP Project Owner Policy</h2> ',
                         '<p>As a SWAMP Project Owner, you are responsible for your SWAMP Project(s) and the activities that occur within your SWAMP Project(s). Your responsibilities include:</p> ',
                         '<ul> ',
                         '<li>Maintaining an accurate Description of your Project in your SWAMP Project Profile.</li> ',
                         '<li>Inviting only known colleagues to be Project Members and promptly removing Project Members who are no longer active colleagues.</li> ',
                         '<li>Submitting Run Requests consistent with the goals of your Project as stated in your Project Description.</li> ',
                         '<li>Periodically reviewing Run Requests submitted by Project Members for appropriate use of SWAMP resources.</li>  ',
                         '<li>Reporting any violations of the SWAMP Acceptable Use Policy by Project Members to the SWAMP Help Desk.</li>  ',
                         '</ul>'));

        # insert Parasoft EULA into policy table - removed from this script because it was causing errors. Must be performed manually. It's over 30k

        # Remove policy field from permission table
        ALTER TABLE project.permission DROP COLUMN policy;

        # update database version number
        insert into project.database_version (database_version_no, description) values (script_version_no, 'upgrade');
        commit;
      end;
    end if;
END
$$
DELIMITER ;
