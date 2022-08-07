# rpi-weather
working on turning a raspberry pi into an always on, internet connected weather station



`rtl-publish` runs on the raspberry pi, wraps the data receiver, and sends the data to the server.
`server` runs via heroku, and is a web service endpoint to serve up the data to various clients.
`app` runs on heroku, and is a web/html interface to the data.

