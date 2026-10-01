// Exact critically damped spring step, preserving velocity when the target changes.
export function stepSpring(position, velocity, target, seconds, response = 0.34) {
  const omega = 2 * Math.PI / response;
  const displacement = position - target;
  const coefficient = velocity + omega * displacement;
  const decay = Math.exp(-omega * seconds);
  return {
    position: target + (displacement + coefficient * seconds) * decay,
    velocity: (velocity - omega * coefficient * seconds) * decay,
  };
}
