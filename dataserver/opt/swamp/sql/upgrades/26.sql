use assessment;
drop PROCEDURE if exists upgrade_26;
DELIMITER $$
CREATE PROCEDURE upgrade_26 ()
  BEGIN
    declare script_version_no int;
    declare cur_db_version_no int;
    set script_version_no = 26;

    select max(database_version_no)
      into cur_db_version_no
      from assessment.database_version;

    if cur_db_version_no < script_version_no then
      begin

        # seperate 32 and 64 bit versions
        # RHEL
        insert into platform_store.platform (platform_uuid, name, platform_sharing_status) values ('d531f0f0-f273-11e3-8775-001a4a81450b', 'Red Hat Enterprise Linux 32-bit', 'PUBLIC');
        update platform_store.platform         set name = 'Red Hat Enterprise Linux 64-bit' where platform_uuid = 'fc55810b-09d7-11e3-a239-001a4a81450b';
        update platform_store.platform_version set platform_uuid = 'd531f0f0-f273-11e3-8775-001a4a81450b' where platform_version_uuid = '051f9447-209e-11e3-9a3e-001a4a81450b';
        update assessment.assessment_run       set platform_uuid = 'd531f0f0-f273-11e3-8775-001a4a81450b' where platform_version_uuid = '051f9447-209e-11e3-9a3e-001a4a81450b';
        update platform_store.platform_version set version_no = 1 where platform_version_uuid = 'fc5737ef-09d7-11e3-a239-001a4a81450b';

        # Scientific
        insert into platform_store.platform (platform_uuid, name, platform_sharing_status) values ('a4f024eb-f317-11e3-8775-001a4a81450b', 'Scientific Linux 32-bit', 'PUBLIC');
        update platform_store.platform         set name = 'Scientific Linux 64-bit' where platform_uuid = 'd95fcb5f-209d-11e3-9a3e-001a4a81450b';
        update platform_store.platform_version set platform_uuid = 'a4f024eb-f317-11e3-8775-001a4a81450b' where platform_version_uuid = '35bc77b9-7d3e-11e3-88bb-001a4a81450b';
        update assessment.assessment_run       set platform_uuid = 'a4f024eb-f317-11e3-8775-001a4a81450b' where platform_version_uuid = '35bc77b9-7d3e-11e3-88bb-001a4a81450b';
        update platform_store.platform_version set version_no = 1 where platform_version_uuid = '27f0588b-209e-11e3-9a3e-001a4a81450b';
        update platform_store.platform_version set version_no = 2 where platform_version_uuid = 'e16f4023-209d-11e3-9a3e-001a4a81450b';

        # update database version number
        insert into assessment.database_version (database_version_no, description) values (script_version_no, 'upgrade');

        commit;
      end;
    end if;
END
$$
DELIMITER ;
