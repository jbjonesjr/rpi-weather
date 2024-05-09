# rpi-weather
Turning a raspberry pi into an always on, internet connected weather station

- `rtl-publish` runs on the raspberry pi, wraps the data receiver, processes the data, and stores it in a Heroku postgres database
  - `npm run-script run-local` in the src/rtl-publish directory 
- `server` runs via heroku, and is a web service endpoint to serve up the data to various clients.
  - `npm run start:prod`
- `app` runs on heroku, and is a web/html interface to the data.
  - `npm run start:client`
- `services` is a shared services layer used by other packages

## Key Heroku desgin components
- Multi-package apps in Heroku: https://medium.com/inato/how-to-setup-heroku-with-yarn-workspaces-d8eac0db0256
  - Multi ProcFiles in Heroku: https://elements.heroku.com/buildpacks/heroku/heroku-buildpack-multi-procfile
- NodeJS Buildpack/Heroku: https://devcenter.heroku.com/articles/getting-started-with-nodejs?singlepage=true

## Validated Gear
- https://www.lacrossetechnology.com/products/ltv-wsdth03?variant=32548332208174&gclid=CjwKCAjwi8iXBhBeEiwAKbUofXgwOmVaGIfhEReurEzzMYuiXiUACR6Z_Pb4CWhL1GmqA1sZ48gxlxoCvpwQAvD_BwE
- https://www.lacrossetechnology.com/products/ltv-r3?variant=32453335089198&gclid=CjwKCAjwi8iXBhBeEiwAKbUofR_acaO-mLNJwxxv39O8P5_5_9xGtlzlrbN_bcLVR695IBMHGchP0xoCSKcQAvD_BwE

## Testing the Receiver and Publishing process

To test the receiver and publishing process, a specific script has been developed and is located at `src/rtl-publish/tests/tests.js`. This script simulates incoming data for receiver testing and mocks all necessary database calls to ensure a comprehensive test environment.

To run the receiver and publish tests, navigate to the `src/rtl-publish` directory and execute the following command:

```
npm run test-receiver
```

This will initiate the testing script, which utilizes the `line-by-line` package to simulate incoming data accurately. The test is integrated into the project's continuous integration process to ensure the receiver's functionality is consistently verified.
