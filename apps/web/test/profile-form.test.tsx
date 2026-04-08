import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { ProfileForm } from "../features/profile/ui/ProfileForm";
import { updateProfile, type UserResponse } from "../lib/api";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("../lib/api", () => ({
  updateProfile: vi.fn(),
}));

describe("ProfileForm", () => {
  const baseUser: UserResponse = {
    id: "user-1",
    email: "neo@matrix.io",
    nickname: "Neo",
    avatar: null,
    verified: true,
    role: "USER",
    created_at: "2026-04-08T00:00:00Z",
    bio: "",
    privacy: "public",
  };

  const mockedUpdateProfile = vi.mocked(updateProfile);

  beforeEach(() => {
    // Сбрасываем моки, чтобы тесты не влияли друг на друга.
    mockedUpdateProfile.mockReset();
    push.mockReset();
  });

  it("отправляет форму и редиректит после успеха", async () => {
    // Готовим успешный ответ API.
    mockedUpdateProfile.mockResolvedValue(baseUser);

    render(<ProfileForm token="token-123" user={baseUser} />);

    const user = userEvent.setup();

    // Заполняем поля новыми значениями.
    await user.clear(screen.getByLabelText(/никнейм/i));
    await user.type(screen.getByLabelText(/никнейм/i), "Trinity");
    await user.clear(screen.getByLabelText(/url аватара/i));
    await user.type(
      screen.getByLabelText(/url аватара/i),
      "https://example.com/avatar.png",
    );
    await user.clear(screen.getByLabelText(/о себе/i));
    await user.type(screen.getByLabelText(/о себе/i), "Связь установлена");
    await user.selectOptions(screen.getByLabelText(/приватность/i), "friends");

    // Отправляем форму через кнопку.
    await user.click(screen.getByRole("button", { name: /сохранить/i }));

    // Проверяем, что API вызвано с ожидаемыми данными.
    await waitFor(() =>
      expect(mockedUpdateProfile).toHaveBeenCalledWith("token-123", {
        nickname: "Trinity",
        avatar: "https://example.com/avatar.png",
        bio: "Связь установлена",
        privacy: "friends",
      }),
    );

    // После успеха форма уводит в панель.
    await waitFor(() => expect(push).toHaveBeenCalledWith("/dashboard"));
  });

  it("показывает ошибку при неуспехе", async () => {
    // Имитируем ошибку API.
    mockedUpdateProfile.mockRejectedValue(new Error("Сервер недоступен"));

    render(<ProfileForm token="token-123" user={baseUser} />);

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /сохранить/i }));

    // Ошибка должна появиться на экране.
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Сервер недоступен",
    );
  });
});
