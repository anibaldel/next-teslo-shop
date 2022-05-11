import { CartState } from './';
import { ICartProduct, ShippingAddress } from '../../interfaces';

type CartActionType =
    | {type: '[Cart] - LoadCart from cookies | storage', payload: ICartProduct[]}
    | {type: '[Cart] - Update products in cart', payload: ICartProduct[]}
    | {type: '[Cart] - Change cart quantity', payload: ICartProduct}
    | {type: '[Cart] - Remove Product in cart', payload: ICartProduct}
    | {type: '[Cart] - LoadAddres from cookies', payload: ShippingAddress}
    | {type: '[Cart] - Update Address', payload: ShippingAddress}
    | {
        type: '[Cart] - Update order summary', 
        payload: {
            numberOfItems: number;
            subTotal: number;
            tax: number;
            total: number;
        }
    }
    | {type: '[Cart] - OrderComplete'}
    
export const cartReducer=(state: CartState, action: CartActionType): CartState=> {

    switch (action.type) {
        case '[Cart] - LoadCart from cookies | storage':
            return {
                ...state,
                isLoaded: true,
                cart: action.payload
                //cart: [...action.payload] lo mismo!
            }
        case '[Cart] - Update products in cart':
            return {
                ...state,
                cart: [...action.payload]
            }
        case '[Cart] - Change cart quantity':
            return {
                ...state,
                cart: state.cart.map(product => {
                    if( product._id !== action.payload._id) return product;
                    if( product.size !== action.payload.size) return product;

                    return action.payload;
                })
            }
        case '[Cart] - Remove Product in cart':
            return {
                ...state,
                cart: state.cart.filter(product=> {
                    return !( product._id === action.payload._id && product.size === action.payload.size) 
                })
            }
        case '[Cart] - Update order summary':
            return {
                ...state,
                ...action.payload
            }
        case '[Cart] - Update Address':
        case '[Cart] - LoadAddres from cookies':
            return {
                ...state,
                shippingAddress: action.payload
            }
        case '[Cart] - OrderComplete':
            return {
                ...state,
                cart: [],
                numberOfItems: 0,
                subTotal: 0,
                tax: 0,
                total: 0
            }
        default:
            return state;
    }

}