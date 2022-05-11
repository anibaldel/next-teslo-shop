
import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '../../../database';
import { User } from '../../../models';
import bcrypt from 'bcryptjs';
import { jwt, validations } from '../../../utils';

type Data = 
| { message: string }
| {
    token: string; 
    user: { 
        email: string; 
        role: string; 
        name: string; 
    }
};

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    switch (req.method) {
        case 'POST':
            return registerUser(req, res);
    
        default:
            res.status(400).json({
                message: 'Bad Request'
            });
    }
}

const registerUser = async (req: NextApiRequest, res: NextApiResponse<Data>)=> {
    
    const {email = '', password = '', name = ''} = req.body as {email: string, password: string, name: string };

    
    if( password.length < 6) {
        res.status(400).json({
            message: 'la contraseña debe de ser de 6 o mas caracteres'
        });
    }
    if( name.length < 2) {
        res.status(400).json({
            message: 'el nombre debe de ser de mas de 2 letras'
        });
    }
    
    if( !validations.isValidEmail(email)) {
        res.status(400).json({
            message: 'El correo no tiene formato de correo'
        });
    }
    
    await db.connect();
    const user = await User.findOne({email});

    if( user ) {
        return res.status(400).json({
            message: 'No puede usar ese correo'
        });
    }

    const newUser =new User({
        email: email.toLocaleLowerCase(),
        password: bcrypt.hashSync( password ),
        role: 'client',
        name
    });

    try {
        await newUser.save({ validateBeforeSave: true});
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'revisar logs del servidor'
        });
    }

    const {_id, role } = newUser;
    const token = jwt.signToken(_id, email)

    return res.status(200).json({
        token,
        user: {
            email, 
            role, 
            name
        }
    })
}
