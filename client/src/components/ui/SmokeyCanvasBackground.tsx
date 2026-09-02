import React, { useEffect, useRef } from 'react';

interface SmokeyCanvasBackgroundProps {
  className?: string;
  color?: [number, number, number]; // RGB values between 0-1
}

export const SmokeyCanvasBackground: React.FC<SmokeyCanvasBackgroundProps> = ({ 
  className = '',
  color = [0.1176, 0.251, 0.6863] // Default: #1e40af
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) return;

    const vertexSource = `
        attribute vec4 a_position;
        void main() { gl_Position = a_position; }
    `;

    const fragmentSource = `
        precision mediump float;
        uniform vec2 iResolution;
        uniform float iTime;
        uniform vec2 iMouse;
        uniform vec3 u_color;

        void mainImage(out vec4 fragColor, in vec2 fragCoord){
            vec2 uv = fragCoord / iResolution;
            vec2 centeredUV = (2.0 * fragCoord - iResolution.xy) / min(iResolution.x, iResolution.y);

            float time = iTime * 0.5;
            vec2 mouse = iMouse / iResolution;
            vec2 rippleCenter = 2.0 * mouse - 1.0;

            vec2 distortion = centeredUV;
            for (float i = 1.0; i < 8.0; i++) {
                distortion.x += 0.5 / i * cos(i * 2.0 * distortion.y + time + rippleCenter.x * 3.1415);
                distortion.y += 0.5 / i * cos(i * 2.0 * distortion.x + time + rippleCenter.y * 3.1415);
            }

            float wave = abs(sin(distortion.x + distortion.y + time));
            float glow = smoothstep(0.9, 0.2, wave);

            fragColor = vec4(u_color * glow, 1.0);
        }

        void main() { mainImage(gl_FragColor, gl_FragCoord.xy); }
    `;

    const compileShader = (type: number, source: string) => {
        const shader = gl.createShader(type);
        if (!shader) return null;
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        return shader;
    };

    const vertexShader = compileShader(gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentSource);

    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const iResolutionLocation = gl.getUniformLocation(program, "iResolution");
    const iTimeLocation = gl.getUniformLocation(program, "iTime");
    const iMouseLocation = gl.getUniformLocation(program, "iMouse");
    const uColorLocation = gl.getUniformLocation(program, "u_color");

    gl.uniform3f(uColorLocation, color[0], color[1], color[2]);

    let mousePosition = { x: 0, y: 0 };
    let isHovering = false;
    let startTime = Date.now();
    let animationFrameId: number;

    function render() {
        if (!canvas || !gl) return;
        
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        
        if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
            gl.viewport(0, 0, width, height);
        }

        const currentTime = (Date.now() - startTime) / 1000;

        gl.uniform2f(iResolutionLocation, width, height);
        gl.uniform1f(iTimeLocation, currentTime);
        gl.uniform2f(iMouseLocation, isHovering ? mousePosition.x : width / 2, isHovering ? height - mousePosition.y : height / 2);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
        animationFrameId = requestAnimationFrame(render);
    }

    const handleMouseMove = (event: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        mousePosition = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };
    
    const handleMouseEnter = () => isHovering = true;
    const handleMouseLeave = () => isHovering = false;

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseenter", handleMouseEnter);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    render();

    return () => {
        cancelAnimationFrame(animationFrameId);
        canvas.removeEventListener("mousemove", handleMouseMove);
        canvas.removeEventListener("mouseenter", handleMouseEnter);
        canvas.removeEventListener("mouseleave", handleMouseLeave);
        gl.deleteProgram(program);
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        gl.deleteBuffer(positionBuffer);
    };
  }, [color]);

  return (
    <div className={`fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0 ${className}`}>
      <canvas ref={canvasRef} className="w-full h-full"></canvas>
      <div className="absolute inset-0 backdrop-blur-sm"></div>
    </div>
  );
};
