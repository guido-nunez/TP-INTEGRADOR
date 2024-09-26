"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cursoController_1 = require("../controllers/cursoController");
const router = express_1.default.Router();
router.get('/listarCursos', cursoController_1.consultarTodos);
router.get('/crearCurso', cursoController_1.mostrarFormularioCrearCurso);
router.post('/', cursoController_1.insertar);
router.get('/modificarCurso/:id', cursoController_1.consultarUno);
router.post('/modificarCurso/:id', cursoController_1.modificar);
router.route('/:id')
    .get(cursoController_1.consultarUno)
    .put(cursoController_1.modificar)
    .delete(cursoController_1.eliminar);
exports.default = router;
