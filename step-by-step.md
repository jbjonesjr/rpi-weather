Raspberry PI via CanaKit. Wanted a case, power supply, etc all working and easy to use.
Installation instructions at: https://www.canakit.com/Media/CanaKit-Raspberry-Pi-Quick-Start-Guide-4.0.pdf
Followed the first steps, inserted SD Card, connected USB devices & HDMI caple, powered it on. It `just worked`

## Getting the OS ready
At Noobs bootloader, installed raspbian, not libreELEC

Install details:
US Keyboard/English (US) Language. New York TimeZone
Updated the default account (from pi/raspberry) to be pi/{flagstone doorcode} (VNC password is {flagstone doorcode}x2)
to `run apt-get update && apt-get upgrade` took about 2 hours

TODO: want SSH server, restricted to key access, allowed for remote access.
  - This will let me ditch the mouse/keyboard from my desk when I need to `do things`
TODO: Decide if I'll really need xwindows long term (VNC is nice though)

## Getting the RTL dongle to work
TODO: install/use rtl-sdr.com

video on some basics: https://www.youtube.com/watch?v=L0fSEbGEY-Q
RTL-SDR quick start (scroll down for Linux)
https://www.rtl-sdr.com/rtl-sdr-quick-start-guide/
Link to LINUX instructions: https://www.rtl-sdr.com/rtl-sdr-quick-start-guide/#:~:text=GETTING-,STARTED%20ON%20LINUX,-For%20Linux%20we
Linkes to a more detailed description here: https://ranous.files.wordpress.com/2018/02/rtl-sdr4linux_quickstartv2-18.pdf
This seems pretty full featured: https://www.rtl-sdr.com/forum/viewtopic.php?t=1451#p15415


[RTL-443](https://github.com/merbanan/rtl_433) is the key library it seems that makes this work. Very versatile with pre-configured support for many devices, including multiple la crosse ones.
Can't install it via package manager
Raspbian has an OLDER VERSION in the `testing` stream, but not in the mainline. So between testing, and the old version
https://repology.org/project/rtl-433/versions

So gonna build it from source:
https://github.com/merbanan/rtl_433/blob/master/docs/BUILDING.md

install the pre-reqs
`sudo apt-get install libtool libusb-1.0-0-dev librtlsdr-dev rtl-sdr build-essential cmake pkg-config`
then git clone the source
`mkdir -p git/merbanan && cd git/merbanan && git clone https://github.com/merbanan/rtl_433.git`
then cmake process
https://github.com/merbanan/rtl_433/blob/master/docs/BUILDING.md#cmake
**NOTE: Use `sudo make install`**

`rtl_test -t` to ensure it's working and plugged in correctly
I dind't have the dvb module installed/loaded by default, so didn't need to blacklist it.

`rtl_433 -g 50 -f 915M -F json` to test that it's finding my weather stations

`rtl_433 -S all -T 120`	Save all detected signals (g###_###M_###k.cu8). Run for 2 minutes. Looking for my weathe stations
I didn't see anyhting output.... 

`sudo apt-get install gqrx-sdr` for a nice SDR# style GUI
`gqrx`

^^ that installed rtlsdr1, so didn't need to complile that from source. However, you still can, but lose all the other cool utilities that came with the package version

Don't see it there...

Should be in RTL433 via    
- [166]  LaCrosse Technology View LTV-WSDTH01 Breeze Pro Wind Sensor
  - Adding support: https://github.com/merbanan/rtl_433/pull/1485 & https://github.com/merbanan/rtl_433/pull/1489
- [175]  LaCrosse Technology View LTV-R1 Rainfall Gauge
  - Adding support: https://github.com/merbanan/rtl_433/pull/1553


tried blacklist the dvb driver, which now IS running...
`echo 'blacklist dvb_usb_rtl28xxu' | sudo tee – append /etc/modprobe.d/blacklist-dvb_usb_rtl28xxu.conf`
i got a message when running rtl which said "detaching kernel driver" which was my hint something was off

FCC data sheet -> 
https://fcc.report/FCC-ID/OMOLTV-R3
https://fcc.report/FCC-ID/OMOLTV-WSDTH01

notes: https://triq.org/rtl_433/OPERATION.html#outputs
RTL-SDR didn't come with an antenna. I used one I had around the house. Not paying attention they were both female connectors....

Using rtl_fm (note: rpi comes with `aplay`, not `play`)
Streaming audio via gqrx: 
https://gqrx.dk/doc/streaming-audio-over-udp

Washington Region Weather Radio Stations:
https://www.weather.gov/nwr/stations?State=VA
Good for tuning the antenna.


Eventually I realized this, played with a bunch of coax and wires, and have now purchased an SMA-male atenna to be shipped to me. In the meantime i used a bit of braided wire, put it together to connect the female-antenna to the female-dongle, and have a working solution.
Purchased this SMA male atntenna from Amazon to solve this issue for real:
`4G LTE Antenna, RHsia [2 Pack] 3G 4G LTE Dipole Antenna Wide Band 9dbi 700-2700Mhz Omni Directional Antenna with SMA Male Connector for CPE Router,Access Point,Wireless Rang Extender,IP Camera More`
https://www.amazon.com/dp/B07TTY8W2Y?psc=1&smid=A1PNEBSRAT6AIF&ref_=chk_typ_imgToDp

Got these adapters for Amazon for future flexibility of this/other projects:
https://www.amazon.com/dp/B073JT98RR?psc=1&smid=A2JO7YP9I9Y3D6&ref_=chk_typ_imgToDp
`NooElec SMA Adapter Connectivity Kit: 8 Adapters for NESDR (RTL-SDR) SMA Radios w/Case`




PER https://www.rtl-sdr.com/forum/viewtopic.php?t=1451#p15415

Now [my project](https://github.com/psa-jforestier/palmeteo/tree/master/client) is moving to this new software suite :
- a Raspberry with a SDR dongle. I added a ram disk of 50MB in the Pi for temporary storage and prevent heavy r/w access on the SD card
- a crontab trggering a script shell every 10mn
- this script shell did the following tasks :
- run rtl_433 for 30s to collect data from the sensor. Data are appended to a CSV file in the ram disk.
- after the 30s, a PHP process read the CSV file, do some formatting, and send data to WeatherUnderground webservice and my own weather webservice, hosted somewhere on the cloud.
- this PHP process also create a file for each sensor with the last measured value. This set of files is used by rpimonitor [https://github.com/XavierBerger/RPi-Monitor] to add a graph of my sensor in the rpimonitor tool.


Loose instructions

prep heroku in codespace (docs: https://devcenter.heroku.com/articles/heroku-cli#standalone-installation)
codespace ➜ /workspaces (main ✗) $ `curl https://cli-assets.heroku.com/install.sh | sh`
Get cli token/login
codespace ➜ /workspaces (main ✗) $ `heroku login -i`
codespace ➜ /workspaces (main ✗) $ `git remote add heroku https://git.heroku.com/{}.git`


## Create root application
codespace ➜ /workspaces/rpi-weather (main ✗) $ `npm init`

## Building client app
codespace ➜ /workspaces/rpi-weather (main ✗) $ cd src
codespace ➜ /workspaces/rpi-weather/src/app (main ✗) $ npx create-react-app weather-rpi

## Building server app
codespace ➜ /workspaces/rpi-weather/src (main ✗) $ `cd src/server`
codespace ➜ /workspaces/rpi-weather/src/server (main ✗) $ `npm init`
codespace ➜ /workspaces/rpi-weather/src/server (main ✗) $ `npm install express`
codespace ➜ /workspaces/rpi-weather/src/server (main ✗) $ `create index.js`

codespace ➜ /workspaces/rpi-weather/src/server (main ✗) $ `heroku create`
add heroku route to git config
codespace ➜ /workspaces/rpi-weather/.git (main ✗) $ `vi config`



codespace ➜ /workspaces/rpi-weather (main ✗) $ `git push heroku main`

codespace ➜ /workspaces/rpi-weather/src/server (main ✗) $ npm install pg

commit my package-lock.json files: https://dev.to/adamklein/package-lock-json-in-git-or-not-50l5