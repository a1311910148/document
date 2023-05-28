# 使用 buildx 构建多种系统架构支持的 Docker 镜像

在之前的版本中构建多种系统架构支持的 Docker 镜像，要想使用统一的名字必须使用 [`$ docker manifest`](../image/manifest.md) 命令。

在 Docker 19.03+ 版本中可以使用 `$ docker buildx build` 命令使用 `BuildKit` 构建镜像。该命令支持 `--platform` 参数可以同时构建支持多种系统架构的 Docker 镜像，大大简化了构建步骤。

## 新建 `builder` 实例

Docker for Linux 不支持构建 `arm` 架构镜像，我们可以运行一个新的容器让其支持该特性，Docker 桌面版无需进行此项设置。

```bash
$ docker run --rm --privileged tonistiigi/binfmt:latest --install all
```

由于 Docker 默认的 `builder` 实例不支持同时指定多个 `--platform`，我们必须首先创建一个新的 `builder` 实例。同时由于国内拉取镜像较缓慢，我们可以使用配置了 [镜像加速地址](https://github.com/moby/buildkit/blob/master/docs/buildkitd.toml.md)  的 [`dockerpracticesig/buildkit:master`](https://github.com/docker-practice/buildx) 镜像替换官方镜像。

> 如果你有私有的镜像加速器，可以基于 https://github.com/docker-practice/buildx 构建自己的 buildkit 镜像并使用它。

```bash
# 适用于国内环境
$ docker buildx create --use --name=mybuilder-cn --driver docker-container --driver-opt image=dockerpracticesig/buildkit:master

# 适用于腾讯云环境(腾讯云主机、coding.net 持续集成)
$ docker buildx create --use --name=mybuilder-cn --driver docker-container --driver-opt image=dockerpracticesig/buildkit:master-tencent

# $ docker buildx create --name mybuilder --driver docker-container

$ docker buildx use mybuilder
```

## 构建镜像

新建 Dockerfile 文件。

```docker
FROM --platform=$TARGETPLATFORM alpine

RUN uname -a > /os.txt

CMD cat /os.txt
```

使用 `$ docker buildx build` 命令构建镜像，注意将 `myusername` 替换为自己的 Docker Hub 用户名。

`--push` 参数表示将构建好的镜像推送到 Docker 仓库。

```bash
$ docker buildx build --platform linux/arm,linux/arm64,linux/amd64 -t myusername/hello . --push

# 查看镜像信息
$ docker buildx imagetools inspect myusername/hello
```

在不同架构运行该镜像，可以得到该架构的信息。

```bash
# arm
$ docker run -it --rm myusername/hello
Linux buildkitsandbox 4.9.125-linuxkit #1 SMP Fri Sep 7 08:20:28 UTC 2018 armv7l Linux

# arm64
$ docker run -it --rm myusername/hello
Linux buildkitsandbox 4.9.125-linuxkit #1 SMP Fri Sep 7 08:20:28 UTC 2018 aarch64 Linux

# amd64
$ docker run -it --rm myusername/hello
Linux buildkitsandbox 4.9.125-linuxkit #1 SMP Fri Sep 7 08:20:28 UTC 2018 x86_64 Linux
```

## 架构相关变量

`Dockerfile` 支持如下架构相关的变量

**TARGETPLATFORM** 

构建镜像的目标平台，例如 `linux/amd64`, `linux/arm/v7`, `windows/amd64`。

**TARGETOS** 

`TARGETPLATFORM` 的 OS 类型，例如 `linux`, `windows`

**TARGETARCH** 

`TARGETPLATFORM` 的架构类型，例如 `amd64`, `arm`

**TARGETVARIANT**

`TARGETPLATFORM` 的变种，该变量可能为空，例如 `v7`

**BUILDPLATFORM**

构建镜像主机平台，例如 `linux/amd64`

**BUILDOS** 

`BUILDPLATFORM` 的 OS 类型，例如 `linux`

**BUILDARCH** 

`BUILDPLATFORM` 的架构类型，例如 `amd64`

**BUILDVARIANT** 

`BUILDPLATFORM` 的变种，该变量可能为空，例如 `v7`

### 使用举例

例如我们要构建支持 `linux/arm/v7` 和 `linux/amd64` 两种架构的镜像。假设已经生成了两个平台对应的二进制文件：

* `bin/dist-linux-arm`
* `bin/dist-linux-amd64`

那么 `Dockerfile` 可以这样书写：

```docker
FROM scratch

# 使用变量必须申明
ARG TARGETOS

ARG TARGETARCH

COPY bin/dist-${TARGETOS}-${TARGETARCH} /dist

ENTRYPOINT ["dist"]
```
