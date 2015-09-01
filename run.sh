docker run -it --rm --net=host --name igprof-io -v $PWD/data:/data -v "$PWD":/usr/src/igprof-navigator -w /usr/src/igprof-navigator igprof/igprof-io
