import { Request, Response, NextFunction } from 'express';
import { check, validationResult } from 'express-validator';
import { Profesor } from '../models/ProfesorModel';
import { AppDataSource } from '../db/conexion';

var profesores: Profesor[];

export const validar = () => [
    check('dni')
        .notEmpty().withMessage('El DNI es obligatorio')
        .isLength({ min: 7 }).withMessage('El DNI debe tener al menos 7 caracteres'),
    check('nombre').notEmpty().withMessage('El nombre es obligatorio')
        .isLength({ min: 3 }).withMessage('El nombre debe tener al menos 3 caracteres'),
    check('apellido').notEmpty().withMessage('El apellido es obligatorio')
        .isLength({ min: 3 }).withMessage('El apellido debe tener al menos 3 caracteres'),
    check('email').isEmail().withMessage('Debe proporcionar un email válido'),
    (req: Request, res: Response, next: NextFunction) => {
        const errores = validationResult(req);
        if (!errores.isEmpty()) {
            return res.render('crearProfesor', {
                pagina: 'Crear Profesor',
                errores: errores.array(),
            });
        }
        next();
    }
];


export const consultarTodos = async (req: Request, res: Response) => {
    try {
        const profesorRepository = AppDataSource.getRepository(Profesor);
        profesores = await profesorRepository.find();
        res.render('listarProfesores', {
            pagina: 'Lista de Profesores',
            profesores,
        });
    } catch (err: unknown) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
};


export const consultarUno = async (req: Request, res: Response) => {
    const { id } = req.params;
    const idNumber = Number(id);
    
    if (isNaN(idNumber)) {
        return res.status(400).send('ID inválido, debe ser un número');
    }
    
    try {
        const profesorRepository = AppDataSource.getRepository(Profesor);
        const profesor = await profesorRepository.findOne({ where: { id: idNumber } });
        if (!profesor) {
            return res.status(404).send('Profesor no encontrado');
        }
        res.json(profesor);
    } catch (err: unknown) {
        if (err instanceof Error) {
            return res.status(500).send(err.message);
        }
        return res.status(500).send('Error desconocido');
    }
};


export const insertar = async (req: Request, res: Response): Promise<void> => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.render('crearProfesor', {
            pagina: 'Crear Profesor',
            errores: errores.array(),
        });
    }
    const { dni, nombre, apellido, email, telefono } = req.body;

    try {
        await AppDataSource.transaction(async (transactionalEntityManager) => {
            const profesorRepository = transactionalEntityManager.getRepository(Profesor);
            const existeProfesor = await profesorRepository.findOne({
                where: [
                    { dni },
                    { email }
                ]
            });

            if (existeProfesor) {
                throw new Error('El profesor ya existe.');
            }

            const nuevoProfesor = profesorRepository.create({ dni, nombre, apellido, email, telefono });
            await profesorRepository.save(nuevoProfesor);
        });

        const profesores = await AppDataSource.getRepository(Profesor).find();
        res.render('listarProfesores', {
            pagina: 'Lista de Profesores',
            profesores,
        });
    } catch (err: unknown) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
};


export const modificar = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { dni, nombre, apellido, email, telefono } = req.body;

    try {
        const profesorRepository = AppDataSource.getRepository(Profesor);
        const profesor = await profesorRepository.findOne({ where: { id: parseInt(id) } });

        if (!profesor) {
            return res.status(404).send('Profesor no encontrado');
        }

        profesorRepository.merge(profesor, { dni, nombre, apellido, email, telefono });
        await profesorRepository.save(profesor);

        return res.redirect('/profesores/listarProfesores');
    } catch (error) {
        console.error('Error al modificar el profesor:', error);
        return res.status(500).send('Error del servidor');
    }
};


export const eliminar = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        await AppDataSource.transaction(async transactionalEntityManager => {
            const profesorRepository = transactionalEntityManager.getRepository(Profesor);
            const deleteResult = await profesorRepository.delete(id);

            if (deleteResult.affected === 1) {
                return res.json({ mensaje: 'Profesor eliminado' });
            } else {
                throw new Error('Profesor no encontrado');
            }
        });
    } catch (err: unknown) {
        if (err instanceof Error) {
            res.status(400).json({ mensaje: err.message });
        } else {
            res.status(400).json({ mensaje: 'Error' });
        }
    }
};
