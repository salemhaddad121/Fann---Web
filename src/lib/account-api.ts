import { apiFetch } from "@/lib/api";

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/auth/password", {
    method: "PATCH",
    body: { currentPassword, newPassword },
  });
}

export async function deleteAccount(password: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/auth/me", {
    method: "DELETE",
    body: { password },
  });
}
