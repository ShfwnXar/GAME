import React, { useMemo, useState } from "react";

type Mode = "LOGIN" | "VERIFY_LOGIN_OTP" | "FORGOT_PASSWORD" | "VERIFY_RESET_OTP" | "RESET_PASSWORD_DONE";
type ApiState = "IDLE" | "SENDING" | "SUCCESS" | "ERROR";

type AuthPayload =
  | { mode: "LOGIN"; email: string }
  | { mode: "VERIFY_LOGIN_OTP"; email: string; otp: string }
  | { mode: "FORGOT_PASSWORD"; email: string }
  | { mode: "VERIFY_RESET_OTP"; email: string; otp: string }
  | { mode: "RESET_PASSWORD_DONE"; email: string };

type Props = {
  onAuthed?: (payload: { email: string; token: string }) => void;
  api?: {
    requestOtp?: (email: string) => Promise<void>;
    verifyOtp?: (email: string, otp: string) => Promise<{ token: string }>;
    requestResetOtp?: (email: string) => Promise<void>;
    verifyResetOtp?: (email: string, otp: string) => Promise<void>;
    setNewPassword?: (email: string, otp: string, newPassword: string) => Promise<void>;
  };
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function onlyDigits(s: string) {
  return s.replace(/[^\d]/g, "");
}

function maskEmail(email: string) {
  const [u, d] = email.split("@");
  if (!u || !d) return email;
  const head = u.slice(0, 2);
  const tail = u.length > 2 ? u.slice(-1) : "";
  return `${head}${"•".repeat(Math.max(0, u.length - 3))}${tail}@${d}`;
}

export function AuthGate(props: Props) {
  const api = props.api;

  const [mode, setMode] = useState<Mode>("LOGIN");
  const [apiState, setApiState] = useState<ApiState>("IDLE");
  const [apiError, setApiError] = useState<string>("");

  const [email, setEmail] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [resetOtp, setResetOtp] = useState<string>("");

  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const [loginOtpRequested, setLoginOtpRequested] = useState<boolean>(false);
  const [resetOtpRequested, setResetOtpRequested] = useState<boolean>(false);

  const payload: AuthPayload = useMemo(() => {
    if (mode === "LOGIN") return { mode, email };
    if (mode === "VERIFY_LOGIN_OTP") return { mode, email, otp };
    if (mode === "FORGOT_PASSWORD") return { mode, email };
    if (mode === "VERIFY_RESET_OTP") return { mode, email, otp: resetOtp };
    return { mode, email };
  }, [mode, email, otp, resetOtp]);

  const emailOk = useMemo(() => isValidEmail(email), [email]);

  const otpOk = useMemo(() => onlyDigits(otp).length === 6, [otp]);
  const resetOtpOk = useMemo(() => onlyDigits(resetOtp).length === 6, [resetOtp]);

  const pwOk = useMemo(() => newPassword.length >= 8, [newPassword]);
  const pwMatch = useMemo(() => newPassword === confirmPassword && confirmPassword.length > 0, [newPassword, confirmPassword]);

  const disabledLoginRequest = useMemo(() => apiState === "SENDING" || !emailOk, [apiState, emailOk]);
  const disabledVerifyLogin = useMemo(() => apiState === "SENDING" || !emailOk || !otpOk, [apiState, emailOk, otpOk]);

  const disabledResetRequest = useMemo(() => apiState === "SENDING" || !emailOk, [apiState, emailOk]);
  const disabledVerifyReset = useMemo(() => apiState === "SENDING" || !emailOk || !resetOtpOk, [apiState, emailOk, resetOtpOk]);
  const disabledSetPassword = useMemo(
    () => apiState === "SENDING" || !emailOk || !resetOtpOk || !pwOk || !pwMatch,
    [apiState, emailOk, resetOtpOk, pwOk, pwMatch]
  );

  const clearError = () => setApiError("");

  const requestLoginOtp = async () => {
    clearError();
    setApiState("SENDING");
    try {
      if (api?.requestOtp) {
        await api.requestOtp(email.trim());
      } else {
        await new Promise((r) => setTimeout(r, 700));
      }
      setLoginOtpRequested(true);
      setMode("VERIFY_LOGIN_OTP");
      setApiState("SUCCESS");
    } catch (e: any) {
      setApiState("ERROR");
      setApiError(e?.message || "Gagal mengirim OTP. Coba lagi.");
    }
  };

  const verifyLoginOtp = async () => {
    clearError();
    setApiState("SENDING");
    try {
      const cleanOtp = onlyDigits(otp).slice(0, 6);
      let token = "demo_token";
      if (api?.verifyOtp) {
        const res = await api.verifyOtp(email.trim(), cleanOtp);
        token = res.token;
      } else {
        await new Promise((r) => setTimeout(r, 700));
      }
      setApiState("SUCCESS");
      props.onAuthed?.({ email: email.trim(), token });
    } catch (e: any) {
      setApiState("ERROR");
      setApiError(e?.message || "OTP salah / kadaluarsa. Coba lagi.");
    }
  };

  const requestReset = async () => {
    clearError();
    setApiState("SENDING");
    try {
      if (api?.requestResetOtp) {
        await api.requestResetOtp(email.trim());
      } else {
        await new Promise((r) => setTimeout(r, 700));
      }
      setResetOtpRequested(true);
      setMode("VERIFY_RESET_OTP");
      setApiState("SUCCESS");
    } catch (e: any) {
      setApiState("ERROR");
      setApiError(e?.message || "Gagal mengirim OTP reset. Coba lagi.");
    }
  };

  const verifyResetOtpStep = async () => {
    clearError();
    setApiState("SENDING");
    try {
      const cleanOtp = onlyDigits(resetOtp).slice(0, 6);
      if (api?.verifyResetOtp) {
        await api.verifyResetOtp(email.trim(), cleanOtp);
      } else {
        await new Promise((r) => setTimeout(r, 700));
      }
      setApiState("SUCCESS");
    } catch (e: any) {
      setApiState("ERROR");
      setApiError(e?.message || "OTP reset salah / kadaluarsa. Coba lagi.");
    }
  };

  const setPassword = async () => {
    clearError();
    setApiState("SENDING");
    try {
      const cleanOtp = onlyDigits(resetOtp).slice(0, 6);
      if (api?.setNewPassword) {
        await api.setNewPassword(email.trim(), cleanOtp, newPassword);
      } else {
        await new Promise((r) => setTimeout(r, 700));
      }
      setApiState("SUCCESS");
      setMode("RESET_PASSWORD_DONE");
    } catch (e: any) {
      setApiState("ERROR");
      setApiError(e?.message || "Gagal mengubah password. Coba lagi.");
    }
  };

  const resetToLogin = () => {
    setMode("LOGIN");
    setApiState("IDLE");
    setApiError("");
    setOtp("");
    setResetOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setLoginOtpRequested(false);
    setResetOtpRequested(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b bg-white">
            <div className="text-xl font-bold text-[#0C2C4A]">Login Pendaftaran</div>
            <div className="text-sm text-gray-600 mt-1">Gunakan OTP via email untuk konfirmasi & reset password.</div>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <label className="text-sm font-medium text-gray-800">Email</label>
              <input
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setApiError("");
                }}
                className="mt-1 w-full border rounded-xl px-3 py-2"
                placeholder="nama@email.com"
                inputMode="email"
                autoComplete="email"
              />
              {!emailOk && email.length > 0 && <div className="text-xs text-red-600 mt-2">Format email tidak valid.</div>}
            </div>

            {mode === "LOGIN" && (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={requestLoginOtp}
                  disabled={disabledLoginRequest}
                  className={[
                    "w-full px-4 py-2 rounded-xl text-white",
                    disabledLoginRequest ? "bg-gray-300 cursor-not-allowed" : "bg-[#0C2C4A] hover:opacity-90",
                  ].join(" ")}
                >
                  Kirim OTP Login
                </button>

                <button
                  type="button"
                  onClick={() => {
                    clearError();
                    setMode("FORGOT_PASSWORD");
                  }}
                  className="w-full px-4 py-2 rounded-xl bg-white border text-gray-700 hover:bg-gray-50"
                >
                  Lupa Password
                </button>
              </div>
            )}

            {mode === "VERIFY_LOGIN_OTP" && (
              <div className="space-y-4">
                <div className="text-sm text-gray-700">
                  OTP dikirim ke <span className="font-semibold">{maskEmail(email.trim())}</span>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-800">OTP (6 digit)</label>
                  <input
                    value={otp}
                    onChange={(e) => {
                      setOtp(onlyDigits(e.target.value).slice(0, 6));
                      setApiError("");
                    }}
                    className="mt-1 w-full border rounded-xl px-3 py-2 tracking-widest text-center text-lg"
                    placeholder="••••••"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                  />
                  {!otpOk && otp.length > 0 && <div className="text-xs text-red-600 mt-2">OTP harus 6 digit.</div>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={requestLoginOtp}
                    disabled={apiState === "SENDING" || !emailOk}
                    className="px-4 py-2 rounded-xl bg-white border text-gray-700 hover:bg-gray-50"
                  >
                    Kirim Ulang OTP
                  </button>

                  <button
                    type="button"
                    onClick={verifyLoginOtp}
                    disabled={disabledVerifyLogin}
                    className={[
                      "px-4 py-2 rounded-xl text-white",
                      disabledVerifyLogin ? "bg-gray-300 cursor-not-allowed" : "bg-[#0C2C4A] hover:opacity-90",
                    ].join(" ")}
                  >
                    Verifikasi & Masuk
                  </button>
                </div>

                <button type="button" onClick={resetToLogin} className="w-full px-4 py-2 rounded-xl bg-white border text-gray-700 hover:bg-gray-50">
                  Kembali
                </button>
              </div>
            )}

            {mode === "FORGOT_PASSWORD" && (
              <div className="space-y-3">
                <div className="text-sm text-gray-700">Kami akan kirim OTP reset ke email kamu.</div>

                <button
                  type="button"
                  onClick={requestReset}
                  disabled={disabledResetRequest}
                  className={[
                    "w-full px-4 py-2 rounded-xl text-white",
                    disabledResetRequest ? "bg-gray-300 cursor-not-allowed" : "bg-[#0C2C4A] hover:opacity-90",
                  ].join(" ")}
                >
                  Kirim OTP Reset
                </button>

                <button type="button" onClick={resetToLogin} className="w-full px-4 py-2 rounded-xl bg-white border text-gray-700 hover:bg-gray-50">
                  Kembali
                </button>
              </div>
            )}

            {mode === "VERIFY_RESET_OTP" && (
              <div className="space-y-4">
                <div className="text-sm text-gray-700">
                  OTP reset dikirim ke <span className="font-semibold">{maskEmail(email.trim())}</span>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-800">OTP Reset (6 digit)</label>
                  <input
                    value={resetOtp}
                    onChange={(e) => {
                      setResetOtp(onlyDigits(e.target.value).slice(0, 6));
                      setApiError("");
                    }}
                    className="mt-1 w-full border rounded-xl px-3 py-2 tracking-widest text-center text-lg"
                    placeholder="••••••"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                  />
                  {!resetOtpOk && resetOtp.length > 0 && <div className="text-xs text-red-600 mt-2">OTP harus 6 digit.</div>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={requestReset}
                    disabled={apiState === "SENDING" || !emailOk}
                    className="px-4 py-2 rounded-xl bg-white border text-gray-700 hover:bg-gray-50"
                  >
                    Kirim Ulang
                  </button>

                  <button
                    type="button"
                    onClick={verifyResetOtpStep}
                    disabled={disabledVerifyReset}
                    className={[
                      "px-4 py-2 rounded-xl text-white",
                      disabledVerifyReset ? "bg-gray-300 cursor-not-allowed" : "bg-[#0C2C4A] hover:opacity-90",
                    ].join(" ")}
                  >
                    Verifikasi OTP
                  </button>
                </div>

                <div className="border-t pt-4">
                  <div className="text-sm font-semibold text-gray-900">Buat Password Baru</div>

                  <div className="mt-3">
                    <label className="text-sm font-medium text-gray-800">Password Baru</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setApiError("");
                      }}
                      className="mt-1 w-full border rounded-xl px-3 py-2"
                      placeholder="minimal 8 karakter"
                      autoComplete="new-password"
                    />
                    {!pwOk && newPassword.length > 0 && <div className="text-xs text-red-600 mt-2">Minimal 8 karakter.</div>}
                  </div>

                  <div className="mt-3">
                    <label className="text-sm font-medium text-gray-800">Konfirmasi Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setApiError("");
                      }}
                      className="mt-1 w-full border rounded-xl px-3 py-2"
                      placeholder="ulang password"
                      autoComplete="new-password"
                    />
                    {!pwMatch && confirmPassword.length > 0 && <div className="text-xs text-red-600 mt-2">Password tidak sama.</div>}
                  </div>

                  <button
                    type="button"
                    onClick={setPassword}
                    disabled={disabledSetPassword}
                    className={[
                      "mt-4 w-full px-4 py-2 rounded-xl text-white",
                      disabledSetPassword ? "bg-gray-300 cursor-not-allowed" : "bg-[#0C2C4A] hover:opacity-90",
                    ].join(" ")}
                  >
                    Simpan Password Baru
                  </button>
                </div>

                <button type="button" onClick={resetToLogin} className="w-full px-4 py-2 rounded-xl bg-white border text-gray-700 hover:bg-gray-50">
                  Kembali
                </button>
              </div>
            )}

            {mode === "RESET_PASSWORD_DONE" && (
              <div className="space-y-4">
                <div className="text-sm text-gray-700">
                  Password berhasil diubah untuk <span className="font-semibold">{maskEmail(email.trim())}</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setMode("LOGIN");
                    setApiState("IDLE");
                    setApiError("");
                    setOtp("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setResetOtp("");
                  }}
                  className="w-full px-4 py-2 rounded-xl text-white bg-[#0C2C4A] hover:opacity-90"
                >
                  Kembali ke Login
                </button>
              </div>
            )}

            {apiError && <div className="text-sm text-red-600">{apiError}</div>}

            {apiState === "SENDING" && <div className="text-sm text-gray-600">Memproses...</div>}
            {apiState === "SUCCESS" && (loginOtpRequested || resetOtpRequested) && <div className="text-sm text-green-700">Berhasil.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
