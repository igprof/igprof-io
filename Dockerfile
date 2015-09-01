FROM node

RUN npm install supervisor -g
RUN npm install chokidar
RUN npm install express
RUN npm install sqlite3
EXPOSE 8888

RUN mkdir -p /usr/src && git clone https://github.com/igprof/igprof-io /usr/src

ENTRYPOINT ${DEBUG:+supervisor} ${DEBUG:-node} igprof-navigator.js
