# docker build -t streamy_ffmpeg:3.4.4-odroid-xu4-debian-stretch .
# To test it
# docker run --rm -v /volume1:/voodroid-xu4-debian-stretchlume1 -it --entrypoint /bin/bash streamy_ffmpeg:

FROM balenalib/odroid-xu4-debian:stretch
ENV INITSYSTEM on

CMD ["--help"]
ENTRYPOINT ["ffmpeg"]
WORKDIR /tmp/workdir

ENV SOFTWARE_VERSION="3.4.4"
ENV SOFTWARE_VERSION_URL="http://ffmpeg.org/releases/ffmpeg-${SOFTWARE_VERSION}.tar.bz2"
ENV BIN="/usr/bin"
ENV SRC="/usr/local"
ENV CPUS=4

RUN apt-get update && apt-get install -y \
  git \
  nano \
  wget \
  mercurial \
  build-essential \
  pkg-config \
  autoconf \
  automake \
  libtool \
  cmake \
  curl
  
RUN apt-get install -y \
  libmp3lame-dev \
  libass-dev \
  libfreetype6-dev \
  libtheora-dev \
  libvorbis-dev \
  texi2html \
  zlib1g-dev \
  libasound2-dev \
  libbluray-dev \
  libwebp-dev \
  libxvidcore-dev \
  libzvbi-dev 

# Get sources
ENV FDKAAC_VERSION="v0.1.6"
ENV LSMASH_VERSION="v2.14.5"
ENV LVPX_VERSION="v1.7.0"
ENV NASM_VERSION="2.13.01"

RUN curl -Os "${SOFTWARE_VERSION_URL}"
RUN git clone --depth 1 git://git.videolan.org/x264
#RUN wget http://downloads.sourceforge.net/project/lame/lame/3.99/lame-3.99.tar.gz
RUN git clone --depth 1 https://github.com/l-smash/l-smash --branch ${LSMASH_VERSION}
#RUN hg clone https://bitbucket.org/multicoreware/x265
RUN git clone --depth 1 git://github.com/mstorsjo/fdk-aac.git --branch ${FDKAAC_VERSION}
RUN git clone --depth 1 https://chromium.googlesource.com/webm/libvpx --branch ${LVPX_VERSION}
RUN git clone --depth 1 git://git.opus-codec.org/opus.git
RUN wget http://www.nasm.us/pub/nasm/releasebuilds/${NASM_VERSION}/nasm-${NASM_VERSION}.tar.xz

#install nasm (for x264)
RUN tar -xvf nasm-2.13.01.tar.xz && \
  cd nasm-2.13.01 && \
  ./configure && \
  make && \
  make install


# install last  x264
RUN cd x264 && ./configure --host=arm-unknown-linux-gnueabi --enable-static --enable-pic --disable-opencl && \
  make -j ${CPUS} && \
  make install

# TODO check why there are issues to compile x265 on XU4
# install last  x265
#RUN cd x265/build/linux && \
#  cmake -DCMAKE_INSTALL_PREFIX:PATH=/usr ../../source && \
#  make -j ${CPUS} && \
#  make install

# install mp3 support
#RUN tar xzvf lame-3.99.tar.gz
#RUN cd lame-3.99 && ./configure && make && make install

# Build L-SMASH
RUN cd l-smash && \
  ./configure && \
  make -j 4 && \
  make install

# install FDK-AAC
RUN cd fdk-aac && \
  ./autogen.sh && \
  ./configure --disable-shared --enable-static && \
  make -j ${CPUS} && \
  make install

# Build libvpx
RUN cd libvpx && \
  ./configure --disable-examples && \
  make -j ${CPUS} && \
  make install

# Build libopus
RUN cd opus && \
  ./autogen.sh && \
  ./configure --disable-shared && \
  make -j ${CPUS} && \
  make install


# install ffmpeg
RUN curl -Os "${SOFTWARE_VERSION_URL}" && tar xjvf "ffmpeg-${SOFTWARE_VERSION}.tar.bz2"
RUN cd ffmpeg-${SOFTWARE_VERSION} && ./configure --target-os=linux --enable-gpl --enable-libx264 --enable-libmp3lame --enable-nonfree --enable-libfdk_aac --enable-libass --enable-libopus --enable-libtheora --enable-libvorbis --enable-libvpx --enable-libwebp --enable-libxvid --enable-libbluray --enable-libzvbi && \ 
  make -j ${CPUS} && \
  make install
# --enable-libx265

RUN ldconfig
RUN rm -rf /tmp/workdir

