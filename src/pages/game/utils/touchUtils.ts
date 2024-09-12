export const isPinch = (event: TouchEvent) => {
  return (
    event.touches.length === 2 &&
    event.touches[0].target === event.currentTarget &&
    event.touches[1].target === event.currentTarget
  );
};
export const getTouchDistance = (touches: TouchList) => {
  const [touch1, touch2] = [touches[0], touches[1]];
  const dx = touch2.clientX - touch1.clientX;
  const dy = touch2.clientY - touch1.clientY;
  return Math.sqrt(dx * dx + dy * dy); // Pythagoras to calculate the distance
};
