"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const menus_controller_1 = require("./menus.controller");
describe('MenusController', () => {
    let controller;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [menus_controller_1.MenusController],
        }).compile();
        controller = module.get(menus_controller_1.MenusController);
    });
    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
//# sourceMappingURL=menus.controller.spec.js.map