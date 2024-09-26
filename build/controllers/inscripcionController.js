"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calificar = exports.cancelarInscripcion = exports.inscribir = exports.consultarxCurso = exports.consultarxAlumno = exports.modificarInscripcion = exports.mostrarModificarInscripcion = exports.consultarInscripciones = exports.mostrarFormularioInscripcion = void 0;
const express_validator_1 = require("express-validator");
const conexion_1 = require("../db/conexion");
const CursoEstudianteModel_1 = require("../models/CursoEstudianteModel");
const EstudianteModel_1 = require("../models/EstudianteModel");
const CursoModel_1 = require("../models/CursoModel");
const ProfesorModel_1 = require("../models/ProfesorModel");
const mostrarFormularioInscripcion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const estudiantes = yield conexion_1.AppDataSource.getRepository(EstudianteModel_1.Estudiante).find();
        const cursos = yield conexion_1.AppDataSource.getRepository(CursoModel_1.Curso).find();
        const profesores = yield conexion_1.AppDataSource.getRepository(ProfesorModel_1.Profesor).find();
        res.render('crearInscripcion', {
            pagina: 'Registrar Inscripción',
            estudiantes,
            cursos,
            profesores
        });
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
});
exports.mostrarFormularioInscripcion = mostrarFormularioInscripcion;
// Validar consulta de inscripciones
const consultarInscripciones = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const inscripciones = yield conexion_1.AppDataSource.getRepository(CursoEstudianteModel_1.CursoEstudiante).find({
            relations: ['estudiante', 'curso', 'curso.profesor'],
        });
        res.render('listarInscripciones', {
            pagina: 'Inscripciones',
            inscripciones
        });
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
});
exports.consultarInscripciones = consultarInscripciones;
// inscripcionController.ts
const mostrarModificarInscripcion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const estudianteId = parseInt(req.params.estudiante_id); // ID del estudiante desde los parámetros
    const cursoId = parseInt(req.params.curso_id); // ID del curso desde los parámetros
    try {
        // Busca la inscripción utilizando estudianteId y cursoId
        const inscripcion = yield conexion_1.AppDataSource.getRepository(CursoEstudianteModel_1.CursoEstudiante).findOne({
            where: {
                estudiante: { id: estudianteId }, // Relación con el estudiante
                curso: { id: cursoId } // Relación con el curso
            },
            relations: ['estudiante', 'curso'] // Carga las relaciones necesarias
        });
        if (!inscripcion) {
            return res.status(404).send('Inscripción no encontrada');
        }
        const estudiantes = yield conexion_1.AppDataSource.getRepository(EstudianteModel_1.Estudiante).find();
        const cursos = yield conexion_1.AppDataSource.getRepository(CursoModel_1.Curso).find();
        res.render('modificarInscripcion', {
            inscripcion,
            estudiantes,
            cursos
        });
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
});
exports.mostrarModificarInscripcion = mostrarModificarInscripcion;
// Modificar Inscripción
const modificarInscripcion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { estudiante_id, fecha_inscripcion } = req.body;
    // Conversión de parámetros de la URL a número
    const cursoId = parseInt(req.params.curso_id, 10); // ID del curso
    const estudianteId = parseInt(estudiante_id, 10); // ID del estudiante
    // Imprimir los valores para depuración
    console.log("Estudiante ID:", estudianteId);
    console.log("Curso ID:", cursoId);
    if (isNaN(estudianteId) || isNaN(cursoId)) {
        return res.status(400).json({ message: 'El ID del estudiante o del curso no es válido.' });
    }
    const inscripcionRepo = conexion_1.AppDataSource.getRepository(CursoEstudianteModel_1.CursoEstudiante);
    try {
        const inscripcion = yield inscripcionRepo.findOneOrFail({
            where: { curso: { id: cursoId }, estudiante: { id: estudianteId } }
        });
        // Actualizar los valores de la inscripción
        inscripcion.fecha = new Date(fecha_inscripcion); // Actualizar la fecha
        yield inscripcionRepo.save(inscripcion);
        res.status(200).json({ message: 'Inscripción modificada correctamente' });
    }
    catch (error) {
        console.error("Error al modificar la inscripción:", error);
        res.status(500).json({ message: 'Error al modificar la inscripción' });
    }
});
exports.modificarInscripcion = modificarInscripcion;
// Validar consulta por alumno
exports.consultarxAlumno = [
    (0, express_validator_1.check)('id').isInt().withMessage('El ID del estudiante debe ser un número entero'),
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const estudianteId = parseInt(req.params.id);
        try {
            const inscripciones = yield conexion_1.AppDataSource.getRepository(CursoEstudianteModel_1.CursoEstudiante)
                .createQueryBuilder('cursosEstudiantes')
                .where('cursosEstudiantes.estudianteId = :estudianteId', { estudianteId })
                .getMany();
            res.json(inscripciones);
        }
        catch (err) {
            if (err instanceof Error) {
                res.status(500).send(err.message);
            }
        }
    })
];
// Validar consulta por curso
exports.consultarxCurso = [
    (0, express_validator_1.check)('id').isInt().withMessage('El ID del curso debe ser un número entero'),
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const cursoId = parseInt(req.params.id);
        try {
            const inscripciones = yield conexion_1.AppDataSource.getRepository(CursoEstudianteModel_1.CursoEstudiante)
                .createQueryBuilder('cursosEstudiantes')
                .where('cursosEstudiantes.cursoId = :cursoId', { cursoId })
                .getMany();
            res.json(inscripciones);
        }
        catch (err) {
            if (err instanceof Error) {
                res.status(500).send(err.message);
            }
        }
    })
];
// Validar inscripción
exports.inscribir = [
    (0, express_validator_1.check)('estudiante_id').isInt().withMessage('El ID del estudiante debe ser un número entero'),
    (0, express_validator_1.check)('curso_id').isInt().withMessage('El ID del curso debe ser un número entero'),
    (0, express_validator_1.check)('profesor_id').isInt().withMessage('El ID del profesor debe ser un número entero'),
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { estudiante_id, curso_id, profesor_id, nota } = req.body;
        try {
            const [estudiante, curso] = yield Promise.all([
                conexion_1.AppDataSource.getRepository(EstudianteModel_1.Estudiante).findOneBy({ id: estudiante_id }),
                conexion_1.AppDataSource.getRepository(CursoModel_1.Curso).findOneBy({ id: curso_id })
            ]);
            if (!estudiante || !curso) {
                return res.status(404).send('Estudiante o curso no encontrado');
            }
            const nuevaInscripcion = conexion_1.AppDataSource.getRepository(CursoEstudianteModel_1.CursoEstudiante).create({
                estudiante,
                curso,
                profesor_id,
                nota
            });
            yield conexion_1.AppDataSource.getRepository(CursoEstudianteModel_1.CursoEstudiante).save(nuevaInscripcion);
            res.redirect('/inscripciones/listarInscripciones');
        }
        catch (err) {
            if (err instanceof Error) {
                res.status(500).send(err.message);
            }
        }
    })
];
const cancelarInscripcion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { estudiante_id, curso_id } = req.params;
    try {
        const inscripcion = yield conexion_1.AppDataSource.getRepository(CursoEstudianteModel_1.CursoEstudiante).findOneBy({
            estudiante: { id: parseInt(estudiante_id) },
            curso: { id: parseInt(curso_id) }
        });
        if (!inscripcion) {
            return res.status(404).json({ mensaje: 'Inscripción no encontrada' });
        }
        yield conexion_1.AppDataSource.getRepository(CursoEstudianteModel_1.CursoEstudiante).remove(inscripcion);
        res.status(200).json({ mensaje: 'Inscripción eliminada exitosamente' });
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ mensaje: err.message });
        }
    }
});
exports.cancelarInscripcion = cancelarInscripcion;
// Validar calificación
exports.calificar = [
    (0, express_validator_1.check)('estudiante_id').isInt().withMessage('El ID del estudiante debe ser un número entero'),
    (0, express_validator_1.check)('curso_id').isInt().withMessage('El ID del curso debe ser un número entero'),
    (0, express_validator_1.check)('nota').isFloat({ min: 0, max: 10 }).withMessage('La nota debe ser un número entre 0 y 10'),
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { estudiante_id, curso_id, nota } = req.body;
        try {
            const inscripcion = yield conexion_1.AppDataSource.getRepository(CursoEstudianteModel_1.CursoEstudiante)
                .findOneBy({ estudiante: { id: parseInt(estudiante_id) }, curso: { id: parseInt(curso_id) } });
            if (inscripcion) {
                inscripcion.nota = nota;
                yield conexion_1.AppDataSource.getRepository(CursoEstudianteModel_1.CursoEstudiante).save(inscripcion);
                res.json('Calificación registrada');
            }
            else {
                res.status(404).send('Inscripción no encontrada');
            }
        }
        catch (err) {
            if (err instanceof Error) {
                res.status(500).send(err.message);
            }
        }
    })
];
