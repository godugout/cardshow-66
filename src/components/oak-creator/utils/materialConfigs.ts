export const getMaterialProps = (finish: 'matte' | 'glossy' | 'foil') => {
  switch (finish) {
    case 'matte':
      return {
        roughness: 0.8,
        metalness: 0.1,
        reflectivity: 0.2
      };
    case 'glossy':
      return {
        roughness: 0.1,
        metalness: 0.2,
        reflectivity: 0.8
      };
    case 'foil':
      return {
        roughness: 0.05,
        metalness: 0.9,
        reflectivity: 1.0,
        envMapIntensity: 1.5
      };
    default:
      return {
        roughness: 0.1,
        metalness: 0.2,
        reflectivity: 0.8
      };
  }
};