docker run ${DEBUG:+-e DEBUG=1} -it --rm --net=host          \
     --name igprof-io                                        \
     ${IGPROF_IO_REDIS:+-e IGPROF_IO_REDIS=$IGPROF_IO_REDIS} \
     -v $PWD/data:/data                                      \
     ${DEBUG:+-v "$PWD":/usr/src/igprof-io}                  \
     igprof/igprof-io
