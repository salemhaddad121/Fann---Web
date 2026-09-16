import { Button } from "@/components/auth/Button";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

/**
 * Google and Apple sign-in, carrying the role the account should be created
 * with.
 *
 * The role is the whole reason this is a component rather than two links.
 * The API reads it from the OAuth `state` parameter and the frontend never
 * sent one, so `'artist'` — the backend's fallback — took every social
 * sign-up ever made. A venue owner who tapped Google silently became an
 * artist and was then asked for a passport photo, with no way to correct it
 * anywhere in the product.
 *
 * `consentNotice` is not decoration either. The API records a Terms and
 * Privacy acceptance for a social sign-up, because until recently it
 * recorded nothing at all and those users had no versioned acceptance on
 * file. An acceptance recorded for someone who was never shown the
 * documents would be worse than none, so the notice has to be on any screen
 * where these buttons can CREATE an account.
 */
export function SocialButtons({
  role,
  consentNotice = false,
}: {
  role: "artist" | "planner";
  consentNotice?: boolean;
}) {
  return (
    <>
      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-hairline" />
        <span className="text-xs text-faint">or continue with</span>
        <div className="h-px flex-1 bg-hairline" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <a href={`${API_URL}/auth/google?state=${role}`}>
          <Button type="button" variant="ghost">
            Google
          </Button>
        </a>
        <a href={`${API_URL}/auth/apple?state=${role}`}>
          <Button type="button" variant="ghost">
            Apple
          </Button>
        </a>
      </div>

      {consentNotice && (
        <p className="mt-3 text-center text-xs text-faint">
          By continuing with Google or Apple you agree to our{" "}
          <a
            href="/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-clay-deep underline"
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-clay-deep underline"
          >
            Privacy Policy
          </a>
          .
        </p>
      )}
    </>
  );
}
