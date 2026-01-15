import API_BASE_URL from '../../config'; // Ensure this path is correct

export async function createOrGetCart(userPhoneNumber, restaurantId) {
  // Creates or returns an existing cart (status="cart")
  const response = await fetch(`${API_BASE_URL}/api/cart`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone_number: userPhoneNumber, restaurant_id: restaurantId }),
  });
  if (!response.ok) {
    throw new Error(`createOrGetCart failed: ${response.statusText}`);
  }
  return await response.json();
}

export async function getCart(userPhoneNumber, restaurantId) {
  // Retrieve a cart by customer phone number and restaurant ID
  const response = await fetch(`${API_BASE_URL}/api/cart/customer/${userPhoneNumber}/${restaurantId}`);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`getCartByCustomerAndRestaurant failed: ${response.statusText} - ${errorText}`);
  }
  return await response.json();
}

export async function getAllCarts(phone_number) {
  // Retrieve all carts by customer phone number
  const response = await fetch(`${API_BASE_URL}/api/carts/${phone_number}`);
  if (!response.ok && response.status !== 404) {
    const errorText = await response.text();
    throw new Error(`getAllCarts failed: ${response.statusText} - ${errorText}`);
  }
  return await response.json();
}

export async function addItemToCart(orderNumber, foodItem) {
  // Add an item to the cart
  const response = await fetch(`${API_BASE_URL}/api/cart/${orderNumber}/items`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      menu_id: foodItem.menu_id,
      food_name: foodItem.food_name,
      quantity: foodItem.quantity, // Add quantity here
    }),
  });
  if (!response.ok) {
    throw new Error(`addItemToCart failed: ${response.statusText}`);
  }
  return await response.json();
}

export async function removeItemFromCart(orderNumber, menuId, foodItem) {
  // Remove an item from the cart by menu_id
  const response = await fetch(`${API_BASE_URL}/api/cart/${orderNumber}/items/${menuId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      menu_id: foodItem.menu_id,
      food_name: foodItem.food_name,
      quantity: foodItem.quantity, // Add quantity here
    }),
  });
  if (!response.ok) {
    throw new Error(`removeItemFromCart failed: ${response.statusText}`);
  }
  return await response.json();
}

export async function checkoutCart(orderNumber) {
  // Checkout the cart (status="new" or similar)
  const response = await fetch(`${API_BASE_URL}/api/cart/${orderNumber}/checkout`, {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error(`checkoutCart failed: ${response.statusText}`);
  }
  return await response.json();
}

export async function getRestaurantName(restaurantId) {
  // Retrieve the restaurant name by ID
  const response = await fetch(`${API_BASE_URL}/api/restaurant/${restaurantId}`);
  if (!response.ok) {
    throw new Error(`getRestaurantName failed: ${response.statusText}`);
  }
  const data = await response.json();
  return data.restaurant_name; // Assuming the response JSON has a 'restaurant_name' field
}

//delete cart
export async function deleteCart(phone_number, restaurant_id) {
  const response = await fetch(`${API_BASE_URL}/api/cart/${phone_number}/${restaurant_id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(`deleteCart failed: ${response.statusText}`);
  }
  return await response.json();
}

export async function getCartByOrderNumber(orderNumber) {
  // Fetch a cart using order number directly
  const response = await fetch(`${API_BASE_URL}/api/cart/${orderNumber}`);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`getCartByOrderNumber failed: ${response.statusText} - ${errorText}`);
  }
  return await response.json();
}

export const getRestaurantDetails = async (restaurantId) => {
  try {
      const response = await fetch(`${API_BASE_URL}/restaurant/${restaurantId}`);
      if (!response.ok) {
          throw new Error(`Failed to fetch restaurant details for ID: ${restaurantId}`);
      }
      const data = await response.json();
      return data;
  } catch (error) {
      console.error("Error fetching restaurant details:", error);
      return null;
  }
};



