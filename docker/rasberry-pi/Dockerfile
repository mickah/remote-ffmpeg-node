# docker build -t remote_ffmpeg_node:3.4.4-raspbian-stretch .
FROM streamy_ffmpeg:3.4.4
#ENV INITSYSTEM on

EXPOSE 7000
ENTRYPOINT ["node", "/opt/remote-ffmpeg-node/app.js"]

WORKDIR /opt/

RUN apt-get update -y && apt-get upgrade -y

# Install node
RUN curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
RUN apt-get install -y nodejs

RUN git clone --depth 1 https://github.com/mickah/remote-ffmpeg-node.git


