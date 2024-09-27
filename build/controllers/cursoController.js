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
exports.eliminar = exports.modificar = exports.insertar = exports.consultarUno = exports.consultarTodos = exports.mostrarFormularioCrearCurso = exports.validarCurso = void 0;
const conexion_1 = require("../db/conexion");
const CursoModel_1 = require("../models/CursoModel");
const ProfesorModel_1 = require("../models/ProfesorModel");
const CursoEstudianteModel_1 = require("../models/CursoEstudianteModel");
const express_validator_1 = require("express-validator");
// Validaciones para los campos del curso
const validarCurso = () => [
    (0, express_validator_1.check)('nombre')
        .notEmpty().withMessage('El nombre es obligatorio')
        .isLength({ min: 3 }).withMessage('El nombre debe tener al menos 3 caracteres'),
    (0, express_validator_1.check)('descripcion')
        .notEmpty().withMessage('La descripción es obligatoria')
        .isLength({ min: 5 }).withMessage('La descripción debe tener al menos 5 caracteres'),
    (0, express_validator_1.check)('profesor_id')
        .isNumeric().withMessage('El profesor debe ser un número válido')
        .custom((profesor_id) => __awaiter(void 0, void 0, void 0, function* () {
        const profesorRepository = conexion_1.AppDataSource.getRepository(ProfesorModel_1.Profesor);
        const profesor = yield profesorRepository.findOne({ where: { id: profesor_id } });
        if (!profesor) {
            throw new Error('El profesor no existe');
        }
    })),
    (req, res, next) => {
        const errores = (0, express_validator_1.validationResult)(req);
        if (!errores.isEmpty()) {
            const profesorRepository = conexion_1.AppDataSource.getRepository(ProfesorModel_1.Profesor);
            profesorRepository.find().then((profesores) => {
                return res.render('crearCurso', {
                    pagina: 'Crear Curso',
                    profesores,
                    errores: errores.array(),
                    curso: req.body,
                });
            });
        }
        else {
            next();
        }
    }
];
exports.validarCurso = validarCurso;
const mostrarFormularioCrearCurso = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const profesorRepository = conexion_1.AppDataSource.getRepository(ProfesorModel_1.Profesor);
        const profesores = yield profesorRepository.find();
        res.render('crearCurso', {
            pagina: 'Crear Curso',
            profesores,
        });
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
});
exports.mostrarFormularioCrearCurso = mostrarFormularioCrearCurso;
const consultarTodos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cursoRepository = conexion_1.AppDataSource.getRepository(CursoModel_1.Curso);
        const cursos = yield cursoRepository.find({ relations: ['profesor'] });
        res.render('listarCursos', {
            pagina: 'Lista de Cursos',
            cursos,
        });
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
});
exports.consultarTodos = consultarTodos;
const consultarUno = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const idNumber = Number(id);
    if (isNaN(idNumber)) {
        return res.status(400).send('ID inválido, debe ser un número');
    }
    try {
        const cursoRepository = conexion_1.AppDataSource.getRepository(CursoModel_1.Curso);
        const curso = yield cursoRepository.findOne({ where: { id: idNumber }, relations: ['profesor'] });
        const profesorRepository = conexion_1.AppDataSource.getRepository(ProfesorModel_1.Profesor);
        const profesores = yield profesorRepository.find();
        if (!curso) {
            return res.status(404).send('Curso no encontrado');
        }
        res.render('modificarCurso', {
            pagina: 'Modificar Curso',
            curso,
            profesores,
        });
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
});
exports.consultarUno = consultarUno;
const insertar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errores = (0, express_validator_1.validationResult)(req);
    // Si hay errores, renderiza el formulario con los errores y los datos anteriores
    if (!errores.isEmpty()) {
        const profesorRepository = conexion_1.AppDataSource.getRepository(ProfesorModel_1.Profesor);
        const profesores = yield profesorRepository.find(); // Para volver a llenar la lista de profesores
        return res.render('crearCurso', {
            pagina: 'Crear Curso',
            errores: errores.array(),
            profesores,
            datos: req.body // Mantén los datos ingresados por el usuario
        });
    }
    const { descripcion, profesor_id, nombre } = req.body;
    try {
        const cursoRepository = conexion_1.AppDataSource.getRepository(CursoModel_1.Curso);
        const profesorRepository = conexion_1.AppDataSource.getRepository(ProfesorModel_1.Profesor);
        const profesor = yield profesorRepository.findOne({ where: { id: profesor_id } });
        if (!profesor) {
            return res.status(400).send('Profesor no encontrado');
        }
        const nuevoCurso = cursoRepository.create({ descripcion, nombre, profesor });
        yield cursoRepository.save(nuevoCurso);
        res.redirect('/cursos/listarCursos');
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
});
exports.insertar = insertar;
const modificar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { descripcion, profesor_id, nombre } = req.body;
    try {
        const cursoRepository = conexion_1.AppDataSource.getRepository(CursoModel_1.Curso);
        const profesorRepository = conexion_1.AppDataSource.getRepository(ProfesorModel_1.Profesor);
        const curso = yield cursoRepository.findOne({ where: { id: parseInt(id) } });
        if (!curso) {
            return res.status(404).send('Curso no encontrado');
        }
        const profesor = yield profesorRepository.findOne({ where: { id: profesor_id } });
        if (!profesor) {
            return res.status(400).send('Profesor no encontrado');
        }
        cursoRepository.merge(curso, { descripcion, nombre, profesor });
        yield cursoRepository.save(curso);
        res.redirect('/cursos/listarCursos');
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
});
exports.modificar = modificar;
const eliminar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const cursoEstudianteRepository = conexion_1.AppDataSource.getRepository(CursoEstudianteModel_1.CursoEstudiante);
        const cursoRepository = conexion_1.AppDataSource.getRepository(CursoModel_1.Curso);
        yield cursoEstudianteRepository.delete({ curso: { id: parseInt(id) } });
        const deleteResult = yield cursoRepository.delete(id);
        if (deleteResult.affected === 1) {
            return res.json({ mensaje: 'Curso eliminado' });
        }
        else {
            return res.status(404).json({ mensaje: 'Curso no encontrado' });
        }
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
});
exports.eliminar = eliminar;
