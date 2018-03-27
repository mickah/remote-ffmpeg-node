# Availables commands

commands:
- transcode
- create_mp4
- stats

## Transcode offline
{
  "command":"transcode",
  "input":"folder1/foo.mp4",
  "mode":"offline"
  "output":"folder2/foo2.mpd",
  "priority":0
}
- input: .mp4, mkv ...
- output: .mpd
- priority:[0-15]

## Transcode live
{
  "command":"transcode",
  "input":"folder1/foo.mp4",
  "mode":"live"
  "output":"folder2/foo2.mpd",
  "priority":4
}

- input: .mp4, mkv ...
- output: .mpd
- priority:[0-15]

## CreateMP4
{
  "command":"create_mp4",
  "input":"folder1/foo.mpd",
  "streams":[0,3],
  "output":"folder2/foo2.mp4",
  "priority":5
}

- input: .mpd
- output: .mp4
- priority:[0-15]

# Status message
{
  "code":0,
  "progression":0.5,
  "data":{...}
}

# Final message
{
  "code":0,
  "msg" : "success"
  "data":{...}
}
{
  "code":-1,
  "msg" : "some error"
  "data":{...}
}
