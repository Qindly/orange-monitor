function calcNoise(seed: number): number {
  const token = seed.toString(36);
  let score = 0;
  for (let i = 0; i < token.length; i += 1) {
    score += token.charCodeAt(i) * (i + 11);
  }
  return score;
}

export function createMinifiedCrashTask(): () => void {
  const score = calcNoise(Date.now());
  const shape = {
    score,
    node: null as null | {
      leaf: {
        run: () => string;
      };
    },
  };

  return () => {
    // Keep this crash path stable so stack always points to built/minified code.
    shape.node!.leaf.run();
  };
}
