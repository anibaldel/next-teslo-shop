import type { NextApiRequest, NextApiResponse } from 'next'
import { IProduct } from '../../../interfaces/products';
import { Product } from '../../../models';
import { db } from '../../../database';

type Data = 
| { message: string }
| IProduct

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {

    switch (req.method) {
        case 'GET':
            return getProductBySlug(req, res);
        default:
            res.status(200).json({ message: 'Bad request' })
    }
    
}

const getProductBySlug = async(req: NextApiRequest, res: NextApiResponse<Data>)=> {
    
    await db.connect();
    const { slug } = req.query;
    const product: IProduct = await Product.findOne({ slug }).lean();
    await db.disconnect();

    if(!product) {
        res.status(400).json({ message: 'Producto no encontado' })
    }

    product.images = product.images.map( image => {
        return image.includes('http') ? image : `${process.env.HOST_NAME}products/${image}`;
    })

    res.status(200).json(product)

}