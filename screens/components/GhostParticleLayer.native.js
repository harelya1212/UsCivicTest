import React, { useCallback, useEffect, useRef } from 'react';
import { View } from 'react-native';
import Canvas from 'react-native-canvas';
import styles from '../../styles';

function GhostParticleLayer({ intensity = 0, color = '#00E5FF', width = 132, height = 28 }) {
  const canvasRef = useRef(null);

  const drawParticles = useCallback((canvas) => {
    if (!canvas) return;

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    const particleCount = Math.max(8, Math.round(8 + (intensity * 24)));
    const baseRadius = 1.4 + (intensity * 1.8);

    for (let i = 0; i < particleCount; i += 1) {
      const t = particleCount > 1 ? (i / (particleCount - 1)) : 0;
      const x = Math.round(t * width);
      const yWave = Math.sin((t * Math.PI * 2) + (intensity * Math.PI * 3));
      const y = Math.round((height * 0.5) + (yWave * (2 + (intensity * 4))));
      const alpha = 0.08 + (0.45 * intensity * (0.6 + (0.4 * t)));
      const radius = baseRadius * (0.8 + (0.7 * t));

      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.globalAlpha = alpha;
      ctx.arc(x, y, radius, 0, Math.PI * 2, false);
      ctx.fill();
    }

    ctx.globalAlpha = 0.35 + (0.45 * intensity);
    ctx.fillStyle = color;
    const tailWidth = Math.max(16, Math.round(width * (0.2 + (0.8 * intensity))));
    ctx.fillRect(0, Math.round((height / 2) - 1), tailWidth, 2);
    ctx.globalAlpha = 1;
  }, [color, height, intensity, width]);

  useEffect(() => {
    if (canvasRef.current) {
      drawParticles(canvasRef.current);
    }
  }, [drawParticles]);

  return (
    <View style={[styles.threeDGhostParticleCanvasWrap, { width, height }]} pointerEvents="none">
      <Canvas
        ref={(canvas) => {
          canvasRef.current = canvas;
          drawParticles(canvas);
        }}
        style={{ width, height }}
      />
    </View>
  );
}

export default GhostParticleLayer;
