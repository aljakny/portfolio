/**
 * Antigravity Aura Shader
 * Creates a flowing, luxury liquid-metal effect for the portrait section
 */
function initShader(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  // Sync size with ResizeObserver
  function syncSize() {
    const w = canvas.clientWidth || 500;
    const h = canvas.clientHeight || 500;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
  }
  
  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(syncSize).observe(canvas);
  }
  syncSize();

  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) {
    // Graceful fallback: hide canvas, show static gradient
    canvas.style.display = 'none';
    return;
  }

  const vertexShaderSource = `
    attribute vec2 a_position;
    varying vec2 v_texCoord;
    void main() {
      v_texCoord = a_position * 0.5 + 0.5;
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

  const fragmentShaderSource = `
    precision highp float;
    varying vec2 v_texCoord;
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;

    float noise(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      vec2 uv = v_texCoord;
      vec2 mouse = u_mouse / u_resolution;
      vec2 p = uv * 2.0 - 1.0;
      p.x *= u_resolution.x / u_resolution.y;
      float d = length(p);

      // Liquid flow
      for(float i = 1.0; i < 4.0; i++) {
        p.x += 0.3 / i * sin(i * 3.0 * p.y + u_time * 0.5 + mouse.x * 2.0);
        p.y += 0.3 / i * cos(i * 3.0 * p.x + u_time * 0.5 + mouse.y * 2.0);
      }

      vec3 obsidian = vec3(0.039, 0.039, 0.043);
      vec3 deepGold = vec3(0.15, 0.12, 0.05);
      vec3 silver = vec3(0.2, 0.2, 0.25);

      float f = 0.5 + 0.5 * sin(p.x + p.y + u_time);
      vec3 color = mix(obsidian, mix(deepGold, silver, f), 0.2);

      float glow = 0.02 / abs(length(p) - 0.7);
      color += deepGold * glow * 0.5;

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  function createShader(type, source) {
    const s = gl.createShader(type);
    gl.shaderSource(s, source);
    gl.compileShader(s);
    return s;
  }

  const program = gl.createProgram();
  gl.attachShader(program, createShader(gl.VERTEX_SHADER, vertexShaderSource));
  gl.attachShader(program, createShader(gl.FRAGMENT_SHADER, fragmentShaderSource));
  gl.linkProgram(program);
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
  
  const posAttr = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(posAttr);
  gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

  const uTime = gl.getUniformLocation(program, 'u_time');
  const uRes = gl.getUniformLocation(program, 'u_resolution');
  const uMouse = gl.getUniformLocation(program, 'u_mouse');

  let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
  window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    if (rect.width && rect.height) {
      mouse.x = ((e.clientX - rect.left) / rect.width) * canvas.width;
      mouse.y = (1.0 - (e.clientY - rect.top) / rect.height) * canvas.height;
    }
  });

  let isVisible = true;
  
  // Performance: pause when not visible
  if (typeof IntersectionObserver !== 'undefined') {
    const observer = new IntersectionObserver((entries) => {
      isVisible = entries[0].isIntersecting;
    }, { threshold: 0 });
    observer.observe(canvas);
  }

  function render(t) {
    if (isVisible) {
      if (typeof ResizeObserver === 'undefined') syncSize();
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (uTime) gl.uniform1f(uTime, t * 0.001);
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
      if (uMouse) gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    requestAnimationFrame(render);
  }
  
  render(0);
}

// Export globally
window.initShader = initShader;
