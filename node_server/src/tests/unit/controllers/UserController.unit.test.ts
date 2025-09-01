import { Request, Response, NextFunction } from "express";
import { UserService } from "../../../services";
import { logger } from "../../../config";
import { UserController } from "../../../controllers";

// service mock
jest.mock("../../../services/userService");

// logger mock
jest.mock("../../../config/logger", () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

describe("UserController.get_all", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  test("responds with 200 and returns users when the service is working", async () => {
    const mockUsers = [
      {
        id: "994fc575-dc38-4718-9fc5-6a23c0ae0832",
        name: "John Doe",
        email: "john.doe@example.com",
        birth_date: "1995-11-15",
        active: true,
        createdAt: "2025-08-29T12:46:51.619Z",
        updatedAt: "2025-08-29T12:46:51.619Z",
      },
      {
        id: "af488024-dc38-4718-9fc5-6a23c0ae0832",
        name: "Test name",
        email: "test@example.com",
        birth_date: "2000-10-10",
        active: true,
        createdAt: "2025-08-29T12:46:51.619Z",
        updatedAt: "2025-08-29T12:46:51.619Z",
      },
    ];
    (UserService.get_all as jest.Mock).mockResolvedValue(mockUsers);

    await UserController.get_all(req as Request, res as Response, next);

    expect(UserService.get_all).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockUsers);
    expect(next).not.toHaveBeenCalled();
  });

  test("call next(error) and log if the service fails", async () => {
    const fakeError = new Error("db down");
    (UserService.get_all as jest.Mock).mockRejectedValue(fakeError);

    await UserController.get_all(req as Request, res as Response, next);

    expect(UserService.get_all).toHaveBeenCalledTimes(1);
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining("Error getting all users:")
    );
    expect(next).toHaveBeenCalledWith(fakeError);

    // Important: does not respond with status/json in this flow.
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});
