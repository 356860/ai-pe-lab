# AI PE Lab

`AI PE Lab` 是一个面向浏览器的 AI 体育互动开源实验场。

这个仓库聚焦一个很具体、也很实用的方向：把全身姿态识别转化成可以直接用于课堂、公开展示和二次开发的体育互动体验，而且尽量保持 `零安装、易部署、易复用`。

## 这个项目想解决什么

- 探索 `MediaPipe Pose` 如何从“演示效果”走向“真实教学互动”。
- 让老师和开发者都能用静态托管快速跑起一个 AI 体育示例。
- 把每个示例都做成可以阅读、修改、扩展的开源参考，而不是一次性成品。

## 当前重点

目前仓库里第一个打磨完成的公开示例是：

- [三关体育闯关](./examples/three-stage-adventure/)

这个示例把学生的身体动作映射成三段连续的课堂挑战：

- `0-50 米`：森林奔跑，躲避障碍、跳过木桩
- `50-100 米`：激流划船，双臂摆动越稳定，速度越快
- `100 米以后`：礁石跳跃，选择方向并双脚起跳落点

## 设计原则

- 浏览器优先：示例应该能直接部署到 GitHub Pages 这类静态托管平台
- 课堂友好：学生和老师在很短时间内就能理解玩法
- 开源优先：代码结构应当方便查看、修改、复用
- 保持轻量：尽量减少不必要的依赖，便于公开维护和社区贡献

## 适合谁使用

- 想尝试 AI 体育课堂互动的老师
- 想研究姿态驱动交互的开发者
- 需要零安装浏览器示例的培训、工作坊或展示场景
- 对教育工具、动作交互、轻量 3D 浏览器体验感兴趣的开源贡献者

## 快速开始

1. 克隆或下载本仓库
2. 用任意静态文件服务器启动目录
3. 在支持摄像头权限的现代浏览器中打开示例页面

如果你本地装了 Node.js，可以直接运行：

```bash
npx serve .
```

然后访问：

```text
/examples/three-stage-adventure/
```

## 仓库结构

```text
ai-pe-lab/
  docs/
  examples/
    three-stage-adventure/
      index.html
      README.md
      src/
```

## 当前已经具备的内容

- 一个按 `scene / pose / game / ui / audio` 模块拆分的浏览器示例
- 一套适合公开展示的中文项目说明
- 可直接部署到 GitHub Pages 或任意 CDN 的静态结构
- 面向后续扩展的文档、截图和发布素材

## 截图

<p align="center">
  <img src="./docs/screenshots/three-stage-start.png" alt="开始页" width="49%">
  <img src="./docs/screenshots/three-stage-forest.png" alt="森林模式" width="49%">
</p>
<p align="center">
  <img src="./docs/screenshots/three-stage-river.png" alt="激流模式" width="49%">
  <img src="./docs/screenshots/three-stage-reef.png" alt="礁石模式" width="49%">
</p>

## 维护重点

- 持续优化课堂动作识别的稳定性
- 让示例代码对第一次进入仓库的人也足够友好
- 增加更多可以直接复用的小型体育互动玩法
- 补足部署说明、教学场景说明和使用案例

## 路线图

- 补充演示视频或 GIF
- 增加成绩记录和结果总结面板
- 把关键阈值做成简单可配置项
- 提取多个示例共用的姿态工具模块
- 在 `examples/` 下继续加入新的体育互动小游戏

## 参与贡献

欢迎参与贡献，比较适合入手的方向包括：

- 手机和平板浏览器兼容性
- 姿态阈值调优
- 反馈提示和无障碍体验
- 文档、截图、演示和教学部署说明

可以先看 [CONTRIBUTING.md](./CONTRIBUTING.md)。

## 开源协议

本项目使用 [MIT License](./LICENSE)。

