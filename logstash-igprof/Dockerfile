FROM logstash:1.5

RUN mkdir -p /opt/logstash/patterns/igprof-io
ADD igprof-io-patterns.conf /opt/logstash/patterns/igprof-io/

ADD run.sh /
ADD logstash.conf /

CMD /run.sh
