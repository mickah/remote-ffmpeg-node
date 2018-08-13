#Install docker on RPI
```
curl -sSL https://get.docker.com | sh
sudo usermod -aG docker pi
sudo systemctl enable docker
sudo systemctl start docker

#sudo echo " cgroup_enable=memory cgroup_memory=1" >> /boot/cmdline.txt
# https://stackoverflow.com/questions/47520693/raspbian-docker-error-response-from-daemon-cgroups-memory-cgroup-not-supported
sudo reboot
```
# Run remote-ffmpeg-node
```
docker run -dit -p 7000:7000 -v /volume1:/volume1 --restart unless-stopped remote_ffmpeg_node:3.4.4
```

#fstab rule
```
//SHAREIP/streamy /volume1/streamy cifs username=USER,password=PWD,domain=.,vers=1.0,rw,nofail,x-systemd.automount,x-systemd.requires=network-online.target,x-systemd.device-timeout=5 0 0
```
`sudo mount -t cifs -o username=USER,password=PWD,domain=.,vers=1.0 //SHAREIP/streamy /volume1/streamy`
