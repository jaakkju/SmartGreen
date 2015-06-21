SmartGreen is a simple arduino based temperature and humidity sensing IoT device. It was created as a part of University of Helsinki Computer Science course Internet of Things: Exactum Greenhouse.

 - http://blogs.helsinki.fi/greenhouseproject/
 - https://www.cs.helsinki.fi/en/courses/582736/2015/v/k/1

# Description
A device for measuring temperature and relative air humidity. It measures and sends the data to the backend server every 5 minutes. One aim of the project was to make a small affordable device which could be placed to almost anywhere. Parts ordered from Ebay cost about 5,5€ per device (excluding jumper cables, 3D printed box and USB charger).

Data is displayed on a dashboard web page which allows the user easily to follow changes and latest measurements from the device. All devices send a device identifier with the data so user can have multiple devices measuring different locations.

Backend is running in Heroku (PaaS) platform and data is stored to MongoDB (MongoLab).

# Hardware (2 devices)
 - 2x AM2302/DHT22 (digital temperature and relative humidity sensor)
 - 2x Arduino Pro mini V3.3
 - 2x ESP 8266 - ESP-01 (wifi module)
 - 2x 5V to 3.3V DC-DC Power Supply Module AMS1117 LDO 800MA

# 3D Printed parts
 - 2x Device box and cover

## Some commands

Start localhost MongoDB:
mongod --dbpath c:\tools\mongoDB\Data\

Set production flag to Heroku:
heroku config:set NODE_ENV=production