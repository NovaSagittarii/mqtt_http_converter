include ./mosquitto/config.mk

.PHONY: all

CLIENT_PATH:=./mosquitto/client
CC:=${CC} -I./mosquitto -I./mosquitto/include -I${CLIENT_PATH}

ifeq ($(WITH_SHARED_LIBRARIES),yes)
SHARED_DEP:=mosquitto/lib/libmosquitto.so.${SOVERSION}
endif

ifeq ($(WITH_SHARED_LIBRARIES),yes)
ALL_DEPS:= mosquitto_sub
else
ifeq ($(WITH_STATIC_LIBRARIES),yes)
ALL_DEPS:= static_sub
endif
endif

all : ${ALL_DEPS}

basic : sub.c mosquitto/lib/libmosquitto.a
	${CROSS_COMPILE}${CC} $^ -o mosquitto_sub ${CLIENT_LDFLAGS} ${STATIC_LIB_DEPS} ${CLIENT_STATIC_LDADD}

curlpp_example : curlpp_example.cc
	c++ $^ -o curlpp_example -lcurlpp -lcurl

static_sub : sub_client.o sub_client_output.o client_props.o client_shared.o mosquitto/lib/libmosquitto.a
	${CROSS_COMPILE}${CC} $^ -o mosquitto_sub ${CLIENT_LDFLAGS} ${STATIC_LIB_DEPS} ${CLIENT_STATIC_LDADD}

mosquitto_sub : sub_client.o sub_client_output.o client_shared.o client_props.o
	${CROSS_COMPILE}${CC} $(CLIENT_LDFLAGS) $^ -o $@ $(CLIENT_LDADD)

mosquitto/lib/libmosquitto.so.${SOVERSION} :
	$(MAKE) -C ./mosquitto/lib

mosquitto/lib/libmosquitto.a :
	$(MAKE) -C ./mosquitto/lib libmosquitto.a

sub_client.o : sub_client.c ${SHARED_DEP}
	${CROSS_COMPILE}${CC} $(CLIENT_CPPFLAGS) $(CLIENT_CFLAGS) -c $< -o $@

sub_client_output.o : ${CLIENT_PATH}/sub_client_output.c ${CLIENT_PATH}/sub_client_output.h ${SHARED_DEP}
	${CROSS_COMPILE}${CC} $(CLIENT_CPPFLAGS) $(CLIENT_CFLAGS) -c $< -o $@

client_shared.o : ${CLIENT_PATH}/client_shared.c ${CLIENT_PATH}/client_shared.h
	${CROSS_COMPILE}${CC} $(CLIENT_CPPFLAGS) $(CLIENT_CFLAGS) -c $< -o $@

client_props.o : ${CLIENT_PATH}/client_props.c ${CLIENT_PATH}/client_shared.h
	${CROSS_COMPILE}${CC} $(CLIENT_CPPFLAGS) $(CLIENT_CFLAGS) -c $< -o $@

clean:
	rm *.o mosquitto_sub curlpp_example
