import bcrypt from 'bcryptjs';

export async function validatePassword(plain: string, hashed: string){
    const result = await bcrypt.compare(plain, hashed);
    return result;
}

export async function hashPassword(plain: string){
    const result = await bcrypt.hash(plain, 10);
    return result;
}