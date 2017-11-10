var log = console.log.bind(this)

// 全局变量
var hots = [] // 存储热点对象
var angle = { x: 0.0, y: 0.0, } // 当前angle
var curElement = null // 当前正在操作的热点
var panoScene = document.querySelector('.main') // 全景场景
var titleInput = document.querySelector('.options .text') // 标题输入框
var isEditing = false // 是否在编辑热点
var isPreview = false // 是否在预览

// 场景全景图的地址
var panoUrl

// var hotsInfo = [] // 场景的热点信息
var hotsInfo

var infos = {
  curInfoIndex: 0,
  allInfos: [
    {
      panoUrl: '1.jpg',
      hotsInfo: [
        {
          angle: { x: 1.0740625, y: -0.4886666666666665 },
          aniType: "ahead",
          bottom: 272,
          left: 479,
          title: "aaa",
          jumpTo: 1,
          eventType: '切换',
          eventValue: ''
        },
        {
          angle: { x: 1.0740625, y: -0.4886666666666665 },
          aniType: "turnleft",
          bottom: 232,
          left: 354,
          title: "bbb",
          jumpTo: 2,
          eventType: '切换',
          eventValue: ''
        }
      ]
    },
    {
      panoUrl: './resources/llj.jpg',
      hotsInfo: [
        {
          angle: { x: 1.0740625, y: -0.4886666666666665 },
          aniType: "ahead",
          bottom: 272,
          left: 479,
          title: "aaa",
          jumpTo: 0,
          eventType: '切换',
          eventValue: ''
        },
        {
          angle: { x: 1.0740625, y: -0.4886666666666665 },
          aniType: "turnleft",
          bottom: 232,
          left: 354,
          title: "bbb",
          jumpTo: 2,
          eventType: '切换',
          eventValue: ''
        }
      ]
    },
    {
      panoUrl: './resources/ddd.png',
      hotsInfo: [
        {
          angle: { x: 1.0740625, y: -0.4886666666666665 },
          aniType: "ahead",
          bottom: 272,
          left: 479,
          title: "aaa",
          jumpTo: 0,
          eventType: '切换',
          eventValue: ''
        },
        {
          angle: { x: 1.0740625, y: -0.4886666666666665 },
          aniType: "turnleft",
          bottom: 232,
          left: 354,
          title: "bbb",
          jumpTo: 1,
          eventType: '切换',
          eventValue: ''
        }
      ]
    }
  ]
}

// 加载场景所需信息
loadInfo(infos)

// 单选框事件
var isShowItems = false
var selectValue = document.querySelector('.value')
var items = document.querySelector('.options .singleSelect .items')
selectValue.addEventListener('click', function () {
  if (!isShowItems) {
    items.style.display = 'block'
    isShowItems = true
  } else {
    items.style.display = 'none'
    isShowItems = false
  }
})

items.addEventListener('click', function (e) {
  selectValue.innerText = e.target.innerText
  items.style.display = 'none'
  isShowItems = false
})

// 点击icons向场景中添加热点
var icons = document.querySelector('.icons')
icons.addEventListener('click', function (e) {
  if (!curElement) {
    curElement = document.createElement('div')
  }

  var curLeft = curElement.style.left || 750
  var curBottom = curElement.style.bottom || 250
  var curAnitype = e.target.dataset.anitype

  while (curElement.firstChild) {
    curElement.removeChild(curElement.firstChild)
  }

  // 添加热点所需要的配置信息
  addHotOptions(curElement, curLeft, curBottom, '', curAnitype, angle)
  // 添加鼠标拖拽事件
  addEventDrag(curElement)

  curElement.classList.add('active')
  panoScene.appendChild(curElement)
})

// 为场景中热点添加点击事件
document.addEventListener('click', hotClick)

function hotClick(e) {
  var hot = null
  if (e.target.classList.contains('hot')) {
    hot = e.target
  }
  if (e.target.parentNode.classList.contains('hot')) {
    hot = e.target.parentNode
  }

  if (hot && !isEditing) {
    isEditing = true
    hot.classList.add('active')
    titleInput.value = hot.dataset.title || ''

    document.querySelector('.options .singleSelect .value').innerText = hot.dataset.eventType
    document.querySelector('.options .type_value').value = hot.dataset.eventValue

    curElement = hot
  }
}

// 为标题输入框添加事件
titleInput.oninput = function (e) {
  var title = curElement.querySelector('.title')
  if (title) {
    title.innerText = this.value
    curElement.dataset.title = this.value
  }
}

// 完成、删除、预览按钮事件
var finishBtn = document.querySelector('.options .finish')
var deleteBtn = document.querySelector('.options .delete')
var previewBtn = document.querySelector('.options .preview')

finishBtn.addEventListener('click', function () {
  if (curElement) {
    var curHotInfo = {
      left: parseFloat(curElement.style.left),
      bottom: parseFloat(curElement.style.bottom),
      title: titleInput.value,
      aniType: curElement.dataset.aniType,
      eventType: document.querySelector('.options .value').innerText || '选择热点类型',
      eventValue: document.querySelector('.options .type_value').value || '',
      angle: angle,
    }

    var index = curElement.dataset.index
    if (index) {
      hotsInfo[index] = curHotInfo
    } else {
      hotsInfo.push(curHotInfo)
      curElement.dataset.index = hots.length - 1
    }

    infos.allInfos[infos.curInfoIndex].hotsInfo = hotsInfo
    log(infos)

    curElement.classList.remove('active')
    titleInput.value = ''
    curElement = document.createElement('div')
    isEditing = false
  }
})

previewBtn.addEventListener('click', function () {
  if (previewBtn.innerText === '预览') {
    if (curElement) {
      curElement.classList.remove('active')
    }
    document.removeEventListener('click', hotClick)
    previewBtn.innerText = '编辑'
    isPreview = true
  }
})

/**
 * @description 把元素转换成热点
 * @param {HTMLElement} element 需要转换成热点的元素
 * @param {Number} left 热点距离场景左边的距离
 * @param {NUmber} bottom 热点距离场景右边的距离
 * @param {String} title 热点的标题
 * @param {String} animationType 热点的动画类型
 */
function addHotOptions(element, left, bottom, title, animationType, angle) {
  element.classList.add('hot')
  element.style.left = left + 'px'
  element.style.bottom = bottom + 'px'

  var div = document.createElement('div')
  div.classList.add('title')
  div.innerText = title
  element.appendChild(div)

  element.dataset.aniType = animationType
  setAniType(element, animationType)

  var cWidth = document.querySelector('canvas').getAttribute('width')
  var cHeight = document.querySelector('canvas').getAttribute('height')
  hots.push(new HotSpot(element, cWidth, cHeight, left, bottom, angle))
}

/**
 * @description 为元素添加动画
 * @param {HTMLElement} element 需要添加动画的元素
 * @param {String} animationType 动画类型
 */
function setAniType(element, animationType) {
  if (animationType === 'ahead') {
    var ahead1 = document.createElement('div')
    ahead1.classList.add('ahead1', 'arrow')

    var ahead2 = document.createElement('div')
    ahead2.classList.add('ahead2', 'arrow')

    element.appendChild(ahead1)
    element.appendChild(ahead2)
  }

  if (animationType === 'turnleft') {
    var turnleft = document.createElement('div')
    turnleft.classList.add('turnleft', 'arrow')

    element.appendChild(turnleft)
  }

  if (animationType === 'turnright') {
    var turnright = document.createElement('div')
    turnright.classList.add('turnright', 'arrow')

    element.appendChild(turnright)
  }

  if (animationType === 'conturnleft') {
    var conturnleft1 = document.createElement('div')
    conturnleft1.classList.add('conturnleft1', 'arrow')

    var conturnleft2 = document.createElement('div')
    conturnleft2.classList.add('conturnleft2', 'arrow')

    element.appendChild(conturnleft1)
    element.appendChild(conturnleft2)
  }

  if (animationType === 'diffusion') {
    var point = document.createElement('div')
    point.classList.add('point')

    var ring = document.createElement('div')
    ring.classList.add('ring')

    element.appendChild(point)
    element.appendChild(ring)
  }
}

/**
 * @description 为元素添加拖拽事件
 * @param {HTMLElement} element 
 */
function addEventDrag(element) {
  var isDragging = false
  var lastX = 0
  var lastY = 0

  element.addEventListener('mousedown', function (e) {
    isDragging = true
    lastX = e.clientX
    lastY = e.clientY
  })

  element.ondragstart = function () {
    return false
  }

  element.addEventListener('mouseup', function (e) {
    isDragging = false

    var cWidth = document.querySelector('canvas').getAttribute('width')
    var cHeight = document.querySelector('canvas').getAttribute('height')
    var left = 0
    var bottom = 0

    left = parseFloat(element.style.left)
    bottom = parseFloat(element.style.bottom)

    hots.push(new HotSpot(element, cWidth, cHeight, left, bottom, angle))
  })

  document.addEventListener('mousemove', function (e) {
    if (isDragging === true) {
      hots.pop()
      var curLeft = parseFloat(element.style.left)
      var curBottom = parseFloat(element.style.bottom)
      var x = e.clientX - lastX
      var y = e.clientY - lastY
      element.style.left = curLeft + x + 'px'
      element.style.bottom = curBottom - y + 'px'
      lastX = e.clientX
      lastY = e.clientY
    }
  })
}

function loadInfo(infos) {
  var infoIndex = infos.curInfoIndex
  var allInfos = infos.allInfos
  panoUrl = allInfos[infoIndex].panoUrl
  hotsInfo = allInfos[infoIndex].hotsInfo

  if (hotsInfo) {
    for (var i = 0; i < hotsInfo.length; i++) {
      var hot = document.createElement('div')
      var hotInfo = hotsInfo[i]

      hot.dataset.jumpTo = parseInt(hotInfo.jumpTo)
      hot.dataset.index = i
      hot.dataset.eventType = hotInfo.eventType || '选择热点类型'
      hot.dataset.eventValue = hotInfo.eventValue || ''
      addHotOptions(hot, hotInfo.left, hotInfo.bottom, hotInfo.title, hotInfo.aniType, hotInfo.angle)
      addEventDrag(hot)
      hot.addEventListener('click', function () {

      })
      document.querySelector('.main').appendChild(hot)
    }
  }
}

// webgl
// Vertex shader program
var VSHADER_SOURCE =
  `attribute vec4 a_Position;
void main() {
  gl_Position = a_Position;
}`

// Fragment shader program
var FSHADER_SOURCE =
  `#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D u_Sampler;
uniform vec2 u_canvasSize;
uniform vec2 u_angle;
uniform float fov_h;

void main() {
  const float PI = 3.1415926;
  const float PI2 = 6.2831853;

  // calculate pixel size & source
  float f = 100.0;
  // float fov_h = 90.0;
  float cw = u_canvasSize.x;
  float ch = u_canvasSize.y;
  float sourcex = cw*0.5;
  float sourcey = ch*0.5;
  float pixelSize = f*tan(radians(fov_h *0.5))  / sourcex;

  //  to get real now point coord
  float x = (gl_FragCoord.x - sourcex) * pixelSize;
  float y = (gl_FragCoord.y - sourcey) * pixelSize;
  vec3 nowpoint = vec3( x,y,f );    

  //  form rotation matrix
  float phi = radians(90.0 - u_angle.y);
  float theta = radians(u_angle.x);

  // theta to rad & phi to rad

  mat3 Rtheta = mat3( cos(theta) ,    0      , sin(theta),
                          0      ,    1      ,     0     ,
                      -sin(theta),    0      , cos(theta));

  mat3 Rphi   = mat3(     1      ,     0     ,     0     ,
                          0      , cos(phi)  , -sin(phi) ,
                          0      , sin(phi)  , cos(phi));
  mat3 Rfinal = Rtheta*Rphi;

  // do rotation 
  vec3 newpoint = Rfinal * nowpoint;

  // calc sphrical coord
  float xx = newpoint.x;
  float yy = newpoint.y;
  float zz = newpoint.z;
  float r = sqrt(xx*xx+zz*zz);

  float orignal_theta = atan( xx, zz); // 
  float orignal_phi   = PI/2.0 - atan( -yy, r );

  float endx = orignal_theta / PI2;
  float endy = orignal_phi / PI;
  vec2 endPos = vec2(endx, endy);

  // correct map
  gl_FragColor = texture2D( u_Sampler, endPos );
}`

function main() {
  var canvas = document.querySelector("canvas");

  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    log('Failed to intialize shaders.');
    return;
  }

  // Set the vertex information
  var n = initVertexBuffers(gl);
  if (n < 0) {
    log('Failed to set the vertex information');
    return;
  }

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Set texture
  if (!initTextures(gl, n, canvas, panoUrl)) {
    log('Failed to intialize the texture.');
    return;
  }

  // 场景切换
  document.addEventListener('click', function (e) {
    var hot = null
    if (e.target.classList.contains('hot')) {
      hot = e.target
    }
    if (e.target.parentNode.classList.contains('hot')) {
      hot = e.target.parentNode
    }

    if (hot && hot.dataset.jumpTo && isPreview) {
      // 移除页面中所有热点
      var hots = document.querySelectorAll('.hot')
      for (var k = 0; k < hots.length; k++) {
        document.querySelector('.main').removeChild(hots[k])
      }

      // 加载新场景的热点
      infos.curInfoIndex = hot.dataset.jumpTo
      loadInfo(infos)

      // 跳转到新场景
      if (!initTextures(gl, n, canvas, panoUrl)) {
        log('Failed to intialize the texture.');
        return;
      }
    }
  })

  // Get the storage location of u_canvasSize
  var u_canvasSize = gl.getUniformLocation(gl.program, 'u_canvasSize');
  if (!u_canvasSize) {
    log('Failed to get the storage location of u_canvasSize');
    return false;
  }

  // set the size of the u_canvasSize
  gl.uniform2f(u_canvasSize, canvas.width, canvas.height);

  // Get the storage location of u_angle
  var u_angle = gl.getUniformLocation(gl.program, 'u_angle');
  if (!u_angle) {
    log('Failed to get the storage location of u_angle');
    return false;
  }

  // Get the storage location of u_fov_h
  var u_fov_h = gl.getUniformLocation(gl.program, 'fov_h');
  if (!u_fov_h) {
    log('Failed to get the storage location of fov_h');
    return false;
  }

  // set the size of the u_fov_h
  var curFov = 90
  var maxFov = 110
  var minFov = 70

  gl.uniform1f(u_fov_h, curFov);

  canvas.onmousewheel = function (e) {
    if (e.deltaY > 0) {
      curFov--
    } else {
      curFov++
    }
    if (curFov < minFov) {
      curFov = minFov
    }
    if (curFov > maxFov) {
      curFov = maxFov
    }
    gl.uniform1f(u_fov_h, curFov)
  }

  // 绑定鼠标事件
  initEventHandlers(canvas, angle)

  // 开始渲染
  var tick = function () {
    if (angle.x < 0) {
      angle.x += 1
    }
    gl.uniform2f(u_angle, angle.x * 360, -(angle.y * 180))
    for (var i = 0; i < hots.length; i++) {
      hots[i].changePos(angle)
    }
    gl.clear(gl.COLOR_BUFFER_BIT)  // Clear <canvas>
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, n)  // Draw the rectangle
    requestAnimationFrame(tick, canvas)
  }
  tick()
}

// init vertex buffers
function initVertexBuffers(gl) {
  var verticesTexCoords = new Float32Array([
    // Vertex coordinates, texture coordinate
    -1.0, 1.0, 0.0, 1.0,
    -1.0, -1.0, 0.0, 0.0,
    1.0, 1.0, 1.0, 1.0,
    1.0, -1.0, 1.0, 0.0,
  ]);
  var n = 4; // The number of vertices

  // Create the buffer object
  var vertexTexCoordBuffer = gl.createBuffer();
  if (!vertexTexCoordBuffer) {
    log('Failed to create the buffer object');
    return -1;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesTexCoords, gl.STATIC_DRAW);

  var FSIZE = verticesTexCoords.BYTES_PER_ELEMENT;
  //Get the storage location of a_Position, assign and enable buffer
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    log('Failed to get the storage location of a_Position');
    return -1;
  }
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 4, 0);
  gl.enableVertexAttribArray(a_Position);  // Enable the assignment of the buffer object

  return n;
}

function initTextures(gl, n, canvas, imageUrl) {
  var texture = gl.createTexture();   // Create a texture object
  if (!texture) {
    log('Failed to create the texture object');
    return false;
  }

  // Get the storage location of u_Sampler
  var u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
  if (!u_Sampler) {
    log('Failed to get the storage location of u_Sampler');
    return false;
  }

  var image = new Image();  // Create the image object
  if (!image) {
    log('Failed to create the image object');
    return false;
  }

  // Register the event handler to be called on loading an image
  image.onload = function () {
    loadTexture(gl, n, texture, u_Sampler, image);
    canvas.style.opacity = '1'
  };

  // Tell the browser to load an image
  image.src = imageUrl;

  return true;
}

function loadTexture(gl, n, texture, u_Sampler, image) {
  // Flip the image's y axis
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE0);

  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler, 0);

  gl.clear(gl.COLOR_BUFFER_BIT);   // Clear <canvas>

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // Draw the rectangle
}

function initEventHandlers(canvas, angle) {
  // 是否在拖动
  var dragging = false;

  // 鼠标上一次停留的位置
  var lastX = 0, lastY = 0;

  // 鼠标按下
  canvas.onmousedown = function (e) {
    dragging = true
  }

  // 鼠标释放
  canvas.onmouseup = function (e) {
    dragging = false
  }

  canvas.onmousemove = function (e) { // 鼠标移动
    var x = e.clientX, y = e.clientY
    if (dragging) {
      var factorY = 0.5 / canvas.height // y方向上平移率
      var factorX = 0.5 / canvas.width // x方向上平移率
      var dx = factorX * (x - lastX)
      var dy = -(factorY * (y - lastY))
      angle.x = angle.x - dx
      angle.y = angle.y + dy
      if (angle.y > 0) {
        angle.y = 0
      }
      if (angle.y < -1) {
        angle.y = -1
      }
    }
    lastX = x, lastY = y
  }
}

// 场景内热点
function HotSpot(element, canvasWidth, canvasHeight, x, y, angle) {
  this.element = element
  var sourcex = canvasWidth * 0.5
  var sourcey = canvasHeight * 0.5
  var pixelSize = 100 / sourcex

  // 数学计算
  var cos = Math.cos
  var sin = Math.sin
  var PI = Math.PI
  var sqrt = Math.sqrt

  // 计算出当前的弧度
  var theta = angle.x * 360 * PI / 180
  var phi = (90 + angle.y * 180) * (PI / 180)

  // 计算出A B的值
  var xx = cos(theta) * (x - sourcex) * pixelSize + sin(theta) * sin(phi) * (y - sourcey) * pixelSize - 100 * sin(theta) * cos(phi)
  var yy = cos(phi) * (y - sourcey) * pixelSize + 100 * sin(phi)
  var zz = sin(theta) * (x - sourcex) * pixelSize - cos(theta) * sin(phi) * (y - sourcey) * pixelSize + 100 * cos(theta) * cos(phi)
  var r = sqrt(xx * xx + zz * zz)

  this.A = xx / zz
  this.B = -yy / r

  this.changePos = function (angle) {
    // 计算出当前的弧度
    var theta = angle.x * 360 * PI / 180
    var phi = (90 + angle.y * 180) * (PI / 180)

    // 实时更新热点位置
    var a = cos(theta)
    var b = sin(theta)
    var c = cos(phi)
    var d = sin(phi)
    var A = this.A
    var B = this.B

    var y = (100 * a * c + 100 * d / (B * sqrt(A * A + 1)) + 100 * b * (b * c + A * a * c) / (a - A * b)) / ((b * (b * d + A * a * d) / (a - A * b)) - (c / (B * sqrt(A * A + 1))) + a * d)
    var x = (100 * (b * c + A * a * c) - (b * d + A * a * d) * y) / (a - A * b)

    var lastX = ((x / pixelSize) + sourcex)
    var lastY = ((y / pixelSize) + sourcey)

    this.element.style.left = lastX + 'px'
    this.element.style.bottom = lastY + 'px'
  }
}

// 场景内热点
function HotSpot(element, canvasWidth, canvasHeight, x, y, angle) {
  this.element = element
  var sourcex = canvasWidth * 0.5
  var sourcey = canvasHeight * 0.5
  var pixelSize = 100 / sourcex

  // 数学计算
  var cos = Math.cos
  var sin = Math.sin
  var PI = Math.PI
  var sqrt = Math.sqrt

  // 计算出当前的弧度
  var theta = angle.x * 360 * PI / 180
  var phi = (90 + angle.y * 180) * (PI / 180)

  // 计算出A B的值
  var xx = cos(theta) * (x - sourcex) * pixelSize + sin(theta) * sin(phi) * (y - sourcey) * pixelSize - 100 * sin(theta) * cos(phi)
  var yy = cos(phi) * (y - sourcey) * pixelSize + 100 * sin(phi)
  var zz = sin(theta) * (x - sourcex) * pixelSize - cos(theta) * sin(phi) * (y - sourcey) * pixelSize + 100 * cos(theta) * cos(phi)
  var r = sqrt(xx * xx + zz * zz)

  this.A = xx / zz
  this.B = -yy / r

  this.changePos = function (angle) {
    // 计算出当前的弧度
    var theta = angle.x * 360 * PI / 180
    var phi = (90 + angle.y * 180) * (PI / 180)

    // 实时更新热点位置
    var a = cos(theta)
    var b = sin(theta)
    var c = cos(phi)
    var d = sin(phi)
    var A = this.A
    var B = this.B

    var y = (100 * a * c + 100 * d / (B * sqrt(A * A + 1)) + 100 * b * (b * c + A * a * c) / (a - A * b)) / ((b * (b * d + A * a * d) / (a - A * b)) - (c / (B * sqrt(A * A + 1))) + a * d)
    var x = (100 * (b * c + A * a * c) - (b * d + A * a * d) * y) / (a - A * b)

    var lastX = ((x / pixelSize) + sourcex)
    var lastY = ((y / pixelSize) + sourcey)

    this.element.style.left = lastX + 'px'
    this.element.style.bottom = lastY + 'px'
  }
}