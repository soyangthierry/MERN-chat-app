A chat app built with React js and Node js, guided from a tutorial.
Usage:

Navigate to server

create a file named .env in the root directory and enter the following information therein:

MONGO_URL=<your MongoDB url>
PORT=<desired port>

start the server then...

Navigate to public/src/utils/APIRoutes.js


replace host with http://<your current ipv4 address>:server port

ipv4 address can be gotten from the ipconfig command on windows

example

host="http://192.168.73.12:5000"

