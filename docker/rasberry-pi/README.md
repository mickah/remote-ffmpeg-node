Install docker on RPI

curl -sSL https://get.docker.com | sh
sudo usermod -aG docker pi
sudo systemctl enable docker
sudo systemctl start docker

# didn't need the following line on the RPi3
#sudo echo " cgroup_enable=memory cgroup_memory=1" >> /boot/cmdline.txt
# https://stackoverflow.com/questions/47520693/raspbian-docker-error-response-from-daemon-cgroups-memory-cgroup-not-supporte
sudo reboot

# Setup streamy node
#docker run --name iot --restart=always --privileged -d alexellis2/cheerlights:0.1
