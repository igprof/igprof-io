docker run ${DEBUG:+-e DEBUG=1} -it --rm --net=host --name igprof-io -v $PWD/data:/data ${DEBUG:+-v "$PWD":/usr/src/igprof-io} igprof/igprof-io
