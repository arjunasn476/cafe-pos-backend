"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const menus_service_1 = require("./menus.service");
describe('MenusService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [menus_service_1.MenusService],
        }).compile();
        service = module.get(menus_service_1.MenusService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
//# sourceMappingURL=menus.service.spec.js.map