import React, {useContext, useEffect, useReducer} from "react";
import cartReducer from "./cartReducer";

// React Context declaration (not exported)
const CartContext = React.createContext(null);


let initialCart;
try {
  initialCart = JSON.parse(localStorage.getItem("cart")) ?? [];
} catch {
  console.error("The cart could not be parsed into JSON.");
  initialCart = [];
}
/**
 * CartProvider wrapper component to wrap App component in index.js
 * Also encapsulates the shared state/reducer
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
export function CartProvider(props) {
  const [cart, dispatch] = useReducer(cartReducer, initialCart); // shared state/reducer
  useEffect(() => localStorage.setItem("cart", JSON.stringify(cart)), [cart]);

  return (
    <CartContext.Provider value={{cart, dispatch}}> {/*Context.Provider value contains object with shared props*/}
      {props.children} {/*children to which context is provided*/}
    </CartContext.Provider>
  );
}

/**
 * custom hook useCart
 * @returns {*} shared context object containing {cart, dispatch}
 */
export function useCart() {
  const context = useContext(CartContext); // useContext hook
  if (!context) {
    throw new Error(
      "useCart must be used within a CartProvider. Wrap a parent component in <CartProvider> to fix this error."
    );
  }
  return context;
}
