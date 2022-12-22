import { Timestamp } from "firebase/firestore";
import secureLocalStorage from "nextjs-secure-local-storage";

export function checkAuth() {
    return secureLocalStorage.getItem('auth') != null && Object.keys(secureLocalStorage.getItem('auth')).length > 0;
}

export function getAuthUser() : IAuth{
    return (secureLocalStorage.getItem('auth') as IAuth);
}
  
export const logOut = (setAuth: any) => {
    secureLocalStorage.removeItem('auth');
    setAuth(checkAuth());
    console.log('After log out ' + secureLocalStorage.getItem('auth'));
}
  
export interface IAuth {
    address?: string;
    dept_id?: string;
    div_id?: string;
    dob?: Timestamp;
    eid?: string;
    email?: string;
    name?: string;
    password?: string;
    phone?: string;
    salary?: number;
}