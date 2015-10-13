FROM node

RUN npm install supervisor -g
RUN npm install chokidar
RUN npm install express
RUN npm install sqlite3
RUN npm install redis
EXPOSE 8888

RUN mkdir -p /usr/src && git clone https://github.com/igprof/igprof-io /usr/src/igprof-io && cd /usr/src/igprof-io && git checkout -b work 9688655e

WORKDIR /usr/src/igprof-io
ENTRYPOINT ${DEBUG:+supervisor} ${DEBUG:-node} igprof-io.js
