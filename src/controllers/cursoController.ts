import { NextFunction, Request, Response } from 'express';
import { AppDataSource } from '../db/conexion';
import { Curso } from '../models/CursoModel';
import { Profesor } from '../models/ProfesorModel';
import { CursoEstudiante } from '../models/CursoEstudianteModel';
import { check, validationResult } from 'express-validator';

// Validaciones para los campos del curso
export const validarCurso = () => [
    check('nombre')
        .notEmpty().withMessage('El nombre es obligatorio')
        .isLength({ min: 3 }).withMessage('El nombre debe tener al menos 3 caracteres'),
    check('descripcion')
        .notEmpty().withMessage('La descripción es obligatoria')
        .isLength({ min: 5 }).withMessage('La descripción debe tener al menos 5 caracteres'),
    check('profesor_id')
        .isNumeric().withMessage('El profesor debe ser un número válido')
        .custom(async (profesor_id) => {
            const profesorRepository = AppDataSource.getRepository(Profesor);
            const profesor = await profesorRepository.findOne({ where: { id: profesor_id } });
            if (!profesor) {
                throw new Error('El profesor no existe');
            }
        }),

    
    async (req: Request, res: Response, next: NextFunction) => {
        const errores = validationResult(req);
        if (!errores.isEmpty()) {
            try {
                const profesorRepository = AppDataSource.getRepository(Profesor);
                const profesores = await profesorRepository.find();
                return res.render('crearCurso', {
                    pagina: 'Crear Curso',
                    profesores,
                    errores: errores.array(),
                    curso: req.body,
                });
            } catch (error) {
                return res.status(500).send('Error al obtener los profesores');
            }
        } else {
            next();
        }
    }
];
export const mostrarFormularioCrearCurso = async (req: Request, res: Response) => {
    try {
        const profesorRepository = AppDataSource.getRepository(Profesor);
        const profesores = await profesorRepository.find();

        res.render('crearCurso', {
            pagina: 'Crear Curso',
            profesores, 
        });
    } catch (err: unknown) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
};


export const consultarTodos = async (req: Request, res: Response) => {
    try {
        const cursoRepository = AppDataSource.getRepository(Curso);
        const cursos = await cursoRepository.find({ relations: ['profesor'] }); 
        res.render('listarCursos', {
            pagina: 'Lista de Cursos',
            cursos,
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
        const cursoRepository = AppDataSource.getRepository(Curso);
        const curso = await cursoRepository.findOne({ where: { id: idNumber }, relations: ['profesor'] });
        const profesorRepository = AppDataSource.getRepository(Profesor);
        const profesores = await profesorRepository.find(); 

        if (!curso) {
            return res.status(404).send('Curso no encontrado');
        }

        res.render('modificarCurso', {
            pagina: 'Modificar Curso',
            curso,
            profesores, 
        });
    } catch (err: unknown) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
};


export const insertar = async (req: Request, res: Response) => {
    const errores = validationResult(req);

    
    if (!errores.isEmpty()) {
        const profesorRepository = AppDataSource.getRepository(Profesor);
        const profesores = await profesorRepository.find();  

        return res.render('crearCurso', {
            pagina: 'Crear Curso',
            errores: errores.array(),
            profesores,
            datos: req.body 
        });
    }

    const { descripcion, profesor_id, nombre } = req.body;

    try {
        const cursoRepository = AppDataSource.getRepository(Curso);
        const profesorRepository = AppDataSource.getRepository(Profesor);

        const profesor = await profesorRepository.findOne({ where: { id: profesor_id } });

        if (!profesor) {
            return res.status(400).send('Profesor no encontrado');
        }

        const nuevoCurso = cursoRepository.create({ descripcion, nombre, profesor });
        await cursoRepository.save(nuevoCurso);

        res.redirect('/cursos/listarCursos');
    } catch (err: unknown) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
};


export const modificar = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { descripcion, profesor_id, nombre } = req.body;

    try {
        const cursoRepository = AppDataSource.getRepository(Curso);
        const profesorRepository = AppDataSource.getRepository(Profesor);

        const curso = await cursoRepository.findOne({ where: { id: parseInt(id) } });

        if (!curso) {
            return res.status(404).send('Curso no encontrado');
        }

        const profesor = await profesorRepository.findOne({ where: { id: profesor_id } });

        if (!profesor) {
            return res.status(400).send('Profesor no encontrado');
        }

        cursoRepository.merge(curso, { descripcion, nombre, profesor });
        await cursoRepository.save(curso);

        res.redirect('/cursos/listarCursos');
    } catch (err: unknown) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
};


export const eliminar = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const cursoEstudianteRepository = AppDataSource.getRepository(CursoEstudiante);
        const cursoRepository = AppDataSource.getRepository(Curso);

        
        await cursoEstudianteRepository.delete({ curso: { id: parseInt(id) } });

        
        const deleteResult = await cursoRepository.delete(id);

        if (deleteResult.affected === 1) {
            return res.json({ mensaje: 'Curso eliminado' });
        } else {
            return res.status(404).json({ mensaje: 'Curso no encontrado' });
        }
    } catch (err: unknown) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
};
