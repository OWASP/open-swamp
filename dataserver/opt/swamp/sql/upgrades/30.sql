# v1.09
use assessment;
drop PROCEDURE if exists upgrade_30;
DELIMITER $$
CREATE PROCEDURE upgrade_30 ()
  BEGIN
    declare script_version_no int;
    declare did_this_upgrade_run_flag int;
    set script_version_no = 30;

    select count(1)
      into did_this_upgrade_run_flag
      from assessment.database_version
      where database_version_no = script_version_no;

    if did_this_upgrade_run_flag = 0 then
      begin

        # Add description field to package
        ALTER TABLE package_store.package
          ADD COLUMN description VARCHAR(200) COMMENT 'package description' AFTER name;

        # rename package version public comment
        ALTER TABLE package_store.package_version
          CHANGE comment_public notes VARCHAR(200) COMMENT 'Comment visible to users.';

        # remove package version private comment
        alter table package_store.package_version drop column comment_private;

        # populate package description
        update package_store.package set description = 'The ASN.1 Compiler' where package_uuid = 'b69a3a60-3a8f-11e3-9a3e-001a4a81450b';
        update package_store.package set description = 'The Number One HTTP Server On The Internet' where package_uuid = '08370453-462f-11e3-bb19-001a4a81450b';
        update package_store.package set description = 'free, open source, cross-platform software for recording and editing sounds.' where package_uuid = '4fbdba96-462f-11e3-bb19-001a4a81450b';
        update package_store.package set description = 'finds regions of similarity between biological sequences.' where package_uuid = 'decb516a-462f-11e3-bb19-001a4a81450b';
        update package_store.package set description = 'A simple thread pool for C' where package_uuid = 'ce6b425f-3a94-11e3-9a3e-001a4a81450b';
        update package_store.package set description = 'The C Code Archive Network' where package_uuid = 'ce72b606-3a8f-11e3-9a3e-001a4a81450b';
        update package_store.package set description = 'enable large scale distributed computations to harness hundreds to thousands of machines from clusters, clouds, and grids' where package_uuid = 'd468dcdb-3a8f-11e3-9a3e-001a4a81450b';
        #update package_store.package set description = '' where package_uuid = 'a3af7552-7e13-11e3-88bb-001a4a81450b';
        update package_store.package set description = 'open source integration framework' where package_uuid = '798895d5-163c-11e3-b57a-001a4a81450b';
        update package_store.package set description = 'dynamic programming language' where package_uuid = '79895618-163c-11e3-b57a-001a4a81450b';
        update package_store.package set description = 'static analysis of C/C++ code' where package_uuid = 'aaa73d65-3a94-11e3-9a3e-001a4a81450b';
        update package_store.package set description = 'Distributed MultiThreaded CheckPointing' where package_uuid = 'e64344ad-3a94-11e3-9a3e-001a4a81450b';
        update package_store.package set description = 'Secure IMAP and POP3 server.' where package_uuid = 'f22f40d8-3a94-11e3-9a3e-001a4a81450b';
        update package_store.package set description = 'Open Source, Distributed, RESTful Search Engine' where package_uuid = '798a080b-163c-11e3-b57a-001a4a81450b';
        update package_store.package set description = 'The Encog Machine Learning Project for C/C++' where package_uuid = 'fe1b461a-3a94-11e3-9a3e-001a4a81450b';
        update package_store.package set description = 'open source implementation of the OSGi Release 4 core framework specification' where package_uuid = '798ab3e9-163c-11e3-b57a-001a4a81450b';
        update package_store.package set description = 'Acceptance Test Wiki' where package_uuid = '798b5e79-163c-11e3-b57a-001a4a81450b';
        update package_store.package set description = 'A Graph Traversal Language' where package_uuid = '798d508f-163c-11e3-b57a-001a4a81450b';
        update package_store.package set description = 'HTCondor is a specialized workload management system for compute-intensive jobs.' where package_uuid = 'bc8fc4d9-8a27-11e3-88bb-001a4a81450b';
        update package_store.package set description = 'Map Reduce and Distributed File System' where package_uuid = '798ea0e5-163c-11e3-b57a-001a4a81450b';
        update package_store.package set description = 'Open Source In-Memory Data Grid' where package_uuid = '799015e8-163c-11e3-b57a-001a4a81450b';
        update package_store.package set description = 'A programmer-oriented testing framework for Java.' where package_uuid = '79922440-163c-11e3-b57a-001a4a81450b';
        update package_store.package set description = 'A barebones WebSocket client and server implementation written in 100% Java.' where package_uuid = '799097b1-163c-11e3-b57a-001a4a81450b';
        update package_store.package set description = 'A blazingly small and sane redis java client' where package_uuid = '79912510-163c-11e3-b57a-001a4a81450b';
        update package_store.package set description = 'Continuous Integration server' where package_uuid = '7991a5f9-163c-11e3-b57a-001a4a81450b';
        update package_store.package set description = 'Jlint will check your Java code and find bugs, inconsistencies and synchronization problems by doing data flow analysis and building the lock graph' where package_uuid = 'e2bab004-9e2f-11e3-88bb-001a4a81450b';
        update package_store.package set description = 'provides Java-based indexing and search technology, as well as spellchecking, hit highlighting and advanced analysis/tokenization capabilities' where package_uuid = '51a04e34-36a8-11e3-9a3e-001a4a81450b';
        update package_store.package set description = 'java driver for mongo' where package_uuid = '7993a32d-163c-11e3-b57a-001a4a81450b';
        update package_store.package set description = 'MySQL Database Server' where package_uuid = '813f49b0-3a95-11e3-9a3e-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE023 (s01) - Relative Path Traversal' where package_uuid = '9595ac22-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE023 (s02) - Relative Path Traversal' where package_uuid = '9595b27f-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE036 (s01) - Absolute Path Traversal' where package_uuid = '9595b5f3-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE036 (s02) - Absolute Path Traversal' where package_uuid = '9595b6ef-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE078 (s01) - OS Command Injection' where package_uuid = '9595b7c8-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE078 (s02) - OS Command Injection' where package_uuid = '9595b899-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE078 (s03) - OS Command Injection' where package_uuid = '9595b969-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE078 (s04) - OS Command Injection' where package_uuid = '9595ba34-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE121 (s01) - Stack Based Buffer Overflow' where package_uuid = '9595bcc3-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE121 (s02) - Stack Based Buffer Overflow' where package_uuid = '9595bda7-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE121 (s03) - Stack Based Buffer Overflow' where package_uuid = '9595be78-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE121 (s04) - Stack Based Buffer Overflow' where package_uuid = '9595c238-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE121 (s05) - Stack Based Buffer Overflow' where package_uuid = '9595c374-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE121 (s06) - Stack Based Buffer Overflow' where package_uuid = '9595c62e-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE121 (s07) - Stack Based Buffer Overflow' where package_uuid = '9595c8ec-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE121 (s08) - Stack Based Buffer Overflow' where package_uuid = '9595cba8-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE121 (s09) - Stack Based Buffer Overflow' where package_uuid = '9595d1ac-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE122 (s01) - Heap Based Buffer Overflow' where package_uuid = '9595d31a-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE122 (s02) - Heap Based Buffer Overflow' where package_uuid = '9595d437-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE122 (s03) - Heap Based Buffer Overflow' where package_uuid = '9595d59b-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE122 (s04) - Heap Based Buffer Overflow' where package_uuid = '9595d730-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE122 (s05) - Heap Based Buffer Overflow' where package_uuid = '9595d857-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE122 (s06) - Heap Based Buffer Overflow' where package_uuid = '9595d968-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE122 (s07) - Heap Based Buffer Overflow' where package_uuid = '9595da7b-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE122 (s08) - Heap Based Buffer Overflow' where package_uuid = '9595db90-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE122 (s09) - Heap Based Buffer Overflow' where package_uuid = '9595dc9d-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE122 (s10) - Heap Based Buffer Overflow' where package_uuid = '9595ddb0-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE122 (s11) - Heap Based Buffer Overflow' where package_uuid = '9595debe-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE123 - Write What Where Condition' where package_uuid = '9595dfcf-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE124 (s01) - Buffer Underwrite' where package_uuid = '9595e0e0-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE124 (s02) - Buffer Underwrite' where package_uuid = '9595e1f2-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE124 (s03) - Buffer Underwrite' where package_uuid = '9595e303-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE126 (s01) - Buffer Overread' where package_uuid = '9595e412-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE126 (s02) - Buffer Overread' where package_uuid = '9595e520-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE127 (s01) - Buffer Underread' where package_uuid = '9595e62c-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE127 (s02) - Buffer Underread' where package_uuid = '9595e73c-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE127 (s03) - Buffer Underread' where package_uuid = '9595e90f-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE134 (s01) - Uncontrolled Format String' where package_uuid = '9595ea2b-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE134 (s02) - Uncontrolled Format String' where package_uuid = '9595eb41-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE134 (s03) - Uncontrolled Format String' where package_uuid = '9595ec52-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE188 - Reliance on Data Memory Layout' where package_uuid = '9595ed67-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE190 (s01) - Integer Overflow' where package_uuid = '9595ee3f-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE190 (s02) - Integer Overflow' where package_uuid = '9595ef0c-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE190 (s03) - Integer Overflow' where package_uuid = '9595efda-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE190 (s04) - Integer Overflow' where package_uuid = '9595f0a6-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE190 (s05) - Integer Overflow' where package_uuid = '9595f177-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE191 (s01) - Integer Underflow' where package_uuid = '9595f23f-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE191 (s02) - Integer Underflow' where package_uuid = '9595f30b-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE191 (s03) - Integer Underflow' where package_uuid = '9595f3d3-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE194 (s01) - Unexpected Sign Extension' where package_uuid = '9595f49b-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE194 (s02) - Unexpected Sign Extension' where package_uuid = '9595f56b-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE195 (s01) - Signed to Unsigned Conversion Error' where package_uuid = '9595f6a7-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE195 (s02) - Signed to Unsigned Conversion Error' where package_uuid = '9595f77f-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE196 - Unsigned to Signed Conversion Error' where package_uuid = '9595f84d-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE197 (s01) - Numeric Truncation Error' where package_uuid = '9595f914-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE197 (s02) - Numeric Truncation Error' where package_uuid = '9595f9e0-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE242 - Use of Inherently Dangerous Function' where package_uuid = '9595faa9-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE252 - Unchecked Return Value' where package_uuid = '9595fb72-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE253 - Incorrect Check of Function Return Value' where package_uuid = '9595fc79-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE364 - Signal Handler Race Condition' where package_uuid = '9595fdd4-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE366 - Race Condition Within Thread' where package_uuid = '9595febc-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE367 - TOC TOU' where package_uuid = '9595ff8c-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE369 (s01) - Divide by Zero' where package_uuid = '9596005e-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE369 (s02) - Divide by Zero' where package_uuid = '95960133-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE377 - Insecure Temporary File' where package_uuid = '9596023e-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE390 - Error Without Action' where package_uuid = '95960319-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE391 - Unchecked Error Condition' where package_uuid = '959603f6-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE396 - Catch Generic Exception' where package_uuid = '959604cd-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE397 - Throw Generic Exception' where package_uuid = '9596059b-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE398 - Poor Code Quality' where package_uuid = '9596066d-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE400 (s01) - Resource Exhaustion' where package_uuid = '95960992-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE400 (s02) - Resource Exhaustion' where package_uuid = '95960a7a-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE401 (s01) - Memory Leak' where package_uuid = '95960f93-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE401 (s02) - Memory Leak' where package_uuid = '959610b9-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE401 (s03) - Memory Leak' where package_uuid = '9596147e-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE404 - Improper Resource Shutdown' where package_uuid = '959615af-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE415 (s01) - Double Free' where package_uuid = '959618a1-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE415 (s02) - Double Free' where package_uuid = '95961a29-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE416 - Use After Free' where package_uuid = '95961e4b-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE426 - Untrusted Search Path' where package_uuid = '95962543-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE427 - Uncontrolled Search Path Element' where package_uuid = '95962698-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE440 - Expected Behavior Violation' where package_uuid = '9596277e-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE457 (s01) - Use of Uninitialized Variable' where package_uuid = '95962852-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE457 (s02) - Use of Uninitialized Variable' where package_uuid = '9596292e-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE459 - Incomplete Cleanup' where package_uuid = '95962a08-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE464 - Addition of Data Structure Sentinel' where package_uuid = '95962ae2-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE467 - Use of sizeof on Pointer Type' where package_uuid = '95962bbb-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE468 - Incorrect Pointer Scaling' where package_uuid = '95962c93-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE469 - Use of Pointer Subtraction to Determine Size' where package_uuid = '95962d6b-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE475 - Undefined Behavior for Input to API' where package_uuid = '95962e43-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE476 - NULL Pointer Dereference' where package_uuid = '95962f33-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE478 - Missing Default Case in Switch' where package_uuid = '9596300b-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE479 - Signal Handler Use of Non Reentrant Function' where package_uuid = '959630e3-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE480 - Use of Incorrect Operator' where package_uuid = '959631b7-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE481 - Assigning Instead of Comparing' where package_uuid = '9596328b-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE482 - Comparing Instead of Assigning' where package_uuid = '9596337b-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE483 - Incorrect Block Delimitation' where package_uuid = '95963455-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE484 - Omitted Break Statement in Switch' where package_uuid = '95963531-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE500 - Public Static Field Not Final' where package_uuid = '959636b9-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE506 - Embedded Malicious Code' where package_uuid = '959637a7-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE510 - Trapdoor' where package_uuid = '95963887-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE511 - Logic Time Bomb' where package_uuid = '9596395b-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE526 - Info Exposure Environment Variables' where package_uuid = '95963a33-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE546 - Suspicious Comment' where package_uuid = '95963b4a-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE561 - Dead Code' where package_uuid = '95963c24-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE562 - Return of Stack Variable Address' where package_uuid = '95963d00-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE563 - Unused Variable' where package_uuid = '95963dd5-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE570 - Expression Always False' where package_uuid = '95963eaf-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE571 - Expression Always True' where package_uuid = '95963fcb-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE587 - Assignment of Fixed Address to Pointer' where package_uuid = '959640a2-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE588 - Attempt to Access Child of Non Structure Pointer' where package_uuid = '9596417e-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE590 (s01) - Free Memory Not on Heap' where package_uuid = '95964253-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE590 (s02) - Free Memory Not on Heap' where package_uuid = '95964344-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE590 (s03) - Free Memory Not on Heap' where package_uuid = '9596447e-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE590 (s04) - Free Memory Not on Heap' where package_uuid = '9596456f-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE590 (s05) - Free Memory Not on Heap' where package_uuid = '95964647-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE605 - Multiple Binds Same Port' where package_uuid = '95964720-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE606 - Unchecked Loop Condition' where package_uuid = '959647fc-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE617 - Reachable Assertion' where package_uuid = '95964912-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE665 - Improper Initialization' where package_uuid = '959649fe-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE666 - Operation on Resource in Wrong Phase of Lifetime' where package_uuid = '95964ad7-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE667 - Improper Locking' where package_uuid = '95964bac-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE672 - Operation on Resource After Expiration or Release' where package_uuid = '95964e92-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE674 - Uncontrolled Recursion' where package_uuid = '95964f81-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE675 - Duplicate Operations on Resource' where package_uuid = '95965074-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE676 - Use of Potentially Dangerous Function' where package_uuid = '95965148-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE680 - Integer Overflow to Buffer Overflow' where package_uuid = '95965221-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE681 - Incorrect Conversion Between Numeric Types' where package_uuid = '959652f7-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE685 - Function Call With Incorrect Number of Arguments' where package_uuid = '959653c9-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE688 - Function Call With Incorrect Variable or Reference as Argument' where package_uuid = '959654b9-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE690 (s01) - NULL Deref From Return' where package_uuid = '95965590-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE690 (s02) - NULL Deref From Return' where package_uuid = '95965666-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE758 - Undefined Behavior' where package_uuid = '9596573f-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE761 - Free Pointer Not at Start of Buffer' where package_uuid = '95965821-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE762 (s01) - Mismatched Memory Management Routines' where package_uuid = '95965948-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE762 (s02) - Mismatched Memory Management Routines' where package_uuid = '95965a64-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE762 (s03) - Mismatched Memory Management Routines' where package_uuid = '95965bc2-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE762 (s04) - Mismatched Memory Management Routines' where package_uuid = '95965d8b-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE762 (s05) - Mismatched Memory Management Routines' where package_uuid = '95965eec-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE762 (s06) - Mismatched Memory Management Routines' where package_uuid = '95966014-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE762 (s07) - Mismatched Memory Management Routines' where package_uuid = '9596613c-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE773 - Missing Reference to Active File Descriptor or Handle' where package_uuid = '95966222-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE775 - Missing Release of File Descriptor or Handle' where package_uuid = '9596633c-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE789 (s01) - Uncontrolled Mem Alloc' where package_uuid = '95966415-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE789 (s02) - Uncontrolled Mem Alloc' where package_uuid = '959664ec-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE832 - Unlock of Resource That is Not Locked' where package_uuid = '959665be-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE835 - Infinite Loop' where package_uuid = '959666af-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for C/C++ CWE843 - Type Confusion' where package_uuid = '95966783-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE015 - External Control of System or Configuration Setting' where package_uuid = '9596685e-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE023 - Relative Path Traversal' where package_uuid = '95966938-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE036 - Absolute Path Traversal' where package_uuid = '95966a0d-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE078 - OS Command Injection' where package_uuid = '95966b39-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE080 (s01) - XSS' where package_uuid = '95966c2e-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE080 (s02) - XSS' where package_uuid = '95966d0f-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE081 - XSS Error Message' where package_uuid = '95966de4-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE083 - XSS Attribute' where package_uuid = '95966eb6-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE089 (s01) - SQL Injection' where package_uuid = '95966fa5-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE089 (s02) - SQL Injection' where package_uuid = '95967079-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE089 (s03) - SQL Injection' where package_uuid = '95967150-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE089 (s04) - SQL Injection' where package_uuid = '95967227-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE090 - LDAP Injection' where package_uuid = '959672f9-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE111 - Unsafe JNI' where package_uuid = '959673cf-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE113 (s01) - HTTP Response Splitting' where package_uuid = '959674a1-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE113 (s02) - HTTP Response Splitting' where package_uuid = '95967574-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE113 (s03) - HTTP Response Splitting' where package_uuid = '95967648-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE114 - Process Control' where package_uuid = '9596771b-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE129 (s01) - Improper Validation of Array Index' where package_uuid = '959677f3-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE129 (s02) - Improper Validation of Array Index' where package_uuid = '959678c7-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE129 (s03) - Improper Validation of Array Index' where package_uuid = '959679a0-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE129 (s04) - Improper Validation of Array Index' where package_uuid = '95967a75-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE129 (s05) - Improper Validation of Array Index' where package_uuid = '95967b49-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE134 (s01) - Uncontrolled Format String' where package_uuid = '95967c20-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE134 (s02) - Uncontrolled Format String' where package_uuid = '95967cf2-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE190 (s01) - Integer Overflow' where package_uuid = '95967e08-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE190 (s02) - Integer Overflow' where package_uuid = '95967edf-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE190 (s03) - Integer Overflow' where package_uuid = '95967fb0-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE190 (s04) - Integer Overflow' where package_uuid = '95968085-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE190 (s05) - Integer Overflow' where package_uuid = '9596815b-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE191 (s01) - Integer Underflow' where package_uuid = '95968231-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE191 (s02) - Integer Underflow' where package_uuid = '95968303-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE191 (s03) - Integer Underflow' where package_uuid = '95968630-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE193 - Off by One Error' where package_uuid = '9596873b-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE197 (s01) - Numeric Truncation Error' where package_uuid = '95968812-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE197 (s02) - Numeric Truncation Error' where package_uuid = '959688e7-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE197 (s03) - Numeric Truncation Error' where package_uuid = '959689c0-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE209 - Information Leak Error' where package_uuid = '95968a96-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE226 - Sensitive Information Uncleared Before Release' where package_uuid = '95968b70-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE248 - Uncaught Exception' where package_uuid = '95968c42-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE252 - Unchecked Return Value' where package_uuid = '95968d19-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE253 - Incorrect Check of Function Return Value' where package_uuid = '95968ded-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE256 - Plaintext Storage of Password' where package_uuid = '95968ec0-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE259 - Hard Coded Password' where package_uuid = '95968f97-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE315 - Plaintext Storage in Cookie' where package_uuid = '95969069-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE319 - Cleartext Tx Sensitive Info' where package_uuid = '9596913f-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE321 - Hard Coded Cryptographic Key' where package_uuid = '9596926f-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE325 - Missing Required Cryptographic Step' where package_uuid = '9596935f-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE327 - Use Broken Crypto' where package_uuid = '9596943c-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE328 - Reversible One Way Hash' where package_uuid = '9596950f-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE329 - Not Using Random IV with CBC Mode' where package_uuid = '959695e7-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE336 - Same Seed in PRNG' where package_uuid = '959696bd-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE338 - Weak PRNG' where package_uuid = '95969791-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE369 (s01) - Divide by Zero' where package_uuid = '9596986a-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE369 (s02) - Divide by Zero' where package_uuid = '95969947-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE369 (s03) - Divide by Zero' where package_uuid = '95969a28-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE369 (s04) - Divide by Zero' where package_uuid = '95969afb-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE378 - Temporary File Creation With Insecure Perms' where package_uuid = '95969bc7-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE379 - Temporary File Creation in Insecure Dir' where package_uuid = '95969c9a-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE382 - Use of System Exit' where package_uuid = '95969d69-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE383 - Direct Use of Threads' where package_uuid = '9596a029-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE390 - Error Without Action' where package_uuid = '9596a121-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE395 - Catch NullPointerException' where package_uuid = '9596a1fb-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE396 - Catch Generic Exception' where package_uuid = '9596a2d6-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE397 - Throw Generic' where package_uuid = '9596a3ac-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE398 - Poor Code Quality' where package_uuid = '9596a485-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE400 (s01) - Resource Exhaustion' where package_uuid = '9596a559-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE400 (s02) - Resource Exhaustion' where package_uuid = '9596a629-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE400 (s03) - Resource Exhaustion' where package_uuid = '9596a704-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE404 - Improper Resource Shutdown' where package_uuid = '9596a7d6-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE459 - Incomplete Cleanup' where package_uuid = '9596a8ad-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE470 - Unsafe Reflection' where package_uuid = '9596a983-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE476 - NULL Pointer Dereference' where package_uuid = '9596aa57-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE477 - Obsolete Functions' where package_uuid = '9596abd4-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE478 - Missing Default Case in Switch' where package_uuid = '9596acc9-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE481 - Assigning Instead of Comparing' where package_uuid = '9596ada6-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE482 - Comparing Instead of Assigning' where package_uuid = '9596ae80-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE483 - Incorrect Block Delimitation' where package_uuid = '9596af53-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE484 - Omitted Break Statement in Switch' where package_uuid = '9596b032-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE486 - Compare Classes by Name' where package_uuid = '9596b108-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE491 - Object Hijack' where package_uuid = '9596b1de-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE499 - Sensitive Data Serializable' where package_uuid = '9596b2b6-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE500 - Public Static Field Not Final' where package_uuid = '9596b38a-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE506 - Embedded Malicious Code' where package_uuid = '9596b46b-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE510 - Trapdoor' where package_uuid = '9596b540-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE511 - Logic Time Bomb' where package_uuid = '9596b615-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE523 - Unprotected Cred Transport' where package_uuid = '9596b6e9-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE526 - Info Exposure Environment Variables' where package_uuid = '9596b7ba-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE533 - Info Exposure Server Log' where package_uuid = '9596b894-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE534 - Info Exposure Debug Log' where package_uuid = '9596b9d3-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE535 - Info Exposure Shell Error' where package_uuid = '9596babf-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE539 - Information Exposure Through Persistent Cookie' where package_uuid = '9596bd8e-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE546 - Suspicious Comment' where package_uuid = '9596be81-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE549 - Missing Password Masking' where package_uuid = '9596bf5d-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE561 - Dead Code' where package_uuid = '9596c031-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE563 - Unused Variable' where package_uuid = '9596c107-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE566 - Authorization Bypass Through SQL Primary' where package_uuid = '9596c1e2-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE568 - Finalize Without Super' where package_uuid = '9596c2b7-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE570 - Expression Always False' where package_uuid = '9596c3cf-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE571 - Expression Always True' where package_uuid = '9596c4a1-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE572 - Call to Thread run Instead of start' where package_uuid = '9596c576-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE579 - Non Serializable in Session' where package_uuid = '9596c64c-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE580 - Clone Without Super' where package_uuid = '9596c71c-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE581 - Object Model Violation' where package_uuid = '9596c7f3-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE582 - Array Public Final Static' where package_uuid = '9596c8c6-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE584 - Return in Finally Block' where package_uuid = '9596c99b-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE585 - Empty Sync Block' where package_uuid = '9596ca72-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE586 - Explicit Call to Finalize' where package_uuid = '9596cb48-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE597 - Wrong Operator String Comparison' where package_uuid = '9596cc23-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE598 - Information Exposure QueryString' where package_uuid = '9596ccfb-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE600 - Uncaught Exception in Servlet' where package_uuid = '9596cdd2-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE601 - Open Redirect' where package_uuid = '9596cea9-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE605 - Multiple Binds Same Port' where package_uuid = '9596cf7c-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE606 - Unchecked Loop Condition' where package_uuid = '9596d057-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE607 - Public Static Final Mutable' where package_uuid = '9596d3ac-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE609 - Double Checked Locking' where package_uuid = '9596d4b7-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE613 - Insufficient Session Expiration' where package_uuid = '9596d591-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE614 - Sensitive Cookie Without Secure' where package_uuid = '9596d668-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE615 - Info Exposure by Comment' where package_uuid = '9596d746-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE617 - Reachable Assertion' where package_uuid = '9596d85c-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE643 - Xpath Injection' where package_uuid = '9596d932-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE667 - Improper Locking' where package_uuid = '9596da4a-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE674 - Uncontrolled Recursion' where package_uuid = '9596db20-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE681 - Incorrect Conversion Between Numeric Types' where package_uuid = '9596dc54-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE690 - NULL Deref From Return' where package_uuid = '9596dd2a-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE698 - Redirect Without Exit' where package_uuid = '9596de05-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE759 - Unsalted One Way Hash' where package_uuid = '9596dedf-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE760 - Predictable Salt One Way Hash' where package_uuid = '9596dfb2-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE764 - Multiple Locks' where package_uuid = '9596e311-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE765 - Multiple Unlocks' where package_uuid = '9596e40f-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE772 - Missing Release of Resource' where package_uuid = '9596e4ed-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE775 - Missing Release of File Descriptor or Handle' where package_uuid = '9596e5cc-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE789 (s01) - Uncontrolled Mem Alloc' where package_uuid = '9596e6a2-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE789 (s02) - Uncontrolled Mem Alloc' where package_uuid = '9596e77a-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE789 (s03) - Uncontrolled Mem Alloc' where package_uuid = '9596e84f-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE832 - Unlock Not Locked' where package_uuid = '9596e927-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE833 - Deadlock' where package_uuid = '9596ec12-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'NIST Juliet test suite for Java CWE835 - Infinite Loop' where package_uuid = '9596ed08-a61e-11e3-8775-001a4a81450b';
        update package_store.package set description = 'host/service/network monitoring program' where package_uuid = '8d2b51bd-3a95-11e3-9a3e-001a4a81450b';
        update package_store.package set description = 'An event-driven asynchronous network application framework' where package_uuid = '7994116b-163c-11e3-b57a-001a4a81450b';
        update package_store.package set description = 'Modern, powerful open source C++ class libraries and frameworks for building network- and internet-based applications that run on desktop, server, mobile and embedded systems.' where package_uuid = 'b0ef4b1f-3a95-11e3-9a3e-001a4a81450b';
        update package_store.package set description = 'Workflow Management System' where package_uuid = '799482f5-163c-11e3-b57a-001a4a81450b';
        update package_store.package set description = 'R is a free software environment for statistical computing and graphics.' where package_uuid = 'c292c02e-8a27-11e3-88bb-001a4a81450b';
        update package_store.package set description = 'AMQP client library for use with v2.0+ of the RabbitMQ broker.' where package_uuid = 'c8c76891-3a95-11e3-9a3e-001a4a81450b';
        update package_store.package set description = 'an opensource webapplication based issue tracking system' where package_uuid = '7994f39c-163c-11e3-b57a-001a4a81450b';
        update package_store.package set description = 'Simple OAuth library for Java' where package_uuid = '7995655f-163c-11e3-b57a-001a4a81450b';
        update package_store.package set description = 'web framework' where package_uuid = '7995ce6f-163c-11e3-b57a-001a4a81450b';
        update package_store.package set description = 'real-time distributed search engine built on Apache Solr and Apache Cassandra' where package_uuid = '79964054-163c-11e3-b57a-001a4a81450b';
        update package_store.package set description = 'high performance search server built using Lucene Core' where package_uuid = '6def02f5-36a8-11e3-9a3e-001a4a81450b';
        update package_store.package set description = 'A high performance Network IDS, IPS and Network Security Monitoring engine.' where package_uuid = '04639acd-3a96-11e3-9a3e-001a4a81450b';
        update package_store.package set description = 'A small, fast, lightweight virtual machine written in pure ANSI C.' where package_uuid = '1c3bab59-3a96-11e3-9a3e-001a4a81450b';
        update package_store.package set description = 'Distributed Graph Database' where package_uuid = '79972c87-163c-11e3-b57a-001a4a81450b';
        update package_store.package set description = 'an open-sourced, mavenized and Google App Engine safe Java library for the Twitter API' where package_uuid = '799798e6-163c-11e3-b57a-001a4a81450b';
        update package_store.package set description = 'Simple Unit Testing for C' where package_uuid = '3fffc1b5-3a96-11e3-9a3e-001a4a81450b';
        update package_store.package set description = 'VLC is a free and open source cross-platform multimedia player and framework that plays most multimedia files as well as DVD, Audio CD, VCD, and various streaming protocols.' where package_uuid = '26521aa7-4630-11e3-bb19-001a4a81450b';
        update package_store.package set description = 'free open-source templating engine' where package_uuid = '79980c0a-163c-11e3-b57a-001a4a81450b';
        update package_store.package set description = 'An open source clone of Amazon''s Dynamo.' where package_uuid = '79987759-163c-11e3-b57a-001a4a81450b';
        update package_store.package set description = 'Validate a Yubikey OTP against the Yubico online server.' where package_uuid = '57d7cbb9-3a96-11e3-9a3e-001a4a81450b';
        update package_store.package set description = 'Asterisk is an Open Source PBX and telephony toolkit.' where package_uuid = '97448788-462f-11e3-bb19-001a4a81450b';
        update package_store.package set description = 'Autopsy is a digital forensics platform and graphical interface to The Sleuth Kit and other digital forensics tools. (This is modified for testing in SWAMP environment)' where package_uuid = 'bac9c99c-8a27-11e3-88bb-001a4a81450b';
        update package_store.package set description = 'The BodgeIt Store is a vulnerable web application which is currently aimed at people who are new to pen testing.' where package_uuid = 'b584532d-8a27-11e3-88bb-001a4a81450b';
        update package_store.package set description = 'Network Security Monitor' where package_uuid = 'bc904d09-3a8f-11e3-9a3e-001a4a81450b';
        update package_store.package set description = 'Enterprise eCommerce framework based on Spring' where package_uuid = 'bbac556e-8a27-11e3-88bb-001a4a81450b';
        update package_store.package set description = 'Qiniu Resource (Cloud) Storage SDK' where package_uuid = 'c27f36e3-3a94-11e3-9a3e-001a4a81450b';
        update package_store.package set description = 'An ultra-lightweight, portable, single-file, simple-as-can-be ANSI-C compliant JSON parser, under MIT license.' where package_uuid = 'da5f0709-3a8f-11e3-9a3e-001a4a81450b';
        update package_store.package set description = 'An NBT file parser and manipulator library' where package_uuid = 'e0553802-3a8f-11e3-9a3e-001a4a81450b';
        update package_store.package set description = 'CLI Reddit client written in C. Oh, crossplatform too!' where package_uuid = 'b69331f3-3a94-11e3-9a3e-001a4a81450b';
        update package_store.package set description = 'use execve() with getenv() and the setting of a program in C.' where package_uuid = 'c2866a6a-3a8f-11e3-9a3e-001a4a81450b';
        update package_store.package set description = 'a simple C hashmap, using strings for the keys.' where package_uuid = 'c87c86e1-3a8f-11e3-9a3e-001a4a81450b';
        update package_store.package set description = 'Commander option parser ported to C' where package_uuid = 'e64b4d39-3a8f-11e3-9a3e-001a4a81450b';
        update package_store.package set description = 'A asymmetric coroutine library for C.' where package_uuid = 'ec417e55-3a8f-11e3-9a3e-001a4a81450b';
        update package_store.package set description = 'Snort dependency' where package_uuid = 'da575141-3a94-11e3-9a3e-001a4a81450b';
        update package_store.package set description = 'An open source, modular integration framework' where package_uuid = 'bd6ab38e-8a27-11e3-88bb-001a4a81450b';
        update package_store.package set description = 'The ESAPI Swingset INTERACTIVE is a web application which demonstrates common security vulnerabilities and asks users to secure the application against these vulnerabilities using the ESAPI library.' where package_uuid = 'b65e7bdb-8a27-11e3-88bb-001a4a81450b';
        update package_store.package set description = 'Not because it is good, but because we can...' where package_uuid = '0a074530-3a95-11e3-9a3e-001a4a81450b';
        update package_store.package set description = 'GeoIP C API' where package_uuid = '15f33aec-3a95-11e3-9a3e-001a4a81450b';
        update package_store.package set description = 'Minimalistic C client for Redis >= 1.2' where package_uuid = '21df3e71-3a95-11e3-9a3e-001a4a81450b';
        update package_store.package set description = 'JacORB is a free java implementation of the OMG''s CORBA standard.' where package_uuid = 'be468a13-8a27-11e3-88bb-001a4a81450b';
        update package_store.package set description = 'C library for encoding, decoding and manipulating JSON data' where package_uuid = '2dcb4487-3a95-11e3-9a3e-001a4a81450b';
        update package_store.package set description = 'Very low footprint JSON parser written in portable ANSI C' where package_uuid = '39b752ef-3a95-11e3-9a3e-001a4a81450b';
        update package_store.package set description = 'A C math library targeted at games' where package_uuid = '45a35643-3a95-11e3-9a3e-001a4a81450b';
        update package_store.package set description = 'Mail Framework for C Language' where package_uuid = '518f5088-3a95-11e3-9a3e-001a4a81450b';
        update package_store.package set description = 'a secure, fast, compliant and very flexible web-server' where package_uuid = '5d7b4e83-3a95-11e3-9a3e-001a4a81450b';
        update package_store.package set description = 'a multicore enabled coroutine library' where package_uuid = '696750ac-3a95-11e3-9a3e-001a4a81450b';
        update package_store.package set description = 'The Lua programming language' where package_uuid = '7553506d-3a95-11e3-9a3e-001a4a81450b';
        update package_store.package set description = 'Struts Forms vulnerable to Reflected Cross Site Scripting' where package_uuid = 'b72ccdc1-8a27-11e3-88bb-001a4a81450b';
        update package_store.package set description = 'a robust high performance CORBA ORB for C++ and Python.' where package_uuid = 'bf24bfb2-8a27-11e3-88bb-001a4a81450b';
        #update package_store.package set description = '' where package_uuid = 'c00d7a12-8a27-11e3-88bb-001a4a81450b';
        update package_store.package set description = 'The Open MPI Project is an open source MPI-2 implementation that is developed and maintained by a consortium of academic, research, and industry partners.' where package_uuid = 'c1bf3274-8a27-11e3-88bb-001a4a81450b';
        update package_store.package set description = 'OWASP 1-Liner is a deliberately vulnerable Java and JavaScript-based chat application.' where package_uuid = 'b8088017-8a27-11e3-88bb-001a4a81450b';
        update package_store.package set description = 'A protocol buffers library for C' where package_uuid = '99174e06-3a95-11e3-9a3e-001a4a81450b';
        update package_store.package set description = 'An implementation of markdown in C, using a PEG grammar' where package_uuid = 'a503497a-3a95-11e3-9a3e-001a4a81450b';
        update package_store.package set description = 'a powerful, open source object-relational database system' where package_uuid = 'bcdb51ad-3a95-11e3-9a3e-001a4a81450b';
        update package_store.package set description = 'C port of the snappy compressor' where package_uuid = 'd4b370ba-3a95-11e3-9a3e-001a4a81450b';
        update package_store.package set description = 'C port of Etsy''s statsd' where package_uuid = 'e09f7252-3a95-11e3-9a3e-001a4a81450b';
        update package_store.package set description = 'A C implementation of statsd' where package_uuid = 'ec8b76da-3a95-11e3-9a3e-001a4a81450b';
        update package_store.package set description = 'Standards compliant, fast, secure markdown processing library in C' where package_uuid = 'f87787ca-3a95-11e3-9a3e-001a4a81450b';
        update package_store.package set description = 'Text-mode interface for git' where package_uuid = '104fa6db-3a96-11e3-9a3e-001a4a81450b';
        update package_store.package set description = 'Command line lightweight todo tool with readable storage' where package_uuid = '2827ae11-3a96-11e3-9a3e-001a4a81450b';
        update package_store.package set description = 'Code beautifier' where package_uuid = '3413bf87-3a96-11e3-9a3e-001a4a81450b';
        update package_store.package set description = 'A vulnerable web application designed to help assessing the features, quality and accuracy of web application vulnerability scanners.' where package_uuid = 'b906458e-8a27-11e3-88bb-001a4a81450b';
        update package_store.package set description = 'WebGoat is a deliberately insecure J2EE web application designed to teach web application security concepts' where package_uuid = 'c36dd4c3-8a27-11e3-88bb-001a4a81450b';
        update package_store.package set description = 'Wireshark is the world''s foremost network protocol analyzer.' where package_uuid = '4bebc141-3a96-11e3-9a3e-001a4a81450b';
        update package_store.package set description = 'Yazd is an open-source (Apache License) discussion forum software that you can download customize and use. Yazd is a Java based forum software that can easily be configured through an admin interface.' where package_uuid = 'b9e0c4de-8a27-11e3-88bb-001a4a81450b';

        # clear notes field for curated packages
        update package_store.package_version set notes = null where package_uuid in (select package_uuid from package_store.package where package_owner_uuid = '80835e30-d527-11e2-8b8b-0800200c9a66');

        # Notification System
        DROP TRIGGER IF EXISTS assessment_result_AINS;
        ALTER TABLE assessment.assessment_run_request
          ADD COLUMN notify_when_complete_flag tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Notify user when run finishes: 0=false 1=true' AFTER user_uuid;
        ALTER TABLE assessment.execution_record
          ADD COLUMN notify_when_complete_flag tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Notify user when run finishes: 0=false 1=true' AFTER user_uuid;
        CREATE TABLE assessment.notification (
          notification_uuid       VARCHAR(45)  NOT NULL                        COMMENT 'group uuid',
          user_uuid               VARCHAR(45)                                  COMMENT 'recipient',
          notification_impetus    VARCHAR(100)                                 COMMENT 'eg Assessment result available',
          relevant_uuid           VARCHAR(45)                                  COMMENT 'eg assessment_result uuid of a-run',
          transmission_medium     VARCHAR(45)                                  COMMENT 'eg email, SMS',
          sent_date               TIMESTAMP NULL DEFAULT NULL                  COMMENT 'date msg sent',
          create_user             VARCHAR(25)                                  COMMENT 'db user that inserted record',
          create_date             TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'date record inserted',
          update_user             VARCHAR(25)                                  COMMENT 'db user that last updated record',
          update_date             TIMESTAMP NULL DEFAULT NULL                  COMMENT 'date record last updated',
          PRIMARY KEY (notification_uuid)
         )COMMENT='notifications';

        # Findbugs version 2.0.3 used to show: '2.0.3 (FindSecurityBugs 1.1.0)'
        update tool_shed.tool_version
           set version_string = '2.0.3 (FindSecurityBugs 1.2)'
         where tool_version_uuid = '4c1ec754-cb53-11e3-8775-001a4a81450b';

        # Track which results have been sent to viewer
        CREATE TABLE assessment.assessment_result_viewer_history (
          assessment_result_viewer_history_id  INT  NOT NULL  AUTO_INCREMENT                COMMENT 'internal id',
          assessment_result_uuid               VARCHAR(45) NOT NULL                         COMMENT 'assessment result uuid',
          viewer_instance_uuid                 VARCHAR(45) NOT NULL                         COMMENT 'viewer instance uuid',
          viewer_version_uuid                  VARCHAR(45)                                  COMMENT 'viewer version uuid',
          create_user                          VARCHAR(25)                                  COMMENT 'db user that inserted record',
          create_date                          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'date record inserted',
          update_user                          VARCHAR(25)                                  COMMENT 'db user that last updated record',
          update_date                          TIMESTAMP NULL DEFAULT NULL                  COMMENT 'date record last updated',
          PRIMARY KEY (assessment_result_viewer_history_id)
         )COMMENT='assessment result viewer history';

        # package dependencies
        CREATE TABLE package_store.package_version_dependency (
          package_version_dependency_id INT  NOT NULL  AUTO_INCREMENT       COMMENT 'internal id',
          package_version_uuid          VARCHAR(45)                         COMMENT 'pkg version uuid',
          platform_version_uuid         VARCHAR(45)                         COMMENT 'platform version uuid',
          dependency_list               VARCHAR(8000)                        COMMENT 'list of dependencies',
          create_user                   VARCHAR(25)                         COMMENT 'user that inserted record',
          create_date                   TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'date record inserted',
          update_user                   VARCHAR(25)                         COMMENT 'user that last updated record',
          update_date                   TIMESTAMP NULL DEFAULT NULL         COMMENT 'date record last changed',
          PRIMARY KEY (package_version_dependency_id)
          )COMMENT='Dependencies for given pkg on given platform';

        # update database version number
        insert into assessment.database_version (database_version_no, description) values (script_version_no, 'upgrade');

        commit;
      end;
    end if;
END
$$
DELIMITER ;
