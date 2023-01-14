import { faker } from "@faker-js/faker";
import { addDoc, collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { database } from "../database/firebase";

const db_concessions = collection(database, 'concessions');

export enum FNBMenuCategory {
    Food,
    Beverage
}

export class FNBMenu {
    id: string
    name: string
    stock: number
    price: number
    cost: number
    description: string
    featured: boolean
    category: FNBMenuCategory

    constructor(
        id: string,
        name: string,
        stock: number,
        price: number,
        cost: number,
        description: string,
        featured: boolean,
        category: FNBMenuCategory
    ) {
        this.id = id
        this.name = name
        this.stock = stock
        this.price = price
        this.cost = cost
        this.description = description
        this.featured = featured
        this.category = category
    }

    insert() {
        const q = addDoc(db_concessions, {
            name: this.name,
            stock: this.stock,
            price: this.price,
            cost: this.cost,
            description: this.description,
            featured: this.featured,
            category: this.category
        });
        return q;
    }

    static async seedFoodBeverages() {
        new FNBMenu("BLANK",
         "SITM Special Fried Rice",
          100, 58500, 22500,
           "A delicious blend of aromatic jasmine rice, stir-fried with a medley of vegetables, eggs, and your choice of meat or seafood, all tossed in our signature SITM sauce.",
            true, FNBMenuCategory.Food).insert();

        new FNBMenu("BLANK",
         "American Hot Dog",
          150, 28500, 11500,
           "Juicy all-beef hot dog smothered in chili, cheese, and onions, served on a soft bun.",
            true, FNBMenuCategory.Food).insert();

        new FNBMenu("BLANK",
         "Sweet Popcorn",
          500, 35000, 10500,
           "Buttery and sweet popcorn, the perfect treat to accompany your movie experience.",
            true, FNBMenuCategory.Food).insert();

        new FNBMenu("BLANK",
         "Butter Popcorn",
          500, 35000, 9500,
           "Crispy and buttery popcorn, the perfect snack for movie time.",
            true, FNBMenuCategory.Food).insert();

        new FNBMenu("BLANK",
         "Caramel Popcorn",
          300, 48200, 20500,
           "Crunchy popcorn coated in a rich, sweet caramel sauce, perfect for satisfying your sweet tooth.",
            true, FNBMenuCategory.Food).insert();

        new FNBMenu("BLANK",
         "Fish and Chips",
          90, 79700, 31900,
           "Crispy battered fish served with golden fries, a classic British dish that's perfect for movie night.",
            true, FNBMenuCategory.Food).insert();

        new FNBMenu("BLANK",
        "SITM Black Popcorn",
            200, 48900, 24300,
            "SITM's signature black popcorn, made with activated charcoal and tossed in a secret blend of spices for a unique and savory flavor experience.",
            true, FNBMenuCategory.Food).insert();

        new FNBMenu("BLANK",
        "Iced Chinese Green Tea",
            150, 26300, 6500,
            "Refreshing iced Chinese green tea, steeped to perfection with a subtle hint of sweetness, perfect for quenching your thirst on a hot day.",
            true, FNBMenuCategory.Beverage).insert();

        new FNBMenu("BLANK",
        "Fresh Sugarcane Juice",
            150, 42000, 25000,
            "Pure and natural sugarcane juice, freshly squeezed to retain its natural sweetness and nutrition, perfect for a healthy movie snack option.",
            true, FNBMenuCategory.Beverage).insert();

        new FNBMenu("BLANK",
        "Classic Lemon Tea",
            400, 32100, 11000,
            "A classic blend of black tea and lemon, served hot or iced, perfect for a refreshing and comforting drink during your movie experience.",
            true, FNBMenuCategory.Beverage).insert();

        new FNBMenu("BLANK",
        "Zero Coke",
            400, 21600, 8000,
            "A sugar-free version of the classic cola, made with artificial sweeteners and perfect for those who want a sweet drink but are watching their sugar intake.",
            true, FNBMenuCategory.Beverage).insert();

        new FNBMenu("BLANK",
        "SITM Special Red Orangeade",
            300, 38600, 14800,
            "SITM's signature blend of red orange juice, mixed with a special blend of spices and herbs to create a unique and refreshingly tangy citrus drink.",
            true, FNBMenuCategory.Beverage).insert();
    }
}

export async function insertFNBMenu(
    name: string,
    stock: number,
    price: number,
    cost: number,
    description: string,
    featured: boolean,
    category: FNBMenuCategory
) {
    const mn : FNBMenu = new FNBMenu("ID", name, stock, price, cost, description, featured, category)
    mn.insert();
}

export async function getFNBMenu(id: string) {
    const docRef = doc(database, 'concessions', id);
    const promise = await getDoc(docRef);

    return promise;
}

export async function getAllFNBMenus() {
    const promise = await getDocs(db_concessions);

    return promise;
}