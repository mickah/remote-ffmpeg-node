# Create remote_ffmpeg_node image

## Description
In order to build remote_ffmpeg_node, you need a base image with ffmpeg. 

## Docker installation
* Ubuntu based
https://docs.docker.com/install/linux/docker-ce/ubuntu/#install-using-the-repository

* Raspberry pi
```
curl -sSL https://get.docker.com | sh
sudo usermod -aG docker pi
sudo systemctl enable docker
sudo systemctl start docker
#sudo echo " cgroup_enable=memory cgroup_memory=1" >> /boot/cmdline.txt
# https://stackoverflow.com/questions/47520693/raspbian-docker-error-response-from-daemon-cgroups-memory-cgroup-not-supported
sudo reboot
```
## Build an ffmpeg image
* Ubuntu
You can use the Dockerfile in streamy_ffmpeg or you can make your own
```
cd ubuntu/streamy_ffmpeg
docker build -t streamy_ffmpeg:3.4.4-ubuntu-16.04 .
```

* Raspberry
```
cd raspberry-pi/ffmpeg
docker build -t streamy_ffmpeg:3.4.4-raspbian-stretch .
```

## Build remote ffmpeg node image
* Ubuntu
```
docker build -t remote_ffmpeg_node:3.4.4-ubuntu-16.04 .
```

* Raspberry
```
docker build -t remote_ffmpeg_node:3.4.4-raspbian-stretch .
```

## Run remote-ffmpeg-node
* Ubuntu
```
docker run -dit -p 7000:7000 -v /volume1:/volume1 --restart unless-stopped remote_ffmpeg_node:3.4.4-ubuntu-16.04 .
```

* Raspberry
```
docker run -dit -p 7000:7000 -v /volume1:/volume1 --restart unless-stopped --device=/dev/vchiq  remote_ffmpeg_node:3.4.4-raspbian-stretch .
```

## Notes

### Adding a sharing folder using fstab rule
```
//SHAREIP/streamy /volume1/streamy cifs username=USER,password=PWD,domain=.,vers=1.0,rw,nofail,x-systemd.automount,x-systemd.requires=network-online.target,x-systemd.device-timeout=5 0 0
```
`sudo mount -t cifs -o username=USER,password=PWD,domain=.,vers=1.0 //SHAREIP/streamy /volume1/streamy`
