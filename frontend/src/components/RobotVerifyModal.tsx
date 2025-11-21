"use client";

import { useState, useEffect } from "react";

type EquationParams = {
  from: number;
  to: number;
  a: number;
  b: number;
  c: number;
  d: number;
};

function createRandomEquation(): EquationParams {
  const from = Math.floor(Math.random() * 50) + 50;
  const to = Math.floor(Math.random() * 50) + 10;
  const a = Math.floor(Math.random() * 90) + 10;
  const b = Math.floor(Math.random() * 90) + 10;
  const c = Math.floor(Math.random() * 90) + 10;
  const d = Math.floor(Math.random() * 9) + 2;
  return { from, to, a, b, c, d };
}

export function RobotVerifyModal() {
  const [open, setOpen] = useState(true);
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showRobotBtn, setShowRobotBtn] = useState(false);
  const [equationParams, setEquationParams] = useState<EquationParams | null>(null);

  // ❗ Chỉ random SAU KHI lên client → không còn mismatch với HTML server
  useEffect(() => {
    setEquationParams(createRandomEquation());
  }, []);

  if (!open) return null;

  const handleCheck = () => {
    if (!answer.trim()) {
      setError("⚠️ Bạn phải nhập gì đó trước đã chứ!");
      return;
    }
    setError("❌ Sai rồi… 🤔");
    setShowRobotBtn(true);
  };

  const handleImRobot = () => {
    setOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative max-w-md w-full mx-4">
        <div className="bg-slate-900 text-slate-50 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden">
          
          {/* Header */}
          <div className="px-6 py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              🧪 Bạn có phải là Robot?
            </h2>
            <p className="text-xs opacity-80">Hãy chứng minh bạn là con người.</p>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-4">
            <p className="text-sm">Giải bài toán siêu cơ bản này để tiếp tục:</p>

            {/* Integral vẽ bằng HTML */}
            <div className="px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 flex justify-center">
              <div className="flex items-center gap-3">
                {/* Dấu ∫ + cận */}
                <div className="relative flex items-center">
                  <span className="text-4xl leading-none">∫</span>
                  <span className="absolute -top-3 left-4 text-[10px]">
                    x = {equationParams ? equationParams.from : "?"}
                  </span>
                  <span className="absolute -bottom-3 left-4 text-[10px]">
                    {equationParams ? equationParams.to : "?"}
                  </span>
                </div>

                {/* Phân số */}
                <div className="flex flex-col items-center">
                  <div className="border-b border-slate-400 px-2 pb-1 text-sm font-mono">
                    {equationParams ? (
                      <>
                        ({equationParams.a}x² + {equationParams.b}x + {equationParams.c})
                      </>
                    ) : (
                      "(ax² + bx + c)"
                    )}
                  </div>
                  <div className="pt-1 text-xs font-mono">
                    {equationParams ? <>ln({equationParams.d}x)</> : "ln(dx)"}
                  </div>
                </div>

                <span className="text-sm font-mono">dx</span>
              </div>
            </div>

            <input
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="Nhập đáp án"
            />

            {error && (
              <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/40 rounded-lg px-3 py-2">
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-slate-900/80 border-t border-slate-800 flex justify-between items-center">
            {/* LEFT: nút robot (hover đổi text) */}
            {showRobotBtn ? (
              <button
                onClick={handleImRobot}
                className="group rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg hover:brightness-110 transition"
              >
                <span className="group-hover:hidden">Bạn là robot à?</span>
                <span className="hidden group-hover:inline">🤖 Tôi là robot</span>
              </button>
            ) : (
              <div /> // giữ layout cân 2 bên
            )}

            {/* RIGHT: nút kiểm tra */}
            <button
              onClick={handleCheck}
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800 transition"
            >
              Kiểm tra đáp án 😤
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
