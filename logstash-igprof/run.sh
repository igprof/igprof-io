#!/bin/bash -ex

if [ ! X$DEBUG = X ];then
cat <<\EOF >> /logstash.conf
output { stdout { codec => rubydebug } }
output { stdout {
    codec => line {format => "igprof/%{monalisa_id} total_count %{[info][total_count]}"}
  }
}
EOF
fi

if [ ! X$ELASTICSEARCH_HOST = X ]; then
cat <<EOF >> /logstash.conf
output {
  elasticsearch_http {
    host         => "$ELASTICSEARCH_HOST"
    port         => "9200"
    index        => "igprof-%{+YYYY.MM.dd}"
    document_id  => "%{unique_id}"
  }
}
EOF
fi

if [ ! X$MONALISA_HOST = X ]; then
cat <<EOF >> /logstash.conf
filter {
  mutate {
    add_field => {"monalisa_id" => "%{filename}"}
  }
  mutate {
    gsub => ["monalisa_id", "/", "#"]
  }
}
output {
  udp {
    host => "$MONALISA_HOST"
    port => "$MONALISA_PORT"
    codec => line {format => "igprof/%{monalisa_id} total_count %{[info][total_count]}"}
  }
  udp {
    host => "$MONALISA_HOST"
    port => "$MONALISA_PORT"
    codec => line {format => "igprof/%{monalisa_id} total_freq %{[info][total_freq]}"}
  }
  udp {
    host => "$MONALISA_HOST"
    port => "$MONALISA_PORT"
    codec => line {format => "igprof/%{monalisa_id} tick_period %{[info][tick_period]}"}
  }
  udp {
    host => "$MONALISA_HOST"
    port => "$MONALISA_PORT"
    codec => line {format => "igprof/%{monalisa_id} architecture %{[architecture]}"}
  }
  udp {
    host => "$MONALISA_HOST"
    port => "$MONALISA_PORT"
    codec => line {format => "igprof/%{monalisa_id} counter %{[info][counter]}"}
  }
  udp {
    host => "$MONALISA_HOST"
    port => "$MONALISA_PORT"
    codec => line {format => "igprof/%{monalisa_id} status %{status}"}
  }
  udp {
    host => "$MONALISA_HOST"
    port => "$MONALISA_PORT"
    codec => line {format => "igprof/%{monalisa_id} hostname %{hostname}"}
  }
  udp {
    host => "$MONALISA_HOST"
    port => "$MONALISA_PORT"
    codec => line {format => "igprof/%{monalisa_id} build_timestamp %{[@timestamp]}"}
  }
}
EOF
fi

perl -p -i -e "s/[@]REDIS_HOST[@]/$REDIS_HOST/g" /logstash.conf
cat /logstash.conf
logstash -f /logstash.conf
