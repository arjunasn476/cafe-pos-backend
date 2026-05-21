"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const categories_controller_1 = require("./categories.controller");
describe('CategoriesController', () => {
    let controller;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [categories_controller_1.CategoriesController],
        }).compile();
        controller = module.get(categories_controller_1.CategoriesController);
    });
    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
//# sourceMappingURL=categories.controller.spec.js.map