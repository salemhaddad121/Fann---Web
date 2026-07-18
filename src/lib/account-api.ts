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

// Doesn't take effect immediately — the backend sends a verification link
// to the new address, and the email only actually changes once that's
// clicked (reuses the same /auth/verify-email flow as signup).
export async function changeEmail(
  currentPassword: string,
  newEmail: string,
): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/auth/email", {
    method: "PATCH",
    body: { currentPassword, newEmail },
  });
}

export async function deleteAccount(password: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/auth/me", {
    method: "DELETE",
    body: { password },
  });
}
