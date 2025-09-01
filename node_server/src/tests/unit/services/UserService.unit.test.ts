import { User } from "../../../models";
import { UserService } from "../../../services";

jest.mock("../../src/models/user", () => ({
  User: { findAll: jest.fn() },
}));

// Simple utility to validate ISO 8601 in timestamps
const ISO8601_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

describe("UserService.get_all", () => {
  afterEach(() => jest.clearAllMocks());

  test("devuelve usuarios con el shape esperado", async () => {
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
    (User.findAll as jest.Mock).mockResolvedValue(mockUsers);

    const result = await UserService.get_all();

    expect(User.findAll).toHaveBeenCalledTimes(1);
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);

    // exact deep equality
    expect(result).toEqual(mockUsers);

    // form/field validation
    for (const u of result) {
      expect(u).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
          email: expect.stringContaining("@"),
          birth_date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
          active: expect.any(Boolean),
          createdAt: expect.stringMatching(ISO8601_REGEX),
          updatedAt: expect.stringMatching(ISO8601_REGEX),
        })
      );
    }
  });

  test("returns an empty list when there are no users", async () => {
    (User.findAll as jest.Mock).mockResolvedValue([]);

    const result = await UserService.get_all();

    expect(User.findAll).toHaveBeenCalledTimes(1);
    expect(result).toEqual([]);
  });

  test("propagates errors without transforming them", async () => {
    const rawError = new Error("DB error");
    (User.findAll as jest.Mock).mockRejectedValue(rawError);

    await expect(UserService.get_all()).rejects.toBe(rawError);
  });
});
