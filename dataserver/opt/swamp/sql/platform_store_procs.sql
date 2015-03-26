use platform_store;

###################
## Triggers

DROP TRIGGER IF EXISTS platform_BINS;
DROP TRIGGER IF EXISTS platform_BUPD;
DROP TRIGGER IF EXISTS platform_version_BINS;
DROP TRIGGER IF EXISTS platform_version_BUPD;

DELIMITER $$

CREATE TRIGGER platform_BINS BEFORE INSERT ON platform FOR EACH ROW SET NEW.create_user = user(), NEW.create_date = now();
$$
#CREATE TRIGGER platform_BUPD BEFORE UPDATE ON platform FOR EACH ROW SET NEW.update_user = user(), NEW.update_date = now();
#$$
#CREATE TRIGGER platform_version_BINS BEFORE INSERT ON platform_version FOR EACH ROW SET NEW.create_user = user(), NEW.create_date = now();
#$$
CREATE TRIGGER platform_version_BUPD BEFORE UPDATE ON platform_version FOR EACH ROW SET NEW.update_user = user(), NEW.update_date = now();
$$

CREATE TRIGGER platform_version_BINS BEFORE INSERT ON platform_version FOR EACH ROW
  begin
    declare max_version_no INT;
    select max(version_no) into max_version_no
      from platform_version where platform_uuid = NEW.platform_uuid;
    set NEW.create_user = user(),
        NEW.create_date = now(),
        NEW.version_no = ifnull(max_version_no,0)+1;
  end;
$$

CREATE TRIGGER platform_BUPD BEFORE UPDATE ON platform FOR EACH ROW
  BEGIN
    SET NEW.update_user = user(),
        NEW.update_date = now();
    IF IFNULL(NEW.platform_owner_uuid,'') != IFNULL(OLD.platform_owner_uuid,'')
      THEN
        insert into platform_owner_history (platform_uuid, old_platform_owner_uuid, new_platform_owner_uuid)
        values (NEW.platform_uuid, OLD.platform_owner_uuid, NEW.platform_owner_uuid);
    END IF;
  END;
$$

DELIMITER ;

####################
## Stored Procedures

use platform_store;
    drop PROCEDURE if exists select_all_pub_platforms_and_vers;
    DELIMITER $$
    CREATE PROCEDURE select_all_pub_platforms_and_vers ()
      BEGIN
        select platform.platform_uuid,
               platform_version.platform_version_uuid,
               platform.name as platform_name,
               platform.platform_sharing_status,
               platform_version.version_string,
               platform_version.comment_public as public_version_comment,
               platform_version.comment_private as private_version_comment,
               platform_version.platform_path,
               platform_version.checksum,
               platform_version.invocation_cmd,
               platform_version.deployment_cmd
          from platform
         inner join platform_version on platform.platform_uuid = platform_version.platform_uuid
         where platform.platform_sharing_status = 'PUBLIC'
           and platform_version.release_date is not null;
    END
    $$
    DELIMITER ;
####################################################
    drop PROCEDURE if exists select_platform_version;
    DELIMITER $$
    CREATE PROCEDURE select_platform_version (
        IN platform_version_uuid_in VARCHAR(45)
    )
      BEGIN
        select platform.platform_uuid,
               platform_version.platform_version_uuid,
               platform.name as platform_name,
               platform.platform_sharing_status,
               platform_version.version_string,
               platform_version.comment_public as public_version_comment,
               platform_version.comment_private as private_version_comment,
               platform_version.platform_path,
               platform_version.checksum,
               platform_version.invocation_cmd,
               platform_version.deployment_cmd
          from platform
         inner join platform_version on platform.platform_uuid = platform_version.platform_uuid
         where platform_version.platform_version_uuid = platform_version_uuid_in;
    END
    $$
    DELIMITER ;

###################
## Grants

# 'web'@'%'
GRANT SELECT, INSERT, UPDATE, DELETE ON platform_store.* TO 'web'@'%';

# 'java_agent'@'%'
GRANT EXECUTE ON PROCEDURE platform_store.select_all_pub_platforms_and_vers TO 'java_agent'@'%';
GRANT EXECUTE ON PROCEDURE platform_store.select_platform_version TO 'java_agent'@'%';

# 'java_agent'@'localhost'
GRANT EXECUTE ON PROCEDURE platform_store.select_all_pub_platforms_and_vers TO 'java_agent'@'localhost';
GRANT EXECUTE ON PROCEDURE platform_store.select_platform_version TO 'java_agent'@'localhost';

# 'java_agent'@'swa-csaper-dt-01.mirsam.org'
GRANT EXECUTE ON PROCEDURE platform_store.select_all_pub_platforms_and_vers TO 'java_agent'@'swa-csaper-dt-01.mirsam.org';
GRANT EXECUTE ON PROCEDURE platform_store.select_platform_version TO 'java_agent'@'swa-csaper-dt-01.mirsam.org';
