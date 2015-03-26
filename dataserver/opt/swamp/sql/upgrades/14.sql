use assessment;
drop PROCEDURE if exists upgrade_14;
DELIMITER $$
CREATE PROCEDURE upgrade_14 ()
  BEGIN
    declare script_version_no int;
    declare cur_db_version_no int;
    set script_version_no = 14;

    select max(database_version_no)
      into cur_db_version_no
      from assessment.database_version;

    if cur_db_version_no < script_version_no then
      begin
        # Add programming_language
        CREATE TABLE package_store.package_type (
          package_type_id         INT  NOT NULL  AUTO_INCREMENT                COMMENT 'internal id',
          name                    VARCHAR(50)                                  COMMENT 'display name',
          create_user             VARCHAR(50)                                  COMMENT 'db user that inserted record',
          create_date             TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'date record inserted',
          update_user             VARCHAR(50)                                  COMMENT 'db user that last updated record',
          update_date             TIMESTAMP NULL DEFAULT NULL                  COMMENT 'date record last updated',
          PRIMARY KEY (package_type_id)
         )COMMENT='package types';
         insert into package_store.package_type (name, create_user) values ('C/C++', user());
         insert into package_store.package_type (name, create_user) values ('Java Source Code', user());
         insert into package_store.package_type (name, create_user) values ('Java Bytecode', user());

        ALTER TABLE package_store.package ADD COLUMN package_type_id INT COMMENT 'package_type_id' AFTER name;

        # Remove Build_needed
        ALTER TABLE package_store.package_version DROP COLUMN build_needed;

        # Change spelling of Code Dx
        UPDATE `viewer_store`.`viewer` SET `name`='Code Dx' WHERE `viewer_uuid`='4221533e-865a-11e3-88bb-001a4a81450b';

        # tool platform_uuids
        UPDATE `tool_shed`.`tool_version` SET `platform_uuid`='00f3ff35-209c-11e3-9a3e-001a4a81450b' WHERE `tool_version_uuid`='ca207cf5-c3f6-a5bc-1718-9ea95387e8f6';
        UPDATE `tool_shed`.`tool_version` SET `platform_uuid`='a9cfe21f-209d-11e3-9a3e-001a4a81450b' WHERE `tool_version_uuid`='a766ae91-b36b-b228-df66-58f070d626cf';
        UPDATE `tool_shed`.`tool_version` SET `platform_uuid`='aebc38c3-209d-11e3-9a3e-001a4a81450b' WHERE `tool_version_uuid`='1d9a7a04-edb3-955d-9eb8-42e7a65448dd';
        UPDATE `tool_shed`.`tool_version` SET `platform_uuid`='051f9447-209e-11e3-9a3e-001a4a81450b' WHERE `tool_version_uuid`='0e4acecd-d303-827a-ea95-9dee2bf21aea';
        UPDATE `tool_shed`.`tool_version` SET `platform_uuid`='fc5737ef-09d7-11e3-a239-001a4a81450b' WHERE `tool_version_uuid`='589821f9-0f06-566c-4cf9-28b398349055';
        UPDATE `tool_shed`.`tool_version` SET `platform_uuid`='27f0588b-209e-11e3-9a3e-001a4a81450b' WHERE `tool_version_uuid`='a76e3fda-24e6-6a3d-6a3d-43fb1104677e';
        UPDATE `tool_shed`.`tool_version` SET `platform_uuid`='e16f4023-209d-11e3-9a3e-001a4a81450b' WHERE `tool_version_uuid`='2d7e943c-5ccf-d7be-d7ac-1d07ac9ddf7a';
        UPDATE `tool_shed`.`tool_version` SET `platform_uuid`='18f66e9a-20aa-11e3-9a3e-001a4a81450b' WHERE `tool_version_uuid`='3aba0096-eabb-4098-349b-315de5420c34';
        UPDATE `tool_shed`.`tool_version` SET `platform_uuid`='18f66e9a-20aa-11e3-9a3e-001a4a81450b' WHERE `tool_version_uuid`='c8dd853a-ad8f-fb12-3198-6a7e63451104';
        UPDATE `tool_shed`.`tool_version` SET `platform_uuid`='e16f4023-209d-11e3-9a3e-001a4a81450b' WHERE `tool_version_uuid`='22b04d64-1418-aad1-90d4-7f737ef2a5d7';
        UPDATE `tool_shed`.`tool_version` SET `platform_uuid`='27f0588b-209e-11e3-9a3e-001a4a81450b' WHERE `tool_version_uuid`='646b7dc7-55b1-5c75-c32e-788b24161704';
        UPDATE `tool_shed`.`tool_version` SET `platform_uuid`='fc5737ef-09d7-11e3-a239-001a4a81450b' WHERE `tool_version_uuid`='4fe637c9-7f44-5301-8466-b83fc47fa445';
        UPDATE `tool_shed`.`tool_version` SET `platform_uuid`='051f9447-209e-11e3-9a3e-001a4a81450b' WHERE `tool_version_uuid`='e430663e-7126-64fe-c834-2d4f21288f5e';
        UPDATE `tool_shed`.`tool_version` SET `platform_uuid`='aebc38c3-209d-11e3-9a3e-001a4a81450b' WHERE `tool_version_uuid`='eacba579-c789-c023-957f-1b7977ff96c8';
        UPDATE `tool_shed`.`tool_version` SET `platform_uuid`='a9cfe21f-209d-11e3-9a3e-001a4a81450b' WHERE `tool_version_uuid`='176af780-94fc-04a6-04ac-9c9363ab3d58';
        UPDATE `tool_shed`.`tool_version` SET `platform_uuid`='00f3ff35-209c-11e3-9a3e-001a4a81450b' WHERE `tool_version_uuid`='2f4b8bd4-0427-b597-a541-3fbd849c01eb';

        # update package_type_id for all UW pkgs
        UPDATE package_store.package SET package_type_id='1' WHERE package_uuid='04639acd-3a96-11e3-9a3e-001a4a81450b';
        UPDATE package_store.package SET package_type_id='1' WHERE package_uuid='08370453-462f-11e3-bb19-001a4a81450b';
        UPDATE package_store.package SET package_type_id='1' WHERE package_uuid='0a074530-3a95-11e3-9a3e-001a4a81450b';
        UPDATE package_store.package SET package_type_id='1' WHERE package_uuid='104fa6db-3a96-11e3-9a3e-001a4a81450b';
        UPDATE package_store.package SET package_type_id='1' WHERE package_uuid='15f33aec-3a95-11e3-9a3e-001a4a81450b';
        UPDATE package_store.package SET package_type_id='1' WHERE package_uuid='1c3bab59-3a96-11e3-9a3e-001a4a81450b';
        UPDATE package_store.package SET package_type_id='1' WHERE package_uuid='21df3e71-3a95-11e3-9a3e-001a4a81450b';
        UPDATE package_store.package SET package_type_id='1' WHERE package_uuid='26521aa7-4630-11e3-bb19-001a4a81450b';
        UPDATE package_store.package SET package_type_id='1' WHERE package_uuid='2827ae11-3a96-11e3-9a3e-001a4a81450b';
        UPDATE package_store.package SET package_type_id='1' WHERE package_uuid='2dcb4487-3a95-11e3-9a3e-001a4a81450b';
        UPDATE package_store.package SET package_type_id='1' WHERE package_uuid='3413bf87-3a96-11e3-9a3e-001a4a81450b';
        UPDATE package_store.package SET package_type_id='1' WHERE package_uuid='39b752ef-3a95-11e3-9a3e-001a4a81450b';
        UPDATE package_store.package SET package_type_id='1' WHERE package_uuid='3fffc1b5-3a96-11e3-9a3e-001a4a81450b';
        UPDATE package_store.package SET package_type_id='1' WHERE package_uuid='45a35643-3a95-11e3-9a3e-001a4a81450b';
        UPDATE package_store.package SET package_type_id='1' WHERE package_uuid='4bebc141-3a96-11e3-9a3e-001a4a81450b';
        UPDATE package_store.package SET package_type_id='1' WHERE package_uuid='4fbdba96-462f-11e3-bb19-001a4a81450b';
        UPDATE package_store.package SET package_type_id='1' WHERE package_uuid='518f5088-3a95-11e3-9a3e-001a4a81450b';
        UPDATE package_store.package SET package_type_id='2' WHERE package_uuid='51a04e34-36a8-11e3-9a3e-001a4a81450b';
        UPDATE package_store.package SET package_type_id='1' WHERE package_uuid='57d7cbb9-3a96-11e3-9a3e-001a4a81450b';
        UPDATE package_store.package SET package_type_id='1' WHERE package_uuid='5d7b4e83-3a95-11e3-9a3e-001a4a81450b';
        UPDATE package_store.package SET package_type_id='2' WHERE package_uuid='5feddee6-36a7-11e3-9a3e-001a4a81450b';
        UPDATE package_store.package SET package_type_id='1' WHERE package_uuid='696750ac-3a95-11e3-9a3e-001a4a81450b';
        UPDATE package_store.package SET package_type_id='2' WHERE package_uuid='6def02f5-36a8-11e3-9a3e-001a4a81450b';
        UPDATE package_store.package SET package_type_id='1' WHERE package_uuid='7553506d-3a95-11e3-9a3e-001a4a81450b';
        UPDATE package_store.package SET package_type_id='2' WHERE package_uuid='798895d5-163c-11e3-b57a-001a4a81450b';
        UPDATE package_store.package SET package_type_id='2' WHERE package_uuid='79895618-163c-11e3-b57a-001a4a81450b';
        UPDATE package_store.package SET package_type_id='2' WHERE package_uuid='798a080b-163c-11e3-b57a-001a4a81450b';
        UPDATE package_store.package SET package_type_id='2' WHERE package_uuid='798ab3e9-163c-11e3-b57a-001a4a81450b';
        UPDATE package_store.package SET package_type_id='2' WHERE package_uuid='798b5e79-163c-11e3-b57a-001a4a81450b';
        UPDATE package_store.package SET package_type_id='2' WHERE package_uuid='798d508f-163c-11e3-b57a-001a4a81450b';
        UPDATE package_store.package SET package_type_id='2' WHERE package_uuid='798ea0e5-163c-11e3-b57a-001a4a81450b';
        UPDATE package_store.package SET package_type_id='2' WHERE package_uuid='799015e8-163c-11e3-b57a-001a4a81450b';
        UPDATE package_store.package SET package_type_id='2' WHERE package_uuid='799097b1-163c-11e3-b57a-001a4a81450b';
        UPDATE package_store.package SET package_type_id='2' WHERE package_uuid='79912510-163c-11e3-b57a-001a4a81450b';
        UPDATE package_store.package SET package_type_id='2' WHERE package_uuid='7991a5f9-163c-11e3-b57a-001a4a81450b';
        UPDATE package_store.package SET package_type_id='2' WHERE package_uuid='79922440-163c-11e3-b57a-001a4a81450b';
        UPDATE package_store.package SET package_type_id='2' WHERE package_uuid='7993a32d-163c-11e3-b57a-001a4a81450b';
        UPDATE package_store.package SET package_type_id='2' WHERE package_uuid='7994116b-163c-11e3-b57a-001a4a81450b';
        UPDATE package_store.package SET package_type_id='2' WHERE package_uuid='799482f5-163c-11e3-b57a-001a4a81450b';
        UPDATE package_store.package SET package_type_id='2' WHERE package_uuid='7994f39c-163c-11e3-b57a-001a4a81450b';
        UPDATE package_store.package SET package_type_id='2' WHERE package_uuid='7995655f-163c-11e3-b57a-001a4a81450b';
        UPDATE package_store.package SET package_type_id='2' WHERE package_uuid='7995ce6f-163c-11e3-b57a-001a4a81450b';
        UPDATE package_store.package SET package_type_id='2' WHERE package_uuid='79964054-163c-11e3-b57a-001a4a81450b';
        UPDATE package_store.package SET package_type_id='2' WHERE package_uuid='79972c87-163c-11e3-b57a-001a4a81450b';
        UPDATE package_store.package SET package_type_id='2' WHERE package_uuid='799798e6-163c-11e3-b57a-001a4a81450b';
        UPDATE package_store.package SET package_type_id='2' WHERE package_uuid='79980c0a-163c-11e3-b57a-001a4a81450b';
        UPDATE package_store.package SET package_type_id='2' WHERE package_uuid='79987759-163c-11e3-b57a-001a4a81450b';
        UPDATE package_store.package SET package_type_id='1' WHERE package_uuid='813f49b0-3a95-11e3-9a3e-001a4a81450b';
        UPDATE package_store.package SET package_type_id='1' WHERE package_uuid='8d2b51bd-3a95-11e3-9a3e-001a4a81450b';
        UPDATE package_store.package SET package_type_id='1' WHERE package_uuid='97448788-462f-11e3-bb19-001a4a81450b';
        UPDATE package_store.package SET package_type_id='1' WHERE package_uuid='99174e06-3a95-11e3-9a3e-001a4a81450b';
        UPDATE package_store.package SET package_type_id='1' WHERE package_uuid='a3af7552-7e13-11e3-88bb-001a4a81450b';
        UPDATE package_store.package SET package_type_id='1' WHERE package_uuid='a503497a-3a95-11e3-9a3e-001a4a81450b';
        UPDATE package_store.package SET package_type_id='1' WHERE package_uuid='aaa73d65-3a94-11e3-9a3e-001a4a81450b';
        UPDATE package_store.package SET package_type_id='1' WHERE package_uuid='b0ef4b1f-3a95-11e3-9a3e-001a4a81450b';
        UPDATE package_store.package SET package_type_id='2' WHERE package_uuid='b584532d-8a27-11e3-88bb-001a4a81450b';
        UPDATE package_store.package SET package_type_id='2' WHERE package_uuid='b65e7bdb-8a27-11e3-88bb-001a4a81450b';
        UPDATE package_store.package SET package_type_id='1' WHERE package_uuid='b69331f3-3a94-11e3-9a3e-001a4a81450b';
        UPDATE package_store.package SET package_type_id='1' WHERE package_uuid='b69a3a60-3a8f-11e3-9a3e-001a4a81450b';
        UPDATE package_store.package SET package_type_id='2' WHERE package_uuid='b72ccdc1-8a27-11e3-88bb-001a4a81450b';
        UPDATE package_store.package SET package_type_id='2' WHERE package_uuid='b8088017-8a27-11e3-88bb-001a4a81450b';
        UPDATE package_store.package SET package_type_id='2' WHERE package_uuid='b906458e-8a27-11e3-88bb-001a4a81450b';
        UPDATE package_store.package SET package_type_id='2' WHERE package_uuid='b9e0c4de-8a27-11e3-88bb-001a4a81450b';
        UPDATE package_store.package SET package_type_id='2' WHERE package_uuid='bac9c99c-8a27-11e3-88bb-001a4a81450b';
        UPDATE package_store.package SET package_type_id='2' WHERE package_uuid='bbac556e-8a27-11e3-88bb-001a4a81450b';
        UPDATE package_store.package SET package_type_id='1' WHERE package_uuid='bc8fc4d9-8a27-11e3-88bb-001a4a81450b';
        UPDATE package_store.package SET package_type_id='1' WHERE package_uuid='bc904d09-3a8f-11e3-9a3e-001a4a81450b';
        UPDATE package_store.package SET package_type_id='1' WHERE package_uuid='bcdb51ad-3a95-11e3-9a3e-001a4a81450b';
        UPDATE package_store.package SET package_type_id='2' WHERE package_uuid='bd6ab38e-8a27-11e3-88bb-001a4a81450b';
        UPDATE package_store.package SET package_type_id='2' WHERE package_uuid='be468a13-8a27-11e3-88bb-001a4a81450b';
        UPDATE package_store.package SET package_type_id='1' WHERE package_uuid='bf24bfb2-8a27-11e3-88bb-001a4a81450b';
        UPDATE package_store.package SET package_type_id='2' WHERE package_uuid='c00d7a12-8a27-11e3-88bb-001a4a81450b';
        UPDATE package_store.package SET package_type_id='1' WHERE package_uuid='c1bf3274-8a27-11e3-88bb-001a4a81450b';
        UPDATE package_store.package SET package_type_id='1' WHERE package_uuid='c27f36e3-3a94-11e3-9a3e-001a4a81450b';
        UPDATE package_store.package SET package_type_id='1' WHERE package_uuid='c2866a6a-3a8f-11e3-9a3e-001a4a81450b';
        UPDATE package_store.package SET package_type_id='1' WHERE package_uuid='c292c02e-8a27-11e3-88bb-001a4a81450b';
        UPDATE package_store.package SET package_type_id='2' WHERE package_uuid='c36dd4c3-8a27-11e3-88bb-001a4a81450b';
        UPDATE package_store.package SET package_type_id='1' WHERE package_uuid='c87c86e1-3a8f-11e3-9a3e-001a4a81450b';
        UPDATE package_store.package SET package_type_id='1' WHERE package_uuid='c8c76891-3a95-11e3-9a3e-001a4a81450b';
        UPDATE package_store.package SET package_type_id='1' WHERE package_uuid='ce6b425f-3a94-11e3-9a3e-001a4a81450b';
        UPDATE package_store.package SET package_type_id='1' WHERE package_uuid='ce72b606-3a8f-11e3-9a3e-001a4a81450b';
        UPDATE package_store.package SET package_type_id='1' WHERE package_uuid='d468dcdb-3a8f-11e3-9a3e-001a4a81450b';
        UPDATE package_store.package SET package_type_id='1' WHERE package_uuid='d4b370ba-3a95-11e3-9a3e-001a4a81450b';
        UPDATE package_store.package SET package_type_id='1' WHERE package_uuid='da575141-3a94-11e3-9a3e-001a4a81450b';
        UPDATE package_store.package SET package_type_id='1' WHERE package_uuid='da5f0709-3a8f-11e3-9a3e-001a4a81450b';
        UPDATE package_store.package SET package_type_id='1' WHERE package_uuid='decb516a-462f-11e3-bb19-001a4a81450b';
        UPDATE package_store.package SET package_type_id='1' WHERE package_uuid='e0553802-3a8f-11e3-9a3e-001a4a81450b';
        UPDATE package_store.package SET package_type_id='1' WHERE package_uuid='e09f7252-3a95-11e3-9a3e-001a4a81450b';
        UPDATE package_store.package SET package_type_id='1' WHERE package_uuid='e64344ad-3a94-11e3-9a3e-001a4a81450b';
        UPDATE package_store.package SET package_type_id='1' WHERE package_uuid='e64b4d39-3a8f-11e3-9a3e-001a4a81450b';
        UPDATE package_store.package SET package_type_id='1' WHERE package_uuid='ec417e55-3a8f-11e3-9a3e-001a4a81450b';
        UPDATE package_store.package SET package_type_id='1' WHERE package_uuid='ec8b76da-3a95-11e3-9a3e-001a4a81450b';
        UPDATE package_store.package SET package_type_id='1' WHERE package_uuid='f22f40d8-3a94-11e3-9a3e-001a4a81450b';
        UPDATE package_store.package SET package_type_id='1' WHERE package_uuid='f87787ca-3a95-11e3-9a3e-001a4a81450b';
        UPDATE package_store.package SET package_type_id='1' WHERE package_uuid='fe1b461a-3a94-11e3-9a3e-001a4a81450b';


        # update database version number
        insert into assessment.database_version (database_version_no, description) values (script_version_no, 'upgrade');

        commit;
      end;
    end if;
END
$$
DELIMITER ;
