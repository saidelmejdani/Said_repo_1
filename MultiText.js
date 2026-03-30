// MultiJointModel.js (c) 2012 matsuda and itami
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Normal;\n' +
  'uniform mat4 u_MvpMatrix;\n' +
  'uniform mat4 u_NormalMatrix;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_Position = u_MvpMatrix * a_Position;\n' +
  '  vec3 lightDirection = normalize(vec3(0.0, 0.5, 0.7));\n' +
  '  vec4 color = vec4(1.0, 0.4, 0.0, 1.0);\n' +
  '  vec3 normal = normalize((u_NormalMatrix * a_Normal).xyz);\n' +
  '  float nDotL = max(dot(normal, lightDirection), 0.0);\n' +
  '  v_Color = vec4(color.rgb * nDotL + vec3(0.1), color.a);\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' +
  '}\n';

function main() {
  var canvas = document.getElementById('webgl');

  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to initialize shaders.');
    return;
  }

  var n = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  var u_MvpMatrix    = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  var u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  if (!u_MvpMatrix || !u_NormalMatrix) {
    console.log('Failed to get the storage location');
    return;
  }

  var viewProjMatrix = new Matrix4();
  viewProjMatrix.setPerspective(50.0, canvas.width / canvas.height, 1.0, 100.0);
  viewProjMatrix.lookAt(20.0, 10.0, 30.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);

  document.onkeydown = function(ev) {
    keydown(ev, gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  };

  draw(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
}

var ANGLE_STEP     = 3.0;
var g_arm1Angle    = 90.0;
var g_joint1Angle  = 0.0;
var g_joint2Angle  = 0.0;
var g_joint3Angle  = 0.0;
var g_finger1Angle = 0.0;
var g_finger2Angle = 0.0;
var g_finger3Angle = 0.0;
var g_finger4Angle = 0.0;
var g_finger5Angle = 0.0;

function keydown(ev, gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix) {
  switch (ev.keyCode) {
    case 40: // Down arrow -> positive rotation of joint1
      if (g_joint1Angle < 135.0) g_joint1Angle += ANGLE_STEP;
      break;
    case 38: // Up arrow -> negative rotation of joint1
      if (g_joint1Angle > -135.0) g_joint1Angle -= ANGLE_STEP;
      break;
    case 39: // Right arrow -> positive rotation of arm1
      g_arm1Angle = (g_arm1Angle + ANGLE_STEP) % 360;
      break;
    case 37: // Left arrow -> negative rotation of arm1
      g_arm1Angle = (g_arm1Angle - ANGLE_STEP) % 360;
      break;
    case 90: // 'z' -> positive rotation of joint2 (wrist)
      g_joint2Angle = (g_joint2Angle + ANGLE_STEP) % 360;
      break;
    case 88: // 'x' -> negative rotation of joint2 (wrist)
      g_joint2Angle = (g_joint2Angle - ANGLE_STEP) % 360;
      break;
    case 86: // 'v' -> close all fingers
      if (g_joint3Angle  < 60.0) g_joint3Angle  = (g_joint3Angle  + ANGLE_STEP) % 360;
      if (g_finger1Angle < 60.0) g_finger1Angle = (g_finger1Angle + ANGLE_STEP) % 360;
      if (g_finger2Angle < 60.0) g_finger2Angle = (g_finger2Angle + ANGLE_STEP) % 360;
      if (g_finger3Angle < 60.0) g_finger3Angle = (g_finger3Angle + ANGLE_STEP) % 360;
      if (g_finger4Angle < 60.0) g_finger4Angle = (g_finger4Angle + ANGLE_STEP) % 360;
      if (g_finger5Angle < 60.0) g_finger5Angle = (g_finger5Angle + ANGLE_STEP) % 360;
      break;
    case 67: // 'c' -> open all fingers
      if (g_joint3Angle  > -60.0) g_joint3Angle  = (g_joint3Angle  - ANGLE_STEP) % 360;
      if (g_finger1Angle > -60.0) g_finger1Angle = (g_finger1Angle - ANGLE_STEP) % 360;
      if (g_finger2Angle > -60.0) g_finger2Angle = (g_finger2Angle - ANGLE_STEP) % 360;
      if (g_finger3Angle > -60.0) g_finger3Angle = (g_finger3Angle - ANGLE_STEP) % 360;
      if (g_finger4Angle > -60.0) g_finger4Angle = (g_finger4Angle - ANGLE_STEP) % 360;
      if (g_finger5Angle > -60.0) g_finger5Angle = (g_finger5Angle - ANGLE_STEP) % 360;
      break;
    case 81: // 'q' -> curl finger1
      if (g_finger1Angle < 60.0) g_finger1Angle = (g_finger1Angle + ANGLE_STEP) % 360;
      break;
    case 65: // 'a' -> uncurl finger1
      if (g_finger1Angle > -60.0) g_finger1Angle = (g_finger1Angle - ANGLE_STEP) % 360;
      break;
    case 87: // 'w' -> curl finger2
      if (g_finger2Angle < 60.0) g_finger2Angle = (g_finger2Angle + ANGLE_STEP) % 360;
      break;
    case 83: // 's' -> uncurl finger2
      if (g_finger2Angle > -60.0) g_finger2Angle = (g_finger2Angle - ANGLE_STEP) % 360;
      break;
    case 69: // 'e' -> curl finger3
      if (g_finger3Angle < 60.0) g_finger3Angle = (g_finger3Angle + ANGLE_STEP) % 360;
      break;
    case 68: // 'd' -> uncurl finger3
      if (g_finger3Angle > -60.0) g_finger3Angle = (g_finger3Angle - ANGLE_STEP) % 360;
      break;
    case 82: // 'r' -> curl finger4
      if (g_finger4Angle < 60.0) g_finger4Angle = (g_finger4Angle + ANGLE_STEP) % 360;
      break;
    case 70: // 'f' -> uncurl finger4
      if (g_finger4Angle > -60.0) g_finger4Angle = (g_finger4Angle - ANGLE_STEP) % 360;
      break;
    case 84: // 't' -> curl finger5 (thumb)
      if (g_finger5Angle < 60.0) g_finger5Angle = (g_finger5Angle + ANGLE_STEP) % 360;
      break;
    case 71: // 'g' -> uncurl finger5 (thumb)
      if (g_finger5Angle > -60.0) g_finger5Angle = (g_finger5Angle - ANGLE_STEP) % 360;
      break;
    default: return;
  }

  document.getElementById('arm1Angle').innerHTML    = g_arm1Angle;
  document.getElementById('joint1Angle').innerHTML  = g_joint1Angle;
  document.getElementById('joint2Angle').innerHTML  = g_joint2Angle;
  document.getElementById('joint3Angle').innerHTML  = g_joint3Angle;
  document.getElementById('finger1Angle').innerHTML = g_finger1Angle;
  document.getElementById('finger2Angle').innerHTML = g_finger2Angle;
  document.getElementById('finger3Angle').innerHTML = g_finger3Angle;
  document.getElementById('finger4Angle').innerHTML = g_finger4Angle;
  document.getElementById('finger5Angle').innerHTML = g_finger5Angle;

  draw(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
}

function initVertexBuffers(gl) {
  var vertices = new Float32Array([
     0.5, 1.0, 0.5, -0.5, 1.0, 0.5, -0.5, 0.0, 0.5,  0.5, 0.0, 0.5, // front
     0.5, 1.0, 0.5,  0.5, 0.0, 0.5,  0.5, 0.0,-0.5,  0.5, 1.0,-0.5, // right
     0.5, 1.0, 0.5,  0.5, 1.0,-0.5, -0.5, 1.0,-0.5, -0.5, 1.0, 0.5, // up
    -0.5, 1.0, 0.5, -0.5, 1.0,-0.5, -0.5, 0.0,-0.5, -0.5, 0.0, 0.5, // left
    -0.5, 0.0,-0.5,  0.5, 0.0,-0.5,  0.5, 0.0, 0.5, -0.5, 0.0, 0.5, // down
     0.5, 0.0,-0.5, -0.5, 0.0,-0.5, -0.5, 1.0,-0.5,  0.5, 1.0,-0.5  // back
  ]);

  var normals = new Float32Array([
     0.0, 0.0, 1.0,  0.0, 0.0, 1.0,  0.0, 0.0, 1.0,  0.0, 0.0, 1.0,
     1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,
     0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0,
    -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,
     0.0,-1.0, 0.0,  0.0,-1.0, 0.0,  0.0,-1.0, 0.0,  0.0,-1.0, 0.0,
     0.0, 0.0,-1.0,  0.0, 0.0,-1.0,  0.0, 0.0,-1.0,  0.0, 0.0,-1.0
  ]);

  var indices = new Uint8Array([
     0, 1, 2,   0, 2, 3,
     4, 5, 6,   4, 6, 7,
     8, 9,10,   8,10,11,
    12,13,14,  12,14,15,
    16,17,18,  16,18,19,
    20,21,22,  20,22,23
  ]);

  if (!initArrayBuffer(gl, 'a_Position', vertices, gl.FLOAT, 3)) return -1;
  if (!initArrayBuffer(gl, 'a_Normal',   normals,  gl.FLOAT, 3)) return -1;

  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  var indexBuffer = gl.createBuffer();
  if (!indexBuffer) {
    console.log('Failed to create the index buffer object');
    return -1;
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  return indices.length;
}

function initArrayBuffer(gl, attribute, data, type, num) {
  var buffer = gl.createBuffer();
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return false;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

  var a_attribute = gl.getAttribLocation(gl.program, attribute);
  if (a_attribute < 0) {
    console.log('Failed to get the storage location of ' + attribute);
    return false;
  }
  gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
  gl.enableVertexAttribArray(a_attribute);

  return true;
}

var g_modelMatrix  = new Matrix4();
var g_mvpMatrix    = new Matrix4();
var g_normalMatrix = new Matrix4();
var g_matrixStack  = [];

function pushMatrix(m) {
  g_matrixStack.push(new Matrix4(m));
}

function popMatrix() {
  return g_matrixStack.pop();
}

function drawBox(gl, n, width, height, depth, viewProjMatrix, u_MvpMatrix, u_NormalMatrix) {
  pushMatrix(g_modelMatrix);
    g_modelMatrix.scale(width, height, depth);

    g_mvpMatrix.set(viewProjMatrix);
    g_mvpMatrix.multiply(g_modelMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, g_mvpMatrix.elements);

    g_normalMatrix.setInverseOf(g_modelMatrix);
    g_normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, g_normalMatrix.elements);

    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
  g_modelMatrix = popMatrix();
}

function draw(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix) {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Base
  var baseHeight = 2.0;
  g_modelMatrix.setTranslate(0.0, -12.0, 0.0);
  drawBox(gl, n, 10.0, baseHeight, 10.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);

  // Arm1
  var arm1Length = 10.0;
  g_modelMatrix.translate(0.0, baseHeight, 0.0);
  g_modelMatrix.rotate(g_arm1Angle, 0.0, 1.0, 0.0);
  drawBox(gl, n, 3.0, arm1Length, 3.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);

  // Arm2
  var arm2Length = 10.0;
  g_modelMatrix.translate(0.0, arm1Length, 0.0);
  g_modelMatrix.rotate(g_joint1Angle, 0.0, 0.0, 1.0);
  drawBox(gl, n, 4.0, arm2Length, 4.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);

  // Palm
  var palmLength = 2.0;
  g_modelMatrix.translate(0.0, arm2Length, 0.0);
  g_modelMatrix.rotate(g_joint2Angle, 0.0, 1.0, 0.0);
  drawBox(gl, n, 2.0, palmLength, 6.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);

  // Move to tip of palm
  g_modelMatrix.translate(0.0, palmLength, 0.0);

  // Finger 1
  pushMatrix(g_modelMatrix);
    g_modelMatrix.translate(0.0, 0.0, 2.0);
    g_modelMatrix.rotate(g_finger1Angle, 0.0, 0.0, 1.0);
    drawBox(gl, n, 1.0, 2.0, 1.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
    g_modelMatrix.translate(0.0, 2.0, 0.0);
    g_modelMatrix.rotate(g_finger1Angle, 0.0, 0.0, 1.0);
    drawBox(gl, n, 1.0, 2.0, 1.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  g_modelMatrix = popMatrix();

  // Finger 2
  pushMatrix(g_modelMatrix);
    g_modelMatrix.translate(0.0, 0.0, 0.7);
    g_modelMatrix.rotate(g_finger2Angle, 0.0, 0.0, 1.0);
    drawBox(gl, n, 1.0, 2.0, 1.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
    g_modelMatrix.translate(0.0, 2.0, 0.0);
    g_modelMatrix.rotate(g_finger2Angle, 0.0, 0.0, 1.0);
    drawBox(gl, n, 1.0, 2.0, 1.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  g_modelMatrix = popMatrix();

  // Finger 3
  pushMatrix(g_modelMatrix);
    g_modelMatrix.translate(0.0, 0.0, -0.7);
    g_modelMatrix.rotate(g_finger3Angle, 0.0, 0.0, 1.0);
    drawBox(gl, n, 1.0, 2.0, 1.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
    g_modelMatrix.translate(0.0, 2.0, 0.0);
    g_modelMatrix.rotate(g_finger3Angle, 0.0, 0.0, 1.0);
    drawBox(gl, n, 1.0, 2.0, 1.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  g_modelMatrix = popMatrix();

  // Finger 4
  pushMatrix(g_modelMatrix);
    g_modelMatrix.translate(0.0, 0.0, -2.0);
    g_modelMatrix.rotate(g_finger4Angle, 0.0, 0.0, 1.0);
    drawBox(gl, n, 1.0, 2.0, 1.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
    g_modelMatrix.translate(0.0, 2.0, 0.0);
    g_modelMatrix.rotate(g_finger4Angle, 0.0, 0.0, 1.0);
    drawBox(gl, n, 1.0, 2.0, 1.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  g_modelMatrix = popMatrix();

  // Finger 5 (thumb)
  pushMatrix(g_modelMatrix);
    g_modelMatrix.translate(0.0, -1.0, -3.0);
    g_modelMatrix.rotate(-90, 1.0, 0.0, 0.0);
    g_modelMatrix.rotate(g_finger5Angle, 0.0, 0.0, 1.0);
    drawBox(gl, n, 1.0, 2.0, 1.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
    g_modelMatrix.translate(0.0, 2.0, 0.0);
    g_modelMatrix.rotate(g_finger5Angle, 0.0, 0.0, 1.0);
    drawBox(gl, n, 1.0, 2.0, 1.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
  g_modelMatrix = popMatrix();
}
