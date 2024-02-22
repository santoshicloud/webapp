#!/bin/bash

# Update system
sudo dnf update -y
 
# Install MySQL
sudo dnf install mysql-server -y
sudo systemctl enable mysqld
sudo systemctl start mysqld
 
 
# Set root user password for MySQL
sudo mysql -u root -p -e "ALTER USER 'root'@'localhost' IDENTIFIED BY ‘texas’; CREATE DATABASE cloud;"

 
sudo groupadd -f csye6225
 
# Create user csye6225 and add to group csye6225
sudo useradd -m -g csye6225 -s /usr/sbin/nologin csye6225
 
 
sudo cp /tmp/csye6225.service /lib/systemd/system/csye6225.service
 
# Install unzip
sudo dnf install -y unzip
 
sudo dnf install httpd -y
 
sudo dnf module enable -y nodejs:18
sudo dnf install -y npm
 
   
sudo cp /tmp/webapp.zip /opt
 cd /opt || exit
 sudo unzip webapp.zip
 
    # cd webapp/ || exit
    sudo chown -R csye6225:csye6225 /opt
 
    sudo chmod -R 750 /opt
    # Install Node.js and npm
    sudo npm install
 
    sudo npm test 
 
    sudo systemctl daemon-reload
    sudo systemctl enable httpd
    sudo systemctl start httpd
    sudo systemctl enable csye6225
    sudo systemctl start csye6225
    sudo systemctl status csye6225