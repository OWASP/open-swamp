#
# HeartBit -- the HeartBeat Simulator Framework
#
# Copyright (C) 2014 Bolo -- Josef T. Burger
#
# All original work here is distributed via a BSD license terms.
# Basically you are free to use it and you can't take credit for it.
#

## RED == REDacted Heartbeat Simulator


RM=rm
MORE=more
WC=wc

## Use CC=gcc for testing coverity; it doesn't like CC=cc. 
CC=gcc
CC=cc

CFLAGS= -Wall -g -O3

OBJS=	red.o t1_red_lib.o s3_red_both.o
SRCS=	red.c t1_red_lib.c s3_red_both.c
HDRS=	red.h
XTRS=	SSL_COPYRIGHT Makefile README

FILES= $(SRCS) $(HDRS) $(XTRS)

## Where are the demo input packets stored?
INPUT_DIR= ./gen/
INPUT_DIR= ./inputs/


RED=./red

default: red

all: red

wc:
	$(WC) -l $(HDRS) $(SRCS)

red: $(OBJS)
	$(CC) $(CFLAGS) -o $@ $(OBJS)
	

$(OBJS): red.h

clean:
	$(RM) -f $(RED) *.o

clean-all clean_all: clean
	$(MAKE) -C gen clean

go: run

run: $(RED)
	@echo ===== OUTPUT WILL BE VERBOSE =====
	@echo ===== Pipe output to a pager for best results ====
	@echo =====
	@echo ===== sleeping for 5 to give you a chance
	@echo =====
	sleep 5
	@echo =====
	@echo ===== Valid HeartBeat ====
	@echo =====
	$(RED) <$(INPUT_DIR)/heartbeat
	@echo =====
	@echo ===== Small HeartBleed Example ====
	@echo =====
	$(RED) <$(INPUT_DIR)/heartbleed0
	@echo =====
	@echo ===== Larger HeartBleed Example ====
	@echo =====
	$(RED) <$(INPUT_DIR)/heartbleed1
	@echo =====
	@echo ===== 32k-is HeartBleed Example ====
	@echo =====
	$(RED) <$(INPUT_DIR)/heartbleed2
	@echo =====
	@echo ===== 64k-ish HeartBleed Example ====
	@echo =====
	$(RED) <$(INPUT_DIR)/heartbleed3


help:
	@echo ======
	@echo ====== redacted openssl simulator -- heartbit
	@echo ======
	@echo 
	@echo make	-- compile the simulator
	@echo
	@echo To run the simulator against a demonstration selection
	@echo of heartbeat and heartbleed packets:
	@echo
	@echo make run '|' more
	@echo
	@echo make wc	-- approximate line count of sources
	@echo
	@echo To run the simulator by hand
	@echo
	@echo ./red  '<'simulated_packet_file
	@echo
	@echo The demonstration input packets are in $(INPUT_DIR)
	@echo
	@echo To see how the demonstration packts are generated,
	@echo and to generate your own packets use the generator in ./gen/
	@echo cd to that directory and 'make help' for information.
