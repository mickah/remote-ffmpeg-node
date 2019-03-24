# Build command
# docker build -t remote_ffmpeg_node:3.4.4-odroid-xu4-debian-stretch .
#
# Run command
# docker run --rm -p 7000:7000 -v /volume1:/volume1 -it --entrypoint /bin/bash remote_ffmpeg_node:3.4.4-ubuntu-16.04
# Run service
# docker run -dit -v /volume1/streamy/:/volume1/streamy -p 7000:7000 --restart unless-stopped --name streamy_worker remote_ffmpeg_node:3.4.4-odroid-xu4-debian-stretch

FROM streamy_ffmpeg:3.4.4-odroid-xu4-debian-stretch
#ENV INITSYSTEM on

EXPOSE 7000
ENTRYPOINT ["node", "/opt/remote-ffmpeg-node/app.js"]

WORKDIR /opt/

RUN apt-get update -y && apt-get upgrade -y

# Install node
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash - && \
 apt-get install -y nodejs

RUN git clone --depth 1 https://github.com/mickah/remote-ffmpeg-node.git && \
 cd remote-ffmpeg-node && \
 npm install

