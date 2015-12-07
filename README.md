IgProf.io
---------

A multi profile web GUI for IgProf.


Quick start
-----------

The easiest way to start / deploy it is to use [docker](https://docker.io).

Assuming you have your sqlite profiles in `$PWD/data` you can start
the GUI in development mode by doing.

    ./run.sh

and then have your browser point to port 8888 of the machine where the
container is running.

Pushing information to REDIS / Logstash / Elasticsearch
-------------------------------------------------------

It is possible to push some metadata about the profiles to a Redis
instance in a LIST called `igprof_files`. This allows later retrieval
of the information via Logstash, which itself can redirect it to your
favourite metric storage, e.g. Elasticsearch. In order to do so you need
to specify the `IGPROF_IO_REDIS` environment variable with the url of
the Redis endpoint.
