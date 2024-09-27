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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const estudianteController_1 = require("../controllers/estudianteController");
const router = express_1.default.Router();
router.get('/listarEstudiantes', estudianteController_1.consultarTodos);
//insertar
router.get('/crearEstudiantes', (req, res) => {
    res.render('crearEstudiantes', {
        pagina: 'Crear Estudiante',
    });
});
router.post('/', (0, estudianteController_1.validar)(), estudianteController_1.insertar);
//modificar
router.get('/modificarEstudiante/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const estudiante = yield (0, estudianteController_1.consultarUno)(req, res);
        if (!estudiante) {
            return res.status(404).send('Estudiante no encontrado');
        }
        res.render('modificarEstudiante', {
            estudiante,
        });
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
}));
router.put('/:id', (0, estudianteController_1.validar)(), estudianteController_1.modificar);
//eliminar
router.delete('/:id', estudianteController_1.eliminar);
exports.default = router;
