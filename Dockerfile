FROM node

RUN npm install supervisor -g
RUN npm install chokidar
RUN npm install express
RUN npm install sqlite3
EXPOSE 8888

ENTRYPOINT supervisor igprof-navigator.js
