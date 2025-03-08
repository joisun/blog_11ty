---
title: FFmpeg的安装和基本使用
date: 2021-04-28
tags:
  - FFmpeg
---



## 0. 认识FFmpeg

### 0.1 什么是FFmpeg ？

FFmpeg 是一个领先的开源多媒体框架，它能够几乎对所有的多媒体文件进行各种处理。 包含了libavcodec : 这是一个用于多个项目中音频和视频的解码器库，以及libavformat : 一个音频与视频格式转换库。

### 0.2 FFmpeg的组成

**命令行应用程序：**

- `ffmpeg` : 用于对视频文档或者音频档案转换格式。
- `ffplay` ： 一个简单的播放器，基于SDL 与 FFmpeg 库。
- `ffprobe` : 用于显示媒体文件的信息。

**函数库：**

- *libswresample*
- *libavresample*
- *[libavcodec](https://zh.wikipedia.org/wiki/Libavcodec)*：包含全部FFmpeg音频/视频编解码库
- *libavformat*：包含demuxers和muxer库
- *libavutil*：包含一些工具库
- *libpostproc*：对于视频做前处理的库
- *libswscale*：对于影像作缩放的库
- *libavfilter*

### 0.3 在Linux 上安装FFmpeg

```bash
$ sudo add-apt-repository ppa:kirillshkrogalev/ffmpeg-next
$ sudo apt update
$ sudo apt install ffmpeg
```

**检查是否安装成功**

```bash
$ ffmpeg -version
```

输出类似以下信息表明安装成功：

```bash
ffmpeg version 3.4.8-0ubuntu0.2 Copyright (c) 2000-2020 the FFmpeg developers
built with gcc 7 (Ubuntu 7.5.0-3ubuntu1~18.04)
```



---

## 1.基本使用

### 1.1 基本概念

在你能够使用FFmpeg之前，有几个最最基本的概念是有必要了解的。 这些概念将有助于你对FFmpeg这个工具的理解和使用。

**多媒体文件**

在计算机层面，一个多媒体文件可以由 container + streams构成（ 容器和数据流），streams 又大致分为多中，例如 audio stream（音频流），video stream （视频流），等等。 因此在以前，多媒体还有个名字叫做流媒体，用诺基亚的用户一定不陌生。 这些stream在生成的时候都被编码，在读取的时候被解码，而解编码器因为需要满足不同的场景（文件大小，视频质量等），发展至今已经存在很多解编码器了，他们都有优劣。例如 codec 。

而container，是容纳这些stream的容器，它想多媒体播放器暴露了单独的接口以使得播放器能够和多媒体文件进行读写操作，不同格式的多媒体文件暴露的接口自然也就不同。 需要容器的实现也是多种多样的，有的能力强能够容纳多种stream数据。例如同时容纳字幕，音频，视频等信息。

当人们在说到音/视频格式转换的时候，实际上是在转换容器。

### 1.2 基本语法格式

```bash
$ ffmpeg [global_options] {[input_file_options] -i input_url} ... {[output_file_options] output_url} ...
```

这是`ffmpeg`的基本语法格式，相关选项可以查看帮助，或者先通过下文[更多](#3. 更多（进一步了解ffmpeg 和 使用）)先做一个基本了解。

FFmpeg相当的智能，它有着大量的默认设定，通常即便在你不指定各种复杂参数的时候，它也能够自动的在背后为你指定正确的届编码器（codecs）和容器。

例如，假设你想把一个MP3文件转换为OGG文件，只需要以下基本指令就能完成：

```bash
$ ffmpeg -i input.mp3 output.ogg
```

或者将MP4转换成WEBM

```bash
$ ffmpeg -i input.mp4 output.webm
```

这是由于像WebM 这种有着明确定义的格式，FFmpeg能够自动的知道什么音视频是否支持以及如何去处理，并且能够将这些流stream转换成有效的WebM文件。

但是有些情况就不行，这取决的你所处理的container类型，例如，像Matroska (.mkv 文件) ，该容器就被设计用来具备容纳各种流，无法知道你具体要达成什么样的目的，所以以下命令就很可能不会输出你想要的.mkv 文件

```bash
$ ffmpeg -i input.mp4 output.mkv
```

所以你需要对一些处理做一些配置，让FFmpeg知道你要做什么。

### 1.3 选择你的解编码器（codecs）

FFmpeg 提供了 `-c` 选项，让你能够指定各种解编码器。它让你能够为每个stream都指定各自的解编码器。例如：

```bash
$ ffmpeg -i input.mp3 -c:a libvorbis output.ogg
```

```bash
$ ffmpeg -i input.mp4 -c:v vp9 -c:a libvorbis output.mkv
```

> 制定一个Matroska 容器，它的视频流是以VP9规则进行解编码，而音频流则是以Vorbis 规则进行解编码。

使用`ffmpeg -codecs` 将会列出所有FFmpeg支持的解编码器。

### 1.4 修改单个stream

刚才说过了，容器一般支持多个类型的stream, FFmpeg支持单独的修改某一个stream ， 例如:

```bash
$ ffmpeg -i input.webm -c:v copy -c:a flac output.mkv
```

> 这段指令，将视频流 video stream 从input.webm 直接复制到新的容器output.mkv , 然后对 音频流audio stream 按照 flac 规则进行编码。

### 1.5 修改container（容器/格式）

就像上面提到的，我们可以仅仅改变容器，实际上，就是转换格式：

```bash
$ ffmpeg -i input.webm -c:av copy output.mkv
```

> 复制input.webm 的音视频编码规则到新的容器 output.mkv, 因为没有对其进行任何 stream 层面的改动操作，所以它是无损转换的。 

### 1.6 为每个stream设定质量

我们的在有多媒体文件转换需求的时候，往往对视频的质量有要求，那么如何去修改流的质量的？

#### 码率

最简单的方式，就是修改 比特率 （bitrate）,又称之为“码率”，它是指每帧图像存储时所占的比特数，和传输数据的速率。

假设一部电影的码率是 600kbps, 90分钟，那么它的大小就是395MB（600kb/s =75KB/s（每秒钟是75KB），然后75KB/s*5400s =405000KB =395MB），算上音频大致400多MB。所以在同样分辨率下，视频的容量越大（码率越高），就质量越好，当然决定视频质量的还有其他因素。此外，当码率超过一定数值，对图像质量的没有多大影响，所以一个合适的值才是重要的。相关可以看[这里](为什么同样是同一部影片 720p 的 mkv，有的是 4~7GB，有的是 2GB 左右？他们的画质差别大吗？ - 卿培的回答 - 知乎 https://www.zhihu.com/question/20892140/answer/16525176)。

为各个stream设定bitrate , 你需要指定一个 `-b` 选项，和指定编码`-c` 类似的，你也需要通过`:`冒号指定一个参数。 例如:

```bash
$ ffmpeg -i input.webm -c:a copy -c:v vp9 -b:v 1M output.mkv
```

> 从input.webm 复制音频的编码(`-c:a copy`) , 将视频转换成 vp9 编码规则(`-c:v vp9`) ,指定video bit rate 为 1M/s(`-b:v`) , 然后打包输出为 Matroska container (output.mkv)。如果你要指定音频的码率就是 `-b:a` 。

#### 帧率

```bash
$ ffmpeg -i input.webm -c:a copy -c:v vp9 -r 30 output.mkv
```

> 从input.webm 复制音频编码类型，将视频编码设定为 vp9 , 视频的帧率设定为 30fps,输出到output.mkv



#### 视频画面demension(尺寸/分辨率)

可以使用FFmpeg调整视频的画面尺寸，最简单的方式是使用预定义的视频尺寸，了例如将一个视频设定为720p： 

```bash
$ ffmpeg -i input.mkv -c:a copy -s hd720 output.mkv
```

也可以自定义画面宽高：

```bash
$ ffmpeg -i input.mkv -c:a copy -s 1280x720 output.mkv
```

> :warning: 指定画面尺寸，即size, 改参数的指定格式是 `-s 宽x高` .

FFmepg 有非常多的预定义视频尺寸，文章结尾的[附件1](#附件1)，

### 1.7 截取（裁剪）多媒体文件

以视频为例，如果你需要剪切视频，可能会优先使用视频剪辑软件更加方便，但是如果你知道从哪里到哪里需要剪辑，FFmpeg只需要一条命令就可以完成了。

```bash
$ ffmpeg -i input.mkv -c:av copy -ss 00:01:00 -t 10 output.mkv
```

> 从input.mkv 将音视频流解编码规则复制，（`-c:av copy`）, 然后从 00:01:00 处开始剪辑(`-ss 00:01:00`), 向后剪切 10s的时长 (`-t 10 `), 然后将这10 s的视频输出到 output.mkv 文件。

### 1.8 提取音频

```bash
$ ffmpeg -i input.mkv -vn outputaudio.ogg
```

> `-vn` 选线指的是，仅对音频处理。  这里没有指定音频编码，默认的会使用 Vorbis 编码。 整段指令的意思就是 将input.mkv 中的音频，以默认编码Vorbis 输出到outputaudio.ogg 文件。



### 1.9 视频转GIF

有一个很有意思的方式，是将一段视频转换Gif动态图。

```bash
$ ffmpeg -i input.mkv output.gif
```

> 转Gif的时候，文件大小很值得研究，通过以上最简单的指令，会最大化的保留源视频的细节，我做尝试，一段15min， 70MB 的视频转Gif 有513MB， 且我通过firefox 打开才能流畅观看。 普通的看图软件还看不了。所以一般来讲，转Gif 适合短视频。

---

## 2. 一些常用示例

### 2.0 查看文件信息

查看文件详细信息：

```bash
$ ffprobe -i abc.MOV -hide_banner 
```

```bash
$ ffmpeg -i abc.MOV -hide_banner
```

### 2.1 查看支持的解码和编码

```bash
$ ffmpeg -decoders
$ ffmpeg -encoders
```

### 2.2 常用格式转换

#### 2.2.1 视频：

mp4 -> webm

```bash
$ ffmpeg -i input.mp4 output.webm
```

mov -> mp4

```bash
$ ffmpeg -i input.mov output.mp4
```

> 指定编码格式：
>
> ```bash
> $ ffmpeg -i input.mov -vcodec h264 -acodec acc output.mp4
> ```

mp4 -> flv

```bash
$ ffmpeg -i input.mp4 -acodec copy -vcodec copy -f output.flv
```



#### 2.2.2 音频：

```bash
$ ffmpeg -i input.mp3 output.ogg
```

> 指定编码格式：
>
> ```bash
> $ ffmpeg -i input.mp3 -c:a libopus output.ogg
> ```



### 2.3 视频画面旋转

```bash
$ ffmpeg -i input.mp4 -metadata:s:v rotate="90" output.mp4
```

### 2.4 设定视频比特率

```bash
$ ffmpeg -i input.avi -b:v 64k  output.avi
```

### 2.5 设定视频帧速率

```bash
$ ffmpeg -i input.avi -r 24 output.avi
```

> 将输入文件的帧速率（仅适用于原始格式）强制为1 fps，将输出文件的帧速率强制为24 fps:
>
> ```bash
> $ ffmpeg -r 1 -i input.m2v -r 24 output.avi
> ```

### 2.6 修改画面大小

```bash
$ ffmpeg -vcodec mpeg4 -b 1000 -r 10 -g 300 -i input.mp4 -s 800x600 output.mp4
```

### 2.7 限定文件大小

```bash
$ ffmpeg -i input.mp4 -fs 70M output.mp4
```

这个能力看似nb，其实很容易遇到问题，它确实能输出你想要的文件大小，但是，如果你设定的值小过原视频太多，那么输出的文件会自动剪掉超出的部分。 例如原本80M的文件，你指定输出为10M， 那么这个视频可能从15min，减到几十秒。如果要调整一个视频文件的大小，最有效的方式是修改分辨率、码率、帧率。 可以见上面提到的部分[跳转](#1.6 为每个stream设定质量)

## 3. 更多（进一步了解ffmpeg 和 使用）

FFmpeg 非常的强大，几乎能做到所有多媒体文件在文件层面的处理操作。 同时使得它也非常的复杂，光文档就被分为了：

-  **Command Line Tools Documentation**

-  **Libraries Documentation**

-  **API Documentation**

-  **Components Documentation**

-  **General Documentation**

-  **Community Contributed Documentation**

但是普通非专业人员，平常使用顶多也就是视频的转码。所以这里只专注于视频相关的基本命令行操作。 对应文档中的内容为：

```bash
Command Line Tools Documentation
	|____ffmpeg Documentation
			|____1.Synopsis
			|____5.Options
					|____5.2 Generic Options
					|____5.4 Main Options
					|____5.5 Video Options
					|____5.6 Advanced Video Options
```

### 3.1 语法格式

```bash
$ ffmpeg [global_options] {[input_file_options] -i input_url} ... {[output_file_options] output_url} ...
```

简单描述：`[]` 包裹的内容指的是 可选。

### 3.2 转码过程图解：

```bash
 _______              ______________
|       |            |              |
| input |  demuxer   | encoded data |   decoder
| file  | ---------> | packets      | -----+
|_______|            |______________|      |
                                           v
                                       _________
                                      |         |
                                      | decoded |
                                      | frames  |
                                      |_________|
 ________             ______________       |
|        |           |              |      |
| output | <-------- | encoded data | <----+
| file   |   muxer   | packets      |   encoder
|________|           |______________|


```

简单描述：`ffmpeg` 调用 libavformat 库（包含demuxers和muxer库，demuxer 指的是音视频分离）去读取文件，获取到包含编码数据的包。 如果有多个输入文件，`ffmpeg` 将会根据时间戳尝试同步的进行读取。 

编码的数据包随后被传入解码器（decoder），解码器处理出未压缩的帧（decoded frames），然后通过过滤处理(Filtering,下面专门说明)后，被传入编码器。 编码器对这些帧数据进行编码并输出编码后的数据包，最后被传到 muxer，将音视频合二为一后写入到输出文件。

**关于过滤器**

在编码之前，会先对解码帧进行过滤处理。过滤处理就是一些额外处理，由一个个过滤器组成过滤图。根据输入输出的不同可以分为简单、复杂过滤图。 过滤器来自libavfilter 库。

**关于流复制 和 流选择**

在ffmpeg 中有一个重要的概念，就是流。 处理视频实际是处理视频流，处理音频实际是处理音频流。 

流复制即 Stream copy ， 这是`-codec` 解编码器的一个选——<span style="color:red">`copy`</span> ，该选项会让`ffmpeg` 对<span style="color:yellow">指定范围</span>的流忽略掉解码和编码的步骤，仅做`demuxing` 和 `muxing` 处理，即仅仅在读取的时候将音视频拆分，然后重新封装处理。 <span style="color:red">这在仅需要修改容器格式，和容器层级的元数据信息非常有用。</span>在ffmpeg 中，把视频的文件格式，称作容器格式，container format, 也就是abc.mp4 和 abc.mov 只是容器格式不同，在相互转换的时候，如果我们不需对视频进行帧处理，例如修改编码解码类型等操作，就压根不需要解码和编码过程，只需要将音视频demuxing 处理分解后，在合并通过muxing处理，写入到新的容器格式就完成了格式转换。 

类似这样的过程：


```bash
 _______              ______________            ________
|       |            |              |          |        |
| input |  demuxer   | encoded data |  muxer   | output |
| file  | ---------> | packets      | -------> | file   |
|_______|            |______________|          |________|
```


由于这里并没进行解码->编码处理过程，因此处理过程会非常的快，并且没有质量丢失。然而会有可能因为很多因素所以不能正常执行。 这时候，添加过滤器也行不通，因为，过滤器基于解压的数据工作。

**流选择**： 刚才说了ffmepg 在处理音视频的时候实际上是在处理数据流，因此在对流进行处理的时候，通常需要先选中流范围。 `ffmpeg` 为给每个输出文件手动选择流提供了 <span style="color:red">`-map`</span>选项。 用户可以跳过`-map` 选项，让ffmpeg 自动的进行流选择。 具体的 `-vn / -an / -sn / -dn` 选项能够分别用于跳过视频，音频，字幕，data 流选择。

### 3.3 选项

通常的，所有的数字选项，如果不是特别指定，都接受一个数字作为输入，后面可以跟上一个单位，可以是 `K` , `M` , `G` ，也可以是 `KB` `MiB` `B`.... ,如 ： `200M`。

如果，一个选项不带参数，则说明这个参数是一个布尔类型。 如果指定了该参数则默认的就是将对应参数值设定为true， 如果你需要指定该参数值为false， 在前面加上no就可以了。 例如 `-foo` 即 `foo = true`, 那么 `-nofoo` 则是`foo = false` 。

#### 3.3.1 流说明符 （Stream specifiers）

有一些选项，会按流应用，例如 比特率（bitrate）或者 编解码器(codec)。 流说明符用于精确的指定所给选项所属的流。 

流说明符通常是附加到选项名称，由冒号分隔的字符串。 

例如：`-codec:a:1 ac3` 就包含了`a:1` 流说明符， 它将会匹配第二段音频流。 此外他将会选择`ac3` 解编码器对其处理。 

一个流说明符能够匹配多个流，因此，所指定的选项将会应用于所以匹配到的流。 例如 `-b:a 128k` 将会匹配到左右的音频流。 

一个空的流说明符将会匹配所有的流，例如：`-codec copy` 或者 `-codec: copy` 将会免重编码地复制所有的流。

流说明符的可能形式如下：

- `stream_index` : 匹配指定索引的流。 例如 `-threads:1 4` 将会设定第二个流的线程数设置为 4 ，如果 *stream_index*  作为另一个流说明符（见下面），那么它将会从匹配的流中选中对应编号 *stream_index* 的流。 流编号基于流被检测到的顺序。 

- `stream_type[:additional_stream_specifier]`: stream_type是以下之一：

  | stream_type | 含义                                                         |
  | ----------- | ------------------------------------------------------------ |
  | `v` or `V`  | video，`v` : 匹配所有视频，`V`仅匹配未附带图片，视频缩略图或封面艺术的视频流。 |
  | `a`         | audio                                                        |
  | `s`         | subtitle                                                     |
  | `d`         | data                                                         |
  | `t`         | attachment                                                   |

  > `[:additional_stream_specifier]` 指的是可选的
  >
  > 如果指定了`additional_stream_specifier`的话，将会匹配即是该指定`type` ，同时又匹配指定`additional_stream_specifier`条件的流。  否则，不指定的化，就会匹配所有指定该`type`的流。
  >
  > 例如：`-codec:a:1 ac3` 就包含了`a:1` 流说明符， 它将会匹配第二段音频流。 此外他将会选择`ac3` 解编码器对其处理。 

- 还有几个用的比较少的：

  > - p:program_id[:additional_stream_specifier]
  >
  > - stream_id or i:stream_id
  >
  > - u

#### 3.3.2 通用选项

通用选项非常的多，并且这些选项在ff *工具之间共享。大都是一些帮助、辅佐类的选项，下面简单说了几个可能用到的选项，并列出了一些简要信息。

- `-h` , `--help`  查看帮助：如：

  ```bash
  $ ffmpeg -h decoder=decoder_name
  $ ffmpeg -h protocol=protocol_name
  ```

- `-hide_banner` 隐藏横幅：

  默认的 ff* 执行后，会打印出ffmpeg 的版权，版本等等一大串信息。如果不想看到可以使用 `-hide_banner` 不显示。例如：

  ```bash
  $ ffprobe -i abc.MOV #将会显示横幅
  $ ffprobe -i abc.MOV -hide_banner #不显示横幅信息
  ```

  > `ffprobe` 用于查看文件详细信息。 

```shell
#简单列出部分
-L	#Show license.
-h, -?, -help, --help [arg]	#Show help
-version	#Show version.
-buildconf  #Show the build configuration, one option per line.
-formats	#Show available formats (including devices).
-demuxers	#Show available demuxers.
-muxers	#Show available muxers.
-devices	#Show available devices.
-codecs	#Show all codecs known to libavcodec.
-decoders	#Show available decoders.
-encoders	#Show all available encoders.
-bsfs	#Show available bitstream filters.
-protocols	#Show available protocols.
-filters	#Show available libavfilter filters.
-pix_fmts	#Show available pixel formats.
-sample_fmts	#Show available sample formats.
-layouts	#Show channel names and standard channel layouts.
-colors	#Show recognized color names.
-hide_banner	#Suppress printing banner. -nohide_banner： show banner
......
```

> 更多的，请查看[这里](https://www.ffmpeg.org/ffmpeg.html#Generic-options)。不做过多说明。



#### 3.3.3 主选项

- `-i` : 设置输入文件名。
- `-f` : 设置输出格式。
- `-y` : 若输出文件已存在时则覆盖文件。
- `-fs` : 超过指定的文件大小时则结束转换。
- `-t` : 指定输出文件的持续时间，以秒为单位。
- `-ss` ：从指定时间开始转换，以秒为单位。
- `-t` 从 `-ss` 时间开始转换，（如 `-ss 00:00:01.00 -t 00:00:10.00 即从 00:00:01.00 开始到 00:00:11.00)。
- `-title` ：设置标题。
- `-timestamp` : 设置时间戳。
- `-vsync` : 增减Frame 使影音同步。 
- `-c` ：指定输出文件的编码。
- `-metadata` : 更改输出文件的元数据。

#### 3.3.4 视频选项

**影像参数：**

- `-b:v` : 设置影像流量，默认为200kit/s 。
- `-r[:stream_specifier] fps (input/output,per-stream)` : 设置帧率值，默认为25。
- `-fpsmax[:stream_specifier] fps (output,per-stream)`: 设置最大帧率值
- `-s[:stream_specifier] size (input/output,per-stream)` : 设置画面的宽与高。
- `-aspect[:stream_specifier] aspect (output,per-stream)` : 设置画面的比例。
- `-vn` : 不处理影像，于仅针对声音做处理时使用。
- `-vcodec( -c:v )` : 设置影像影像编解码器，未设置时则使用与输入文件相同之编解码器。





## 附件1

| 预定视频尺寸简写 | 实际值    |
| ---------------- | --------- |
| `sqcif`          | 128x96    |
| `qcif`           | 176x144   |
| `cif`            | 352x288   |
| `4cif`           | 704x576   |
| `16cif`          | 1408x1152 |
| `qqvga`          | 160x120   |
| `qvga`           | 320x240   |
| `vga`            | 640x480   |
| `svga`           | 800x600   |
| `xga`            | 1024x768  |
| `uxga`           | 1600x1200 |
| `qxga`           | 2048x1536 |
| `sxga`           | 1280x1024 |
| `qsxga`          | 2560x2048 |
| `hsxga`          | 5120x4096 |
| `wvga`           | 852x480   |
| `wxga`           | 1366x768  |
| `wsxga`          | 1600x1024 |
| `wuxga`          | 1920x1200 |
| `woxga`          | 2560x1600 |
| `wqsxga`         | 3200x2048 |
| `wquxga`         | 3840x2400 |
| `whsxga`         | 6400x4096 |
| `whuxga`         | 7680x4800 |
| `cga`            | 320x200   |
| `ega`            | 640x350   |
| `hd480`          | 852x480   |
| `hd720`          | 1280x720  |
| `hd1080`         | 1920x1080 |





## 参考：

http://ffmpeg.org/ffmpeg.html

https://www.cnblogs.com/yuancr/p/7272321.html

https://opensource.com/article/17/6/ffmpeg-convert-media-file-formats

https://gist.github.com/ViktorNova/1dd68a2ec99781fd9adca49507c73ee2

https://en.wikipedia.org/wiki/FFmpeg

https://zhidao.baidu.com/question/1767762723365407060.html

https://zhidao.baidu.com/question/325642341.html?qbl=relate_question_1&word=%B1%C8%CC%D8%C2%CA%B6%D4%CA%D3%C6%B5%B5%C4%D3%B0%CF%EC

https://linux.die.net/man/1/ffmpeg

...
