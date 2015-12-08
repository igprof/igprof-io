#!/bin/bash -ex

if [ ! X$DEBUG = X ];then
cat <<\EOF >> /logstash.conf
output { stdout { codec => rubydebug } }
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

perl -p -i -e "s/[@]REDIS_HOST[@]/$REDIS_HOST/g" /logstash.conf
cat /logstash.conf
logstash -f /logstash.conf
