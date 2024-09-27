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
const express_1 = require("express");
const profesoresController_1 = require("../controllers/profesoresController");
const conexion_1 = require("../db/conexion");
const ProfesorModel_1 = require("../models/ProfesorModel");
const router = (0, express_1.Router)();
router.get('/listarProfesores', profesoresController_1.consultarTodos);
router.get('/crearProfesor', (req, res) => {
    res.render('crearProfesor', {
        pagina: 'Crear Profesor',
    });
});
router.get('/modificarProfesor/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const profesorRepository = conexion_1.AppDataSource.getRepository(ProfesorModel_1.Profesor);
        const profesor = yield profesorRepository.findOne({ where: { id: parseInt(id) } });
        if (!profesor) {
            return res.status(404).send('Profesor no encontrado');
        }
        res.render('modificarProfesor', {
            profesor,
            pagina: 'Modificar Profesor'
        });
    }
    catch (err) {
        console.error('Error al obtener el profesor:', err);
        res.status(500).send('Error al obtener el profesor');
    }
}));
router.post('/', (0, profesoresController_1.validar)(), profesoresController_1.insertar);
router.put('/:id', (0, profesoresController_1.validar)(), profesoresController_1.modificar);
router.delete('/:id', profesoresController_1.eliminar);
exports.default = router;
