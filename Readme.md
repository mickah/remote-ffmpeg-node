# Remote ffmpeg node
Node server proving remote ffmpeg services

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

## Liscences


This node is based on [node-fluent-ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg) sources modified (quickly) to run raw ffmpeg commands. [liscence](licenses/node-fluent-ffmpeg/LICENSE.TXT)



