# v1.16
use assessment;
drop PROCEDURE if exists upgrade_38;
DELIMITER $$
CREATE PROCEDURE upgrade_38 ()
  BEGIN
    declare script_version_no int;
    declare cur_db_version_no int;
    set script_version_no = 38;

    select max(database_version_no)
      into cur_db_version_no
      from assessment.database_version;

    if cur_db_version_no < script_version_no then
      begin

        # new tool_shed.tool_platform table
        drop table if exists tool_shed.tool_platform;
        CREATE TABLE tool_shed.tool_platform (
          tool_platform_id      INT  NOT NULL AUTO_INCREMENT                 COMMENT 'internal id',
          tool_uuid             VARCHAR(45)                                  COMMENT 'tool uuid',
          platform_uuid         VARCHAR(45)                                  COMMENT 'platform uuid',
          create_user           VARCHAR(50)                                  COMMENT 'db user that inserted record',
          create_date           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'date record inserted',
          update_user           VARCHAR(50)                                  COMMENT 'db user that last updated record',
          update_date           TIMESTAMP NULL DEFAULT NULL                  COMMENT 'date record last updated',
          PRIMARY KEY (tool_platform_id),
            CONSTRAINT fk_tool_platform_t FOREIGN KEY (tool_uuid) REFERENCES tool_shed.tool (tool_uuid) ON DELETE CASCADE ON UPDATE CASCADE,
            CONSTRAINT fk_tool_platform_p FOREIGN KEY (platform_uuid) REFERENCES platform_store.platform (platform_uuid) ON DELETE CASCADE ON UPDATE CASCADE
         )COMMENT='Lists tool platform compatibilities';

         # C tools work on all platforms except android
         insert into tool_shed.tool_platform (tool_uuid, platform_uuid) values ('163e5d8c-156e-11e3-a239-001a4a81450b', '1088c3ce-20aa-11e3-9a3e-001a4a81450b'); #cppcheck
         insert into tool_shed.tool_platform (tool_uuid, platform_uuid) values ('163e5d8c-156e-11e3-a239-001a4a81450b', '8a51ecea-209d-11e3-9a3e-001a4a81450b'); #cppcheck
         insert into tool_shed.tool_platform (tool_uuid, platform_uuid) values ('163e5d8c-156e-11e3-a239-001a4a81450b', 'a4f024eb-f317-11e3-8775-001a4a81450b'); #cppcheck
         insert into tool_shed.tool_platform (tool_uuid, platform_uuid) values ('163e5d8c-156e-11e3-a239-001a4a81450b', 'd531f0f0-f273-11e3-8775-001a4a81450b'); #cppcheck
         insert into tool_shed.tool_platform (tool_uuid, platform_uuid) values ('163e5d8c-156e-11e3-a239-001a4a81450b', 'd95fcb5f-209d-11e3-9a3e-001a4a81450b'); #cppcheck
         insert into tool_shed.tool_platform (tool_uuid, platform_uuid) values ('163e5d8c-156e-11e3-a239-001a4a81450b', 'ee2c1193-209b-11e3-9a3e-001a4a81450b'); #cppcheck
         insert into tool_shed.tool_platform (tool_uuid, platform_uuid) values ('163e5d8c-156e-11e3-a239-001a4a81450b', 'fc55810b-09d7-11e3-a239-001a4a81450b'); #cppcheck
         insert into tool_shed.tool_platform (tool_uuid, platform_uuid) values ('4bb2644d-6440-11e4-a282-001a4a81450b', '1088c3ce-20aa-11e3-9a3e-001a4a81450b'); #Parasoft C/C++test
         insert into tool_shed.tool_platform (tool_uuid, platform_uuid) values ('4bb2644d-6440-11e4-a282-001a4a81450b', '8a51ecea-209d-11e3-9a3e-001a4a81450b'); #Parasoft C/C++test
         insert into tool_shed.tool_platform (tool_uuid, platform_uuid) values ('4bb2644d-6440-11e4-a282-001a4a81450b', 'a4f024eb-f317-11e3-8775-001a4a81450b'); #Parasoft C/C++test
         insert into tool_shed.tool_platform (tool_uuid, platform_uuid) values ('4bb2644d-6440-11e4-a282-001a4a81450b', 'd531f0f0-f273-11e3-8775-001a4a81450b'); #Parasoft C/C++test
         insert into tool_shed.tool_platform (tool_uuid, platform_uuid) values ('4bb2644d-6440-11e4-a282-001a4a81450b', 'd95fcb5f-209d-11e3-9a3e-001a4a81450b'); #Parasoft C/C++test
         insert into tool_shed.tool_platform (tool_uuid, platform_uuid) values ('4bb2644d-6440-11e4-a282-001a4a81450b', 'ee2c1193-209b-11e3-9a3e-001a4a81450b'); #Parasoft C/C++test
         insert into tool_shed.tool_platform (tool_uuid, platform_uuid) values ('4bb2644d-6440-11e4-a282-001a4a81450b', 'fc55810b-09d7-11e3-a239-001a4a81450b'); #Parasoft C/C++test
         insert into tool_shed.tool_platform (tool_uuid, platform_uuid) values ('7A08B82D-3A3B-45CA-8644-105088741AF6', '1088c3ce-20aa-11e3-9a3e-001a4a81450b'); #GCC
         insert into tool_shed.tool_platform (tool_uuid, platform_uuid) values ('7A08B82D-3A3B-45CA-8644-105088741AF6', '8a51ecea-209d-11e3-9a3e-001a4a81450b'); #GCC
         insert into tool_shed.tool_platform (tool_uuid, platform_uuid) values ('7A08B82D-3A3B-45CA-8644-105088741AF6', 'a4f024eb-f317-11e3-8775-001a4a81450b'); #GCC
         insert into tool_shed.tool_platform (tool_uuid, platform_uuid) values ('7A08B82D-3A3B-45CA-8644-105088741AF6', 'd531f0f0-f273-11e3-8775-001a4a81450b'); #GCC
         insert into tool_shed.tool_platform (tool_uuid, platform_uuid) values ('7A08B82D-3A3B-45CA-8644-105088741AF6', 'd95fcb5f-209d-11e3-9a3e-001a4a81450b'); #GCC
         insert into tool_shed.tool_platform (tool_uuid, platform_uuid) values ('7A08B82D-3A3B-45CA-8644-105088741AF6', 'ee2c1193-209b-11e3-9a3e-001a4a81450b'); #GCC
         insert into tool_shed.tool_platform (tool_uuid, platform_uuid) values ('7A08B82D-3A3B-45CA-8644-105088741AF6', 'fc55810b-09d7-11e3-a239-001a4a81450b'); #GCC
         insert into tool_shed.tool_platform (tool_uuid, platform_uuid) values ('f212557c-3050-11e3-9a3e-001a4a81450b', '1088c3ce-20aa-11e3-9a3e-001a4a81450b'); #Clang Static Analyzer
         insert into tool_shed.tool_platform (tool_uuid, platform_uuid) values ('f212557c-3050-11e3-9a3e-001a4a81450b', '8a51ecea-209d-11e3-9a3e-001a4a81450b'); #Clang Static Analyzer
         insert into tool_shed.tool_platform (tool_uuid, platform_uuid) values ('f212557c-3050-11e3-9a3e-001a4a81450b', 'a4f024eb-f317-11e3-8775-001a4a81450b'); #Clang Static Analyzer
         insert into tool_shed.tool_platform (tool_uuid, platform_uuid) values ('f212557c-3050-11e3-9a3e-001a4a81450b', 'd531f0f0-f273-11e3-8775-001a4a81450b'); #Clang Static Analyzer
         insert into tool_shed.tool_platform (tool_uuid, platform_uuid) values ('f212557c-3050-11e3-9a3e-001a4a81450b', 'd95fcb5f-209d-11e3-9a3e-001a4a81450b'); #Clang Static Analyzer
         insert into tool_shed.tool_platform (tool_uuid, platform_uuid) values ('f212557c-3050-11e3-9a3e-001a4a81450b', 'ee2c1193-209b-11e3-9a3e-001a4a81450b'); #Clang Static Analyzer
         insert into tool_shed.tool_platform (tool_uuid, platform_uuid) values ('f212557c-3050-11e3-9a3e-001a4a81450b', 'fc55810b-09d7-11e3-a239-001a4a81450b'); #Clang Static Analyzer
         # Java only works on RHEL64 and Android
         insert into tool_shed.tool_platform (tool_uuid, platform_uuid) values ('163d56a7-156e-11e3-a239-001a4a81450b', 'fc55810b-09d7-11e3-a239-001a4a81450b'); #Findbugs
         insert into tool_shed.tool_platform (tool_uuid, platform_uuid) values ('163f2b01-156e-11e3-a239-001a4a81450b', 'fc55810b-09d7-11e3-a239-001a4a81450b'); #PMD
         insert into tool_shed.tool_platform (tool_uuid, platform_uuid) values ('56872C2E-1D78-4DB0-B976-83ACF5424C52', 'fc55810b-09d7-11e3-a239-001a4a81450b'); #error-prone
         insert into tool_shed.tool_platform (tool_uuid, platform_uuid) values ('6197a593-6440-11e4-a282-001a4a81450b', 'fc55810b-09d7-11e3-a239-001a4a81450b'); #Parasoft Jtest
         insert into tool_shed.tool_platform (tool_uuid, platform_uuid) values ('992A48A5-62EC-4EE9-8429-45BB94275A41', 'fc55810b-09d7-11e3-a239-001a4a81450b'); #checkstyle
         insert into tool_shed.tool_platform (tool_uuid, platform_uuid) values ('163d56a7-156e-11e3-a239-001a4a81450b', '48f9a9b0-976f-11e4-829b-001a4a81450b'); #Findbugs
         insert into tool_shed.tool_platform (tool_uuid, platform_uuid) values ('163f2b01-156e-11e3-a239-001a4a81450b', '48f9a9b0-976f-11e4-829b-001a4a81450b'); #PMD
         insert into tool_shed.tool_platform (tool_uuid, platform_uuid) values ('56872C2E-1D78-4DB0-B976-83ACF5424C52', '48f9a9b0-976f-11e4-829b-001a4a81450b'); #error-prone
         insert into tool_shed.tool_platform (tool_uuid, platform_uuid) values ('6197a593-6440-11e4-a282-001a4a81450b', '48f9a9b0-976f-11e4-829b-001a4a81450b'); #Parasoft Jtest
         insert into tool_shed.tool_platform (tool_uuid, platform_uuid) values ('992A48A5-62EC-4EE9-8429-45BB94275A41', '48f9a9b0-976f-11e4-829b-001a4a81450b'); #checkstyle
         # Python only works on Scientific 64
         insert into tool_shed.tool_platform (tool_uuid, platform_uuid) values ('0f668fb0-4421-11e4-a4f3-001a4a81450b', 'd95fcb5f-209d-11e3-9a3e-001a4a81450b'); #Pylint
         insert into tool_shed.tool_platform (tool_uuid, platform_uuid) values ('63695cd8-a73e-11e4-a335-001a4a81450b', 'd95fcb5f-209d-11e3-9a3e-001a4a81450b'); #Flake8
         insert into tool_shed.tool_platform (tool_uuid, platform_uuid) values ('7fbfa454-8f9f-11e4-829b-001a4a81450b', 'd95fcb5f-209d-11e3-9a3e-001a4a81450b'); #Bandit
         # Android only works on Android
         insert into tool_shed.tool_platform (tool_uuid, platform_uuid) values ('9289b560-8f8b-11e4-829b-001a4a81450b', '48f9a9b0-976f-11e4-829b-001a4a81450b'); #Android lint
         # Archie works on all platforms except android
         insert into tool_shed.tool_platform (tool_uuid, platform_uuid) values ('3491d5e3-c184-11e3-8775-001a4a81450b', '1088c3ce-20aa-11e3-9a3e-001a4a81450b'); #Archie
         insert into tool_shed.tool_platform (tool_uuid, platform_uuid) values ('3491d5e3-c184-11e3-8775-001a4a81450b', '8a51ecea-209d-11e3-9a3e-001a4a81450b'); #Archie
         insert into tool_shed.tool_platform (tool_uuid, platform_uuid) values ('3491d5e3-c184-11e3-8775-001a4a81450b', 'a4f024eb-f317-11e3-8775-001a4a81450b'); #Archie
         insert into tool_shed.tool_platform (tool_uuid, platform_uuid) values ('3491d5e3-c184-11e3-8775-001a4a81450b', 'd531f0f0-f273-11e3-8775-001a4a81450b'); #Archie
         insert into tool_shed.tool_platform (tool_uuid, platform_uuid) values ('3491d5e3-c184-11e3-8775-001a4a81450b', 'd95fcb5f-209d-11e3-9a3e-001a4a81450b'); #Archie
         insert into tool_shed.tool_platform (tool_uuid, platform_uuid) values ('3491d5e3-c184-11e3-8775-001a4a81450b', 'ee2c1193-209b-11e3-9a3e-001a4a81450b'); #Archie
         insert into tool_shed.tool_platform (tool_uuid, platform_uuid) values ('3491d5e3-c184-11e3-8775-001a4a81450b', 'fc55810b-09d7-11e3-a239-001a4a81450b'); #Archie

        # populate tool descriptions
        update tool_shed.tool set description = 'Android Lint is a static code analysis tool that checks Android project source files for potential bugs and optimization improvements for correctness, security, performance, usability, accessibility, and internationalization. <a href="http://tools.android.com/tips/lint">http://tools.android.com/tips/lint</a>' where tool_uuid = '9289b560-8f8b-11e4-829b-001a4a81450b';
        update tool_shed.tool set description = 'Bandit provides a framework for performing security analysis of Python source code. <a href="https://wiki.openstack.org/wiki/Security/Projects/Bandit">https://wiki.openstack.org/wiki/Security/Projects/Bandit</a>' where tool_uuid = '7fbfa454-8f9f-11e4-829b-001a4a81450b';
        update tool_shed.tool set description = 'Checkstyle is a development tool to help programmers write Java code that adheres to a coding standard. <a href="http://checkstyle.sourceforge.net/">http://checkstyle.sourceforge.net/</a>' where tool_uuid = '992A48A5-62EC-4EE9-8429-45BB94275A41';
        update tool_shed.tool set description = 'The Clang Static Analyzer is a source code analysis tool that finds bugs in C & C++. <a href="http://clang-analyzer.llvm.org/">http://clang-analyzer.llvm.org/</a>' where tool_uuid = 'f212557c-3050-11e3-9a3e-001a4a81450b';
        update tool_shed.tool set description = 'Cppcheck is a static analysis tool for C/C++ code. Unlike C/C++ compilers and many other analysis tools, it does not detect syntax errors in the code. Cppcheck primarily detects the types of bugs that the compilers normally do not detect. The goal is to detect only real errors in the code (i.e. have zero false positives). <a href="http://cppcheck.sourceforge.net/">http://cppcheck.sourceforge.net/</a>' where tool_uuid = '163e5d8c-156e-11e3-a239-001a4a81450b';
        update tool_shed.tool set description = 'Error-prone augments the compiler\'s type analysis to catch Java mistakes before they end up as bugs in production. <a href="http://errorprone.info/">http://errorprone.info/</a>' where tool_uuid = '56872C2E-1D78-4DB0-B976-83ACF5424C52';
        update tool_shed.tool set description = 'FindBugs is a program to find bugs in Java code. It looks for \"bug patterns\" - code instances that are likely to be errors. <a href="http://findbugs.sourceforge.net/">http://findbugs.sourceforge.net/</a>' where tool_uuid = '163d56a7-156e-11e3-a239-001a4a81450b';
        update tool_shed.tool set description = 'Flake8 is a Python tool that glues together pep8, pyflakes, mccabe, and third-party plugins to check the style and quality of Python code. <a href="https://gitlab.com/pycqa/flake8">https://gitlab.com/pycqa/flake8</a>' where tool_uuid = '63695cd8-a73e-11e4-a335-001a4a81450b';
        update tool_shed.tool set description = 'The GNU Compiler Collection includes front ends for C & C++. GCC was originally written as the compiler for the GNU operating system. <a href="https://gcc.gnu.org/">https://gcc.gnu.org/</a>' where tool_uuid = '7A08B82D-3A3B-45CA-8644-105088741AF6';
        update tool_shed.tool set description = 'Parasoft\'s C/C++test, a Development Testing solution for C and C++ based applications, automates a broad range of best practices proven to improve software development team productivity and software quality. <a href="http://www.parasoft.com/product/cpptest/">http://www.parasoft.com/product/cpptest/</a>' where tool_uuid = '4bb2644d-6440-11e4-a282-001a4a81450b';
        update tool_shed.tool set description = 'Parasoft\'s Jtest, a Development Testing solution for Java applications, automates a broad range of practices proven to improve development team productivity and software quality. <a href="http://www.parasoft.com/product/jtest/">http://www.parasoft.com/product/jtest/</a>' where tool_uuid = '6197a593-6440-11e4-a282-001a4a81450b';
        update tool_shed.tool set description = 'PMD is a Java source code analyzer. It finds common programming flaws like unused variables, empty catch blocks, and unnecessary object creation. <a href="http://pmd.sourceforge.net/">http://pmd.sourceforge.net/</a>' where tool_uuid = '163f2b01-156e-11e3-a239-001a4a81450b';
        update tool_shed.tool set description = 'Pylint is a tool that checks for errors in Python code, tries to enforce a coding standard, and looks for bad code smells. <a href="http://www.pylint.org/">http://www.pylint.org/</a>' where tool_uuid = '0f668fb0-4421-11e4-a4f3-001a4a81450b';

        # update database version number
        insert into assessment.database_version (database_version_no, description) values (script_version_no, 'upgrade to v1.16');

        commit;
      end;
    end if;
END
$$
DELIMITER ;
