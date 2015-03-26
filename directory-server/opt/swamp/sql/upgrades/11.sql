# v1.11
use project;
drop PROCEDURE if exists upgrade_11;
DELIMITER $$
CREATE PROCEDURE upgrade_11 ()
  BEGIN
    declare script_version_no int;
    declare cur_db_version_no int;
    set script_version_no = 11;

    select max(database_version_no)
      into cur_db_version_no
      from project.database_version;

    if cur_db_version_no < script_version_no then
      begin

        # Add policy field
        ALTER TABLE project.permission
          ADD COLUMN policy VARCHAR(100000) COMMENT 'Use Policy or License Agreement' AFTER admin_only_flag;

        # populate policy
        update project.permission set policy = '<p>SWAMP users agree to this policy when accepting the Project Owner privilege, which enables users to create and own Projects. This policy is a supplement to the SWAMP Acceptable Use Policy that all SWAMP users agree to.</p>                  <h2>SWAMP Project Owner Policy</h2>          <p>As a SWAMP Project Owner, you are responsible for your SWAMP Project(s) and the activities that occur within your SWAMP Project(s). Your responsibilities include:</p>                  <ul>            <li>Maintaining an accurate Description of your Project in your SWAMP Project Profile.</li>            <li>Inviting only known colleagues to be Project Members and promptly removing Project Members who are no longer active colleagues.</li>            <li>Submitting Run Requests consistent with the goals of your Project as stated in your Project Description.</li>            <li>Periodically reviewing Run Requests submitted by Project Members for appropriate use of SWAMP resources.</li>            <li>Reporting any violations of the SWAMP Acceptable Use Policy by Project Members to the SWAMP Help Desk.</li>  </ul>'
        where permission_code = 'project-owner';

        # update database version number
        insert into project.database_version (database_version_no, description) values (script_version_no, 'upgrade');
        commit;
      end;
    end if;
END
$$
DELIMITER ;
