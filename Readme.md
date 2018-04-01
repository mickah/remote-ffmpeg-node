# Remote ffmpeg node
Node server providing remote ffmpeg services

## Installation
### Dependencies
- nodejs 8 (I didn't check other versions)
- ffmpeg with the encoders you want:
    - x264 for videos
    - aac or libfdk_aac for audio

## Configuration
```json
{
    "working_dir":"./",
    "port":8080,
    "address":"0.0.0.0"
}
```
- working_dir: directory from which ffmpeg commands are launched
- port: web server port
- address: web listenning address

## Availables commands

## HTTP API
GET commands:
- /ffmpeg_infos: return all formats, codecs, encoders, filters infos

## WEB Socket API
There is only one ffmpeg process per web socket connected.
Once you sent a process command you will receive "Status message" and a "Final message" when it's done.

- process command:
```json
{
  "command":"ffmpeg",
  "niceness":0,
  "args":[
    "-i",
    "tests/input.mp4",
    "-y",
    "-c:v",
    "libx264",
    "-b:v:0",
    "4800k",
    "-profile",
    "main",
    "video-1.mp4"
  ]
}
// equivalent to ffmpeg -i tests/input.mp4 -y -c:v libx264 -b:v:0 4800k -profile main video-1.mp4 
```
- change process priority
```json
{
  "command":"set_priority",
  "niceness":0,
}
```

- set kill command
```json
{
  "command":"kill",
  "signal":"SIGSTOP",
}
```
- signals ["SIGSTOP","SIGCONT","SIGKILL"]
- priority:[0-15]

## Status message
```json
{
  "progression":0.5,
  "data":{}
}
```
## Final message
```json
{
  "code":0,
  "msg" : "some success msg",
  "data":{}
}
{
  "code":1,
  "msg" : "some error",
  "data":{}
}
```
## Liscence

MIT License

Copyright (c) 2018 Michael FAGNO <michael.fagno@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Third parties
This node is based on [node-fluent-ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg) sources modified (quickly) to run raw ffmpeg commands. [liscence](licenses/node-fluent-ffmpeg/LICENSE.TXT)



