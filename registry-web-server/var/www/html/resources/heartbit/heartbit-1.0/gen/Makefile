#
# HeartBeat Simulator Framework
#
# Copyright (C) 2014 Bolo -- Josef T. Burger
#

## RED == Redacted Heartbeat Simulator


RM=rm
MORE=more
WC=wc
DIFF=diff

CFLAGS= -Wall -g -O3 -I../

OBJS=	gen.o ../t1_red_lib.o ../s3_red_both.o
SRCS=	gen.c ../t1_red_lib.c ../s3_red_both.c
HDRS=	../red.h
XTRS=	Makefile

FILES= $(SRCS) $(HDRS) $(XTRS)

## Input Dir for the redacted openssl code -- heartbit
INPUT_DIR=../inputs

## Where to output the results too
OUTPUT_DIR=$(INPUT_DIR)
OUTPUT_DIR=.

GEN=./gen


default: gen

all: gen

wc:
	$(WC) -l $(HDRS) $(SRCS)

gen: $(OBJS)
	$(CC) $(CFLAGS) -o $@ $(OBJS)
	

$(OBJS): ../red.h

clean:
	$(RM) -f $(GEN) *.o
	$(RM) -f $(PACKETS)

## Only get rid of "test" versions here ... don't blow away other
## copies that were placed somewhere on purpose (such as inputs/)
PACKETS=	\
	heartbeat 	\
	heartbleed0 heartbleed1 heartbleed2 heartbleed3 \
	heartbleed-48k

regen: go

## Make a new set of default input files
replace:
	$(MAKE) OUTPUT_DIR="$(INPUT_DIR)"

go: run

run: $(GEN)
	@echo ===== Creating Heart Beat/Bleed Packets ======
	@echo =====
	@echo ===== Valid HeartBeat ====
	@echo =====
	$(GEN) > $(OUTPUT_DIR)/heartbeat
	@echo =====
	@echo ===== Small HeartBleed Example ====
	@echo =====
	$(GEN) -b >$(OUTPUT_DIR)/heartbleed0
	@echo =====
	@echo ===== Larger HeartBleed Example ====
	@echo =====
	$(GEN) -b -B >$(OUTPUT_DIR)/heartbleed1
	@echo =====
	@echo ===== 32k-ish HeartBleed Example ====
	@echo =====
	$(GEN) -b -B -B >$(OUTPUT_DIR)/heartbleed2
	@echo =====
	@echo ===== 64k-ish HeartBleed Example ====
	@echo =====
	$(GEN) -b -B -B -B  >$(OUTPUT_DIR)/heartbleed3
	@echo =====
	@echo ===== 48k-ish HeartBleed Example ====
	@echo =====
	$(GEN) -b -s 49142 >$(OUTPUT_DIR)/heartbleed-48k

diff: $(GEN)
	-$(DIFF) -cr $(INPUT_DIR) $(OUTPUT_DIR)

help:
	@echo =====
	@echo ===== Packet Generator For Redacted SSL Heartbit
	@echo =====
	@echo 
	@echo make -- build the packet generator
	@echo make wc -- line count of source files
	@echo make go -- generate new packets in the current directory
	@echo make diff -- diff generated packets against shipped packets
	@echo 
	@echo The heartbeat / heartbleed packets are in $(INPUT_DIR)
	@echo The location of the generated packets can be changed
	@echo by specifying a different OUTPUT_DIR as a make variable.
	@echo
	@echo The generation tool $(GEN) has options to customize packets.
	@echo The default is to generate a valid openssl heartbeat packet.
	@echo
	@echo The -b option makes a heartbleed packet.   Heartbleed packets
	@echo are created with as little content as possible to overwrite
	@echo the input buffer of the victim as little as possible, to allow
	@echo stealing the most data.
	@echo 
	@echo The -B option makes a heartbleed larger.  Repeated -B options
	@echo make the bleed longer -- check 'tls1_heartbleed()' in gen.c for
	@echo details.  Approximate details for a default bleed are an
	@echo 80 character line length, then read buffer size, 2x read buffers
	@echo then the full monty 64k.
	@echo 
	@echo The specific size of a heartbleed can be specified by
	@echo the -s size option.   This allows you to bleed any amount
	@echo up to 64k from the victim.  This over-rides any -B options.
	@echo
	@echo To generate a set of input files:
	@echo
	@echo mkdir ../myinputs
	@echo make OUTPUT_DIR=../myinputs regen
	@echo 
	@echo To generate a new set of default input files in $(INPUT_DIR):
	@echo
	@echo make replace
	@echo

