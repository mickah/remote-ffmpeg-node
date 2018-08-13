# docker build -t streamy_ffmpeg:3.4.4 .
# To test it
# docker run --rm -p 7001:7001 -v /volume1:/volume1 --device=/dev/vchiq -it --entrypoint /bin/bash remote_ffmpeg_node:3.4.4

FROM resin/rpi-raspbian:stretch
ENV INITSYSTEM on

CMD ["--help"]
ENTRYPOINT ["ffmpeg"]
WORKDIR /tmp/workdir

ENV SOFTWARE_VERSION="3.4.4"
ENV SOFTWARE_VERSION_URL="http://ffmpeg.org/releases/ffmpeg-${SOFTWARE_VERSION}.tar.bz2"
ENV BIN="/usr/bin"
ENV SRC="/usr/local"
ENV CPUCOUNT 4

RUN echo "deb http://www.deb-multimedia.org stretch main non-free" >> /etc/apt/sources.list.d/deb-multimedia.list
RUN echo "deb-src http://www.deb-multimedia.org stretch main non-free" >> /etc/apt/sources.list.d/deb-multimedia.list

#RUN apt-get install --allow-unauthenticated deb-multimedia-keyring
#RUN CPUCOUNT="$(cat /proc/cpuinfo | grep '^processor.*:' | wc -l)" \ 
#  && apt-get update \  
#  && apt-get -qy install ca-certificates \
#  && apt-get upgrade \
#  && apt-get install build-essential \
#  && apt-get install pkg-config 

RUN apt-get update
RUN apt-get install -y git nano wget mercurial build-essential pkg-config autoconf automake libtool yasm cmake
RUN apt-get install -y --allow-unauthenticated libomxil-bellagio-dev libmp3lame-dev libass-dev libfreetype6-dev libtheora-dev libvorbis-dev texi2html zlib1g-dev libasound2-dev libbluray-dev libwebp-dev libxvidcore-dev libzvbi-dev libraspberrypi0

# Get sources
RUN curl -Os "${SOFTWARE_VERSION_URL}"
#RUN git clone --depth 1 git://source.ffmpeg.org/ffmpeg
RUN git clone --depth 1 git://git.videolan.org/x264
#RUN wget http://downloads.sourceforge.net/project/lame/lame/3.99/lame-3.99.tar.gz
RUN git clone --depth 1 https://github.com/l-smash/l-smash
#RUN hg clone https://bitbucket.org/multicoreware/x265
RUN git clone --depth 1 git://github.com/mstorsjo/fdk-aac.git
RUN git clone --depth 1 https://chromium.googlesource.com/webm/libvpx
RUN git clone --depth 1 git://git.opus-codec.org/opus.git


# install last  x264
RUN cd x264 && ./configure --host=arm-unknown-linux-gnueabi --enable-static --disable-opencl && make -j 4 && make install

# install last  x265
#RUN cd x265/build/linux && cmake -DCMAKE_INSTALL_PREFIX:PATH=/usr ../../source && make -j 4 && make install

# install mp3 support
#RUN tar xzvf lame-3.99.tar.gz
#RUN cd lame-3.99 && ./configure && make && make install

# Build L-SMASH
RUN cd l-smash && ./configure && make -j 4 && make install

# install FDK-AAC
RUN cd fdk-aac && ./autogen.sh && ./configure --disable-shared --enable-static && make -j4 && make install

# Build libvpx
RUN cd libvpx && ./configure --disable-examples && make -j 4 && make install

# Build libopus
RUN cd opus && ./autogen.sh && ./configure --disable-shared && make -j 4 && make install


# install ffmpeg
RUN curl -Os "${SOFTWARE_VERSION_URL}" && tar xjvf "ffmpeg-${SOFTWARE_VERSION}.tar.bz2"
RUN cd ffmpeg && ./configure --arch=armel --target-os=linux --enable-gpl --enable-libx264 --enable-libmp3lame --enable-omx --enable-omx-rpi --enable-nonfree --enable-libfdk_aac --enable-libass --enable-libopus --enable-libtheora --enable-libvorbis --enable-libvpx --enable-libwebp --enable-libxvid --enable-libbluray --enable-libzvbi && make -j4 && make install
# --enable-libx265

RUN ldconfig
RUN rm -rf /tmp/workdir

