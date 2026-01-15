import API_BASE_URL from '../../config'; 
import { getUserLocation } from './location';

export const fetchNearbyRestaurants = async (address) => {
  const location = await getUserLocation(address);
  if (!location) {
    console.log("Failed to get user location.");
    return [];
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/restaurant?latitude=${location.latitude}&longitude=${location.longitude}&radius=300`
    );    

    if (!response.ok) {
      throw new Error("Failed to fetch restaurants");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    return [];
  }
};

export const fetchMenuByRestaurantId = async (restaurantId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/menu/${restaurantId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch menu");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching menu:", error);
    return [];
  }
};

export default {
  fetchNearbyRestaurants,
  fetchMenuByRestaurantId,
};

