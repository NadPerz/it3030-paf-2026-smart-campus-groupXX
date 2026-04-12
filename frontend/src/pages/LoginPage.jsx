import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Login page — Google OAuth2 sign-in entry point.
 * Redirects to Spring Security's OAuth2 authorization endpoint.
 */
function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const hasError = searchParams.get('error') != null;

  function handleGoogleLogin() {
    setLoading(true);
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  }

  return (
    <div
      className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4"
      style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
    >
      <div
        className="bg-white w-full text-center"
        style={{
          maxWidth: '440px',
          borderRadius: '16px',
          padding: '48px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        }}
      >
        {/* ── Logo ── */}
        <div
          className="mx-auto flex items-center justify-center bg-[#1D4ED8] text-white text-[22px]"
          style={{ width: '48px', height: '48px', borderRadius: '12px' }}
        >
          🏛️
        </div>

        {/* ── App name ── */}
        <h1 className="text-[28px] font-bold text-[#111827] mt-4 leading-tight">
          Smart Campus Hub
        </h1>

        {/* ── Divider ── */}
        <div className="border-t border-[#E5E7EB] my-5" />

        {/* ── Subtitle ── */}
        <p className="text-[15px] text-[#6B7280] leading-relaxed">
          One platform for bookings, resources and support across your campus.
        </p>

        {/* ── Google sign-in button ── */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full mt-6 flex items-center justify-center gap-2.5 bg-white border-[1.5px] border-[#E5E7EB] text-[15px] font-semibold text-[#111827] transition-all hover:border-[#4285F4] hover:bg-[#F0F4FF]"
          style={{
            height: '48px',
            borderRadius: '8px',
            opacity: loading ? 0.65 : 1,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? (
            <>
              <svg
                className="animate-spin"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" stroke="#E5E7EB" strokeWidth="3" />
                <path
                  d="M12 2a10 10 0 0 1 10 10"
                  stroke="#1D4ED8"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
              Redirecting…
            </>
          ) : (
            <>
              {/* Google multicolour G */}
              <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
                <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
                <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
              </svg>
              Continue with Google
            </>
          )}
        </button>

        {/* ── Error banner (shown when ?error is in the URL) ── */}
        {hasError && (
          <div
            className="mt-4 flex items-center gap-2.5 bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B]"
            style={{ borderRadius: '8px', padding: '10px 14px' }}
          >
            <span className="text-[15px] shrink-0" aria-hidden="true">⚠️</span>
            <span className="text-[13px]">Sign-in failed. Please try again.</span>
          </div>
        )}

        {/* ── Legal caption ── */}
        <p className="text-[12px] text-[#9CA3AF] mt-6">
          By signing in you accept the Campus Terms of Use.
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
