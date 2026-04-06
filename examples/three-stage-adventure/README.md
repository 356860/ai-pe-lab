# 三关体育闯关

`three-stage-adventure` 是 `AI PE Lab` 里的第一个公开浏览器示例。

它的目标不是只做一个小游戏，而是展示：同一套姿态输入管线，怎样驱动多个课堂动作模式，并且保持结构清晰、易于复用。

## 三段玩法

- `森林关`：原地跑步、跳过木桩
- `激流关`：双臂摆动划船加速
- `礁石关`：选择方向并双脚起跳落点

## 这个示例展示了什么

- 使用 `MediaPipe Pose` 获取全身姿态输入
- 使用 `Three.js` 渲染纯浏览器 3D 场景
- 用一个小型状态机串联多阶段课堂玩法
- 通过静态托管实现零安装部署

## 动作映射

- 准备阶段举起一只手，用于开始校准
- 身体横向偏移决定当前方向或落点选择
- 双脚同时离地会被判定为跳跃
- 连续摆臂会提升奔跑或划船阶段的速度

## 运行方式

使用任意静态文件服务器启动仓库目录，然后访问：

```text
/examples/three-stage-adventure/
```

建议在支持摄像头权限的现代桌面浏览器中运行。

## 截图

<p align="center">
  <img src="../../docs/screenshots/three-stage-start.png" alt="开始页" width="49%">
  <img src="../../docs/screenshots/three-stage-forest.png" alt="森林模式" width="49%">
</p>
<p align="center">
  <img src="../../docs/screenshots/three-stage-river.png" alt="激流模式" width="49%">
  <img src="../../docs/screenshots/three-stage-reef.png" alt="礁石模式" width="49%">
</p>

## 源码结构

- `src/config.js`：游戏常量和文案
- `src/audio.js`：语音播报和浏览器音效
- `src/ui.js`：DOM 更新和开始页交互
- `src/scene.js`：Three.js 场景、人物和障碍物
- `src/game.js`：核心状态机、记分和流程逻辑
- `src/pose.js`：MediaPipe Pose 与摄像头初始化
- `src/main.js`：页面入口

## 已知限制

- 动作阈值目前更偏向演示用途，仍需继续调优
- 当前版本还没有保存历史成绩
- 真实课堂环境中的光线、机位和距离会影响识别质量

## 下一步可以继续优化

- 增加结果总结面板
- 把阈值做成可配置项
- 增加成绩持久化
- 为每一关添加更多障碍变化
- 在仓库首页加入 GIF 或更短的视频演示

