import React from 'react';
import { View } from 'react-native';
import styles from '../../styles';

function GhostParticleLayer({ intensity = 0, color = '#00E5FF', width = 132, height = 28 }) {
  const density = Math.max(5, Math.round(6 + (intensity * 10)));

  return (
    <View style={[styles.threeDGhostParticleCanvasWrap, { width, height }]} pointerEvents="none">
      <View style={styles.threeDGhostParticleFallbackTrack}>
        {Array.from({ length: density }).map((_, index) => {
          const ratio = density > 1 ? index / (density - 1) : 0;
          const size = 2 + (ratio * (2 + (intensity * 3)));
          return (
            <View
              key={`ghost-dot-${index}`}
              style={{
                width: size,
                height: size,
                borderRadius: 999,
                backgroundColor: color,
                opacity: 0.15 + (ratio * 0.55),
                marginRight: 4,
              }}
            />
          );
        })}
      </View>
    </View>
  );
}

export default GhostParticleLayer;
