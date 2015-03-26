# v1.17
use assessment;
drop PROCEDURE if exists upgrade_39;
DELIMITER $$
CREATE PROCEDURE upgrade_39 ()
  BEGIN
    declare script_version_no int;
    declare cur_db_version_no int;
    set script_version_no = 39;

    select max(database_version_no)
      into cur_db_version_no
      from assessment.database_version;

    if cur_db_version_no < script_version_no then
      begin

        # Package Owner
        # clean up test packages with null or non-existant package owner. Package versions, if any, will cascade delete.
        delete from package_store.package where package_owner_uuid is null or package_owner_uuid not in (select user_uid from project.user_account);
        # Don't allow nulls
        ALTER TABLE package_store.package MODIFY package_owner_uuid VARCHAR(45) NOT NULL COMMENT 'package owner uuid';
        # FK on package owner
        ALTER TABLE package_store.package
          ADD CONSTRAINT package_owner_fk FOREIGN KEY (package_owner_uuid) REFERENCES project.user_account (user_uid);

        # Assessment Result Weakness Count
        ALTER TABLE assessment.assessment_result ADD COLUMN weakness_cnt INT COMMENT 'count reported by framework' AFTER project_uuid;

        # Add FK to result table
        update assessment.assessment_result set execution_record_uuid = null where execution_record_uuid not in (select execution_record_uuid from execution_record);
        ALTER TABLE assessment.assessment_result ADD CONSTRAINT fk_assessment_result_exec FOREIGN KEY (execution_record_uuid) REFERENCES assessment.execution_record (execution_record_uuid) ON DELETE SET NULL ON UPDATE CASCADE;

        # Updated versions of PMD
        # 5.0.4
        update tool_shed.tool_version
           set tool_path = '/swamp/store/SCATools/pmd/pmd-5.0.4-3.tar.gz',
               checksum  = '512abb7fca94ea837f5d48e1f2f20f15266efb09d542050df50dffc1d9a15b4d8cad7e0cd9857ed2055ca55a5e348c028035cf8926c66dd611c876f21d74131b'
         where tool_version_uuid = '16414980-156e-11e3-a239-001a4a81450b';
        # 5.1.0
        update tool_shed.tool_version
           set tool_path = '/swamp/store/SCATools/pmd/pmd-5.1.0-3.tar.gz',
               checksum  = '26939f85f5140a805cbb6a73ff05ea63920e6a2fef16152d4e15098d70023ab8f727c4675e93671d15076bb725e4ebb9840418783e390e964bdf50900632bd68'
         where tool_version_uuid = 'a2d949ef-cb53-11e3-8775-001a4a81450b';

        # update database version number
        insert into assessment.database_version (database_version_no, description) values (script_version_no, 'upgrade to v1.17');

        commit;
      end;
    end if;
END
$$
DELIMITER ;
