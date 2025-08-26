import { AuthService } from "../../services/authService";

describe("AuthService - Tests unitarios", () => {
    describe("login", () => {
        test("should return a simplified user object", async () => {
            const fullUser = {
                id: "user-1",
                email: "test@example.com",
                name: "Test User",
                password: "hashedpassword",
                someOtherField: "someValue"
            };

            const result = await AuthService.login(fullUser);

            expect(result).toEqual({
                id: "user-1",
                email: "test@example.com",
                name: "Test User",
            });
            expect(result).not.toHaveProperty("password");
            expect(result).not.toHaveProperty("someOtherField");
        });
    });
});
