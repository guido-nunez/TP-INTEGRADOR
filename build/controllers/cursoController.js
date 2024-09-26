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
exports.eliminar = exports.modificar = exports.insertar = exports.consultarUno = exports.consultarTodos = exports.mostrarFormularioCrearCurso = void 0;
const conexion_1 = require("../db/conexion");
const CursoModel_1 = require("../models/CursoModel");
const ProfesorModel_1 = require("../models/ProfesorModel");
// Mostrar formulario de creación de curso con lista de profesores
const mostrarFormularioCrearCurso = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const profesorRepository = conexion_1.AppDataSource.getRepository(ProfesorModel_1.Profesor);
        const profesores = yield profesorRepository.find(); // Obtener todos los profesores
        res.render('crearCurso', {
            pagina: 'Crear Curso',
            profesores, // Enviamos la lista de profesores a la vista
        });
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
});
exports.mostrarFormularioCrearCurso = mostrarFormularioCrearCurso;
// Consultar todos los cursos
const consultarTodos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cursoRepository = conexion_1.AppDataSource.getRepository(CursoModel_1.Curso);
        const cursos = yield cursoRepository.find({ relations: ['profesor'] }); // Incluye el profesor asociado
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
// Consultar un curso por ID
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
        const profesores = yield profesorRepository.find(); // Obtener la lista de profesores
        if (!curso) {
            return res.status(404).send('Curso no encontrado');
        }
        res.render('modificarCurso', {
            pagina: 'Modificar Curso',
            curso,
            profesores, // Pasar la lista de profesores a la vista
        });
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
});
exports.consultarUno = consultarUno;
// Insertar un nuevo curso
const insertar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
// Modificar un curso existente
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
// Eliminar un curso
const eliminar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const cursoRepository = conexion_1.AppDataSource.getRepository(CursoModel_1.Curso);
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
