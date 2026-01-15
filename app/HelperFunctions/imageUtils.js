export const getRandomFoodImage = (id) => {
  return `https://picsum.photos/seed/${id}/300/200`;
};

const imageUtils = {
  getRandomFoodImage,
};

export default imageUtils;
