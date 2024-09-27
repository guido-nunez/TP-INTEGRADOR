import { Request, Response } from 'express';
import { check, validationResult } from 'express-validator';
import { AppDataSource } from '../db/conexion';
import { CursoEstudiante } from '../models/CursoEstudianteModel';
import { Estudiante } from '../models/EstudianteModel';
import { Curso } from '../models/CursoModel';
import { Profesor } from '../models/ProfesorModel';

export const mostrarFormularioInscripcion = async (req: Request, res: Response) => {
    try {
        const estudiantes = await AppDataSource.getRepository(Estudiante).find();
        const cursos = await AppDataSource.getRepository(Curso).find();
        const profesores = await AppDataSource.getRepository(Profesor).find();
        
        res.render('crearInscripcion', { 
            pagina: 'Registrar Inscripción', 
            estudiantes, 
            cursos,
            profesores
        });
    } catch (err: unknown) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
};


export const consultarInscripciones = async (req: Request, res: Response) => {
    try {
        const inscripciones = await AppDataSource.getRepository(CursoEstudiante).find({
            relations: ['estudiante', 'curso', 'curso.profesor'], 
        });

        res.render('listarInscripciones', { 
            pagina: 'Inscripciones', 
            inscripciones 
        });
    } catch (err: unknown) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
};


export const mostrarModificarInscripcion = async (req: Request, res: Response) => {
    const estudianteId = parseInt(req.params.estudiante_id);
    const cursoId = parseInt(req.params.curso_id);

    try {

        const inscripcion = await AppDataSource.getRepository(CursoEstudiante).findOne({
            where: {
                estudiante: { id: estudianteId }, 
                curso: { id: cursoId } 
            },
            relations: ['estudiante', 'curso'] 
        });

        if (!inscripcion) {
            return res.status(404).send('Inscripción no encontrada');
        }

        const estudiantes = await AppDataSource.getRepository(Estudiante).find();
        const cursos = await AppDataSource.getRepository(Curso).find();

        res.render('modificarInscripcion', { 
            inscripcion, 
            estudiantes, 
            cursos 
        });
    } catch (err: unknown) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
};

// Modificar Inscripción
export const modificarInscripcion = async (req: Request, res: Response) => {
    const { estudiante_id, curso_id } = req.params;
    const { nota, fecha_inscripcion } = req.body;

    const cursoId = parseInt(curso_id, 10); 
    const estudianteId = parseInt(estudiante_id, 10); 

    if (isNaN(estudianteId) || isNaN(cursoId)) {
        return res.status(400).json({ message: 'El ID del estudiante o del curso no es válido.' });
    }

    const inscripcionRepo = AppDataSource.getRepository(CursoEstudiante);

    try {
        const inscripcion = await inscripcionRepo.findOneOrFail({
            where: { curso: { id: cursoId }, estudiante: { id: estudianteId } }
        });

        
        inscripcion.nota = parseFloat(nota);  
        inscripcion.fecha = new Date(fecha_inscripcion); 

        await inscripcionRepo.save(inscripcion);

        
        res.redirect('/inscripciones/listarInscripciones');
    } catch (error) {
        console.error("Error al modificar la inscripción:", error);
        res.status(500).json({ message: 'Error al modificar la inscripción' });
    }
};

// Validar consulta por alumno
export const consultarxAlumno = [
    check('id').isInt().withMessage('El ID del estudiante debe ser un número entero'),
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const estudianteId = parseInt(req.params.id);

        try {
            const inscripciones = await AppDataSource.getRepository(CursoEstudiante)
                .createQueryBuilder('cursosEstudiantes')
                .where('cursosEstudiantes.estudianteId = :estudianteId', { estudianteId })
                .getMany();
            res.json(inscripciones);
        } catch (err: unknown) {
            if (err instanceof Error) {
                res.status(500).send(err.message);
            }
        }
    }
];

// Validar consulta por curso
export const consultarxCurso = [
    check('id').isInt().withMessage('El ID del curso debe ser un número entero'),
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const cursoId = parseInt(req.params.id);

        try {
            const inscripciones = await AppDataSource.getRepository(CursoEstudiante)
                .createQueryBuilder('cursosEstudiantes')
                .where('cursosEstudiantes.cursoId = :cursoId', { cursoId })
                .getMany();
            res.json(inscripciones);
        } catch (err: unknown) {
            if (err instanceof Error) {
                res.status(500).send(err.message);
            }
        }
    }
];

// Validar inscripción
export const inscribir = [
    check('estudiante_id').isInt().withMessage('El ID del estudiante debe ser un número entero'),
    check('curso_id').isInt().withMessage('El ID del curso debe ser un número entero'),
    check('profesor_id').isInt().withMessage('El ID del profesor debe ser un número entero'),
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { estudiante_id, curso_id, profesor_id, nota } = req.body;

        try {
            const [estudiante, curso] = await Promise.all([
                AppDataSource.getRepository(Estudiante).findOneBy({ id: estudiante_id }),
                AppDataSource.getRepository(Curso).findOneBy({ id: curso_id })
            ]);

            if (!estudiante || !curso) {
                return res.status(404).send('Estudiante o curso no encontrado');
            }

            const nuevaInscripcion = AppDataSource.getRepository(CursoEstudiante).create({
                estudiante,
                curso,
                profesor_id,
                nota
            });

            await AppDataSource.getRepository(CursoEstudiante).save(nuevaInscripcion);
            res.redirect('/inscripciones/listarInscripciones');
        } catch (err: unknown) {
            if (err instanceof Error) {
                res.status(500).send(err.message);
            }
        }
    }
];

export const cancelarInscripcion = async (req: Request, res: Response) => {
    const { estudiante_id, curso_id } = req.params;

    try {
        const inscripcion = await AppDataSource.getRepository(CursoEstudiante).findOneBy({
            estudiante: { id: parseInt(estudiante_id) },
            curso: { id: parseInt(curso_id) }
        });

        if (!inscripcion) {
            return res.status(404).json({ mensaje: 'Inscripción no encontrada' });
        }

        await AppDataSource.getRepository(CursoEstudiante).remove(inscripcion);
        res.status(200).json({ mensaje: 'Inscripción eliminada exitosamente' });
    } catch (err: unknown) {
        if (err instanceof Error) {
            res.status(500).json({ mensaje: err.message });
        }
    }
};

// Validar calificación
export const calificar = [
    check('estudiante_id').isInt().withMessage('El ID del estudiante debe ser un número entero'),
    check('curso_id').isInt().withMessage('El ID del curso debe ser un número entero'),
    check('nota').isFloat({ min: 0, max: 10 }).withMessage('La nota debe ser un número entre 0 y 10'),
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { estudiante_id, curso_id, nota } = req.body;

        try {
            const inscripcion = await AppDataSource.getRepository(CursoEstudiante)
                .findOneBy({ estudiante: { id: parseInt(estudiante_id) }, curso: { id: parseInt(curso_id) } });

            if (inscripcion) {
                inscripcion.nota = nota;
                await AppDataSource.getRepository(CursoEstudiante).save(inscripcion);
                res.json('Calificación registrada');
            } else {
                res.status(404).send('Inscripción no encontrada');
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                res.status(500).send(err.message);
            }
        }
    }
];
