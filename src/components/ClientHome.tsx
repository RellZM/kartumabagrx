"use client";

/* eslint-disable @next/next/no-img-element */
import { ChangeEvent, useRef, useState, useEffect, DragEvent } from "react";
import { Italiana, Jacquarda_Bastarda_9 } from "next/font/google";

const displayFont = Jacquarda_Bastarda_9({
  subsets: ["latin"],
  weight: "400",
});

const italiana = Italiana({
  subsets: ["latin"],
  weight: "400",
});

export type MabaProfile = {
  id: number;
  name: string;
  nrp: string;
  gugus: string;
  photo: string;
};

const emptyForm = {
  name: "",
  nrp: "",
  gugus: "",
  photo: "",
};

function ProfileCard({
  profile,
  animationClass = "",
}: {
  profile: MabaProfile;
  animationClass?: string;
}) {
  return (
    <article
      className={`profile-card w-full max-w-[720px] rounded-2xl bg-[#d9d9d9] p-5 shadow-[0_28px_80px_rgba(0,0,0,0.22)] sm:p-8 ${animationClass}`}>
      <h2
        className={`${italiana.className} mb-5 text-center text-6xl leading-none text-[#e25700] sm:text-8xl`}>
        Kartu Maba
      </h2>

      <div className="grid gap-5 sm:grid-cols-[162px_1fr]">
        <div className="h-56 w-full overflow-hidden bg-white sm:w-[162px] flex items-center justify-center">
          {profile.photo ? (
            <img
              src={profile.photo}
              alt={`Foto ${profile.name}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-[#e25700]/70 p-4 text-center h-full w-full bg-[#f2f2f2] border border-[#e0e0e0] rounded">
              <svg
                className="w-12 h-12 mb-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span className="text-[10px] uppercase tracking-wider font-semibold">
                Foto Maba
              </span>
            </div>
          )}
        </div>

        <dl
          className={`${italiana.className} grid content-start gap-4 text-black`}>
          <div className="bg-white px-5 h-[63px] flex flex-col justify-center text-center">
            <dt className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider mb-0.5">
              Nama Lengkap
            </dt>
            <dd className="truncate text-3xl sm:text-4xl leading-none">
              {profile.name}
            </dd>
          </div>
          <div className="bg-white px-5 h-[63px] flex flex-col justify-center text-center">
            <dt className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider mb-0.5">
              NRP
            </dt>
            <dd className="truncate text-3xl sm:text-4xl leading-none">
              {profile.nrp}
            </dd>
          </div>
          <div className="bg-white px-5 h-[63px] flex flex-col justify-center text-center">
            <dt className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider mb-0.5">
              Nama Gugus
            </dt>
            <dd className="truncate text-3xl sm:text-4xl leading-none">
              {profile.gugus}
            </dd>
          </div>
        </dl>
      </div>
    </article>
  );
}

export default function ClientHome() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewCardRef = useRef<HTMLDivElement>(null);
  const galleryCardRef = useRef<HTMLDivElement>(null);

  const [profiles, setProfiles] = useState<MabaProfile[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [errorMsg, setErrorMsg] = useState("");
  const [showList, setShowList] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [isExiting, setIsExiting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Load profiles from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("maba_profiles");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setProfiles(parsed);
        }
      } catch (err) {
        console.error("Gagal membaca maba_profiles dari localStorage:", err);
      }
    }
  }, []);

  const updateField = (field: keyof typeof emptyForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrorMsg("");
  };

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    processPhotoFile(file);
  };

  const processPhotoFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Berkas harus berupa gambar.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      updateField("photo", reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processPhotoFile(file);
    }
  };

  const createCard = () => {
    // Validations
    if (
      !form.name.trim() ||
      !form.nrp.trim() ||
      !form.gugus.trim() ||
      !form.photo
    ) {
      setErrorMsg("Semua kolom (termasuk foto) harus diisi terlebih dahulu.");
      return;
    }

    if (!/^\d{10}$/.test(form.nrp.trim())) {
      setErrorMsg("NRP harus berupa angka dan berjumlah tepat 10 digit.");
      return;
    }

    setErrorMsg("");

    const nextProfile: MabaProfile = {
      id: Date.now(),
      name: form.name.trim(),
      nrp: form.nrp.trim(),
      gugus: form.gugus.trim(),
      photo: form.photo, // Base64 string from state
    };

    const nextProfiles = [...profiles, nextProfile];
    setProfiles(nextProfiles);
    try {
      localStorage.setItem("maba_profiles", JSON.stringify(nextProfiles));
    } catch (err) {
      console.error("Gagal menyimpan ke localStorage:", err);
    }

    setActiveIndex(nextProfiles.length - 1);
    setDirection("next");
    setForm(emptyForm);
    setShowList(true);
  };

  const deleteActiveCard = () => {
    const nextProfiles = profiles.filter((_, idx) => idx !== activeIndex);
    setProfiles(nextProfiles);
    try {
      localStorage.setItem("maba_profiles", JSON.stringify(nextProfiles));
    } catch (err) {
      console.error("Gagal menghapus dari localStorage:", err);
    }

    if (nextProfiles.length === 0) {
      setShowList(false);
      setActiveIndex(0);
    } else if (activeIndex >= nextProfiles.length) {
      setActiveIndex(nextProfiles.length - 1);
    }
  };

  const changeCard = (nextIndex: number, nextDirection: "next" | "prev") => {
    if (isExiting || nextIndex === activeIndex) {
      return;
    }

    setDirection(nextDirection);
    setIsExiting(true);

    window.setTimeout(() => {
      setActiveIndex(nextIndex);
      setIsExiting(false);
    }, 220);
  };

  const moveCard = (step: 1 | -1) => {
    if (profiles.length === 0) return;
    const nextIndex = (activeIndex + step + profiles.length) % profiles.length;
    changeCard(nextIndex, step === 1 ? "next" : "prev");
  };

  const downloadCardImage = async (
    name: string,
    ref: React.RefObject<HTMLDivElement | null>,
  ) => {
    if (!ref.current) return;
    setIsDownloading(true);
    try {
      const element =
        (ref.current.querySelector(".profile-card") as HTMLElement) ||
        ref.current;
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(element, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        scale: 3, // High resolution export
        logging: false,
      });
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `Kartu-Maba-${name.trim().replace(/\s+/g, "-")}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Gagal mendownload kartu:", err);
      alert("Gagal mengunduh gambar kartu.");
    } finally {
      setIsDownloading(false);
    }
  };

  const activeProfile = profiles[activeIndex];
  const animationClass = isExiting
    ? direction === "next"
      ? "card-slide-out-left"
      : "card-slide-out-right"
    : direction === "next"
      ? "card-slide-next"
      : "card-slide-prev";

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#7300ff] px-5 py-10 text-white sm:px-8">
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-[1180px] flex-col items-center">
        <h1
          className={`${displayFont.className} text-center text-[76px] leading-none sm:text-[118px] lg:text-[160px] cursor-default select-none`}>
          KartU Maba
        </h1>

        {!showList ? (
          <div className="mt-10 grid w-full gap-10 lg:grid-cols-[1fr_1.1fr] items-start">
            {/* Left: Input Form Panel */}
            <div className="w-full rounded-3xl bg-white/10 backdrop-blur-md border border-white/10 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.3)] sm:p-8">
              <h2
                className={`${italiana.className} text-3xl font-bold tracking-wide mb-6 pb-4 border-b border-white/10 text-center lg:text-left`}>
                Isi Data
              </h2>

              <div className="grid gap-6">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-white/70 mb-2 font-semibold">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(event) =>
                      updateField("name", event.target.value)
                    }
                    placeholder="Contoh: Atsumu Miya"
                    className="w-full h-12 bg-white/10 border border-white/20 rounded-xl px-4 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-white/70 mb-2 font-semibold">
                    NRP (10 Digit)
                  </label>
                  <input
                    type="text"
                    value={form.nrp}
                    onChange={(event) => updateField("nrp", event.target.value)}
                    placeholder="Contoh: 5025211001"
                    maxLength={10}
                    className="w-full h-12 bg-white/10 border border-white/20 rounded-xl px-4 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-white/70 mb-2 font-semibold">
                    Nama Gugus
                  </label>
                  <input
                    type="text"
                    value={form.gugus}
                    onChange={(event) =>
                      updateField("gugus", event.target.value)
                    }
                    placeholder="Contoh: Maniak Vibecoding"
                    className="w-full h-12 bg-white/10 border border-white/20 rounded-xl px-4 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-white/70 mb-2 font-semibold">
                    Foto Mahasiswa
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition ${
                      isDragging
                        ? "border-white bg-white/20"
                        : form.photo
                          ? "border-green-400 bg-green-500/5 hover:border-green-300"
                          : "border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10"
                    }`}>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    {form.photo ? (
                      <div className="flex items-center gap-4 w-full">
                        <img
                          src={form.photo}
                          alt="Preview"
                          className="w-16 h-16 object-cover rounded-lg border border-white/20 shadow-md"
                        />
                        <div className="text-left flex-1 min-w-0">
                          <p className="text-xs text-white font-medium truncate">
                            Foto terpilih
                          </p>
                          <p className="text-[10px] text-white/60">
                            Klik/tarik untuk mengganti
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateField("photo", "");
                          }}
                          className="text-red-400 hover:text-red-300 text-xs px-2.5 py-1 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition">
                          Hapus
                        </button>
                      </div>
                    ) : (
                      <>
                        <svg
                          className="w-8 h-8 text-white/40 mb-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="text-sm text-white/60">
                          Klik atau seret file foto ke sini
                        </span>
                        <span className="text-xs text-white/40 mt-1">
                          Mendukung format PNG, JPG, WebP
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {errorMsg && (
                <p className="mt-5 text-center text-red-400 font-bold bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-sm">
                  {errorMsg}
                </p>
              )}

              <div className="mt-8 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={createCard}
                  className={`${italiana.className} w-full h-16 bg-white hover:bg-gray-100 text-2xl font-bold leading-none text-[#7300ff] rounded-xl shadow-lg transition active:scale-[0.98] cursor-pointer`}>
                  Buat Kartu
                </button>

                {profiles.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowList(true)}
                    className={`${italiana.className} w-full h-12 bg-white/10 hover:bg-white/20 text-lg leading-none text-white rounded-xl border border-white/20 transition active:scale-[0.98] cursor-pointer`}>
                    Lihat Galeri Kartu ({profiles.length})
                  </button>
                )}
              </div>
            </div>

            {/* Right: Live Preview Panel */}
            <div className="w-full flex flex-col items-center gap-6 lg:sticky lg:top-8">
              <div ref={previewCardRef} className="w-full flex justify-center">
                <ProfileCard
                  profile={{
                    id: 0,
                    name: form.name.trim() || "NAMA LENGKAP",
                    nrp: form.nrp.trim() || "XXXXXXXXXX",
                    gugus: form.gugus.trim() || "NAMA GUGUS",
                    photo: form.photo,
                  }}
                />
              </div>

              {form.name && form.nrp && form.gugus && form.photo && (
                <button
                  onClick={() => downloadCardImage(form.name, previewCardRef)}
                  disabled={isDownloading}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-white font-medium rounded-xl shadow-lg transition duration-200 active:scale-95 cursor-pointer">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  {isDownloading ? "Mengunduh..." : "Download Preview PNG"}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-10 flex w-full flex-col items-center gap-8">
            {profiles.length > 0 && activeProfile ? (
              <>
                <div className="flex w-full items-center justify-center gap-3 sm:gap-8">
                  <button
                    type="button"
                    aria-label="Kartu sebelumnya"
                    onClick={() => moveCard(-1)}
                    className={`${italiana.className} grid h-14 w-14 shrink-0 place-items-center bg-white text-5xl text-[#7300ff] rounded-full transition active:scale-95 hover:bg-gray-100 sm:h-[90px] sm:w-[90px] sm:text-8xl shadow-lg cursor-pointer`}>
                    &lsaquo;
                  </button>

                  <div className="relative w-full max-w-[720px]">
                    <div ref={galleryCardRef}>
                      <ProfileCard
                        key={activeProfile.id}
                        profile={activeProfile}
                        animationClass={animationClass}
                      />
                    </div>
                    <button
                      onClick={deleteActiveCard}
                      className="absolute -top-4 -right-4 bg-red-600 hover:bg-red-700 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold shadow-lg z-10 transition hover:scale-110 cursor-pointer"
                      title="Hapus Kartu">
                      ✕
                    </button>
                  </div>

                  <button
                    type="button"
                    aria-label="Kartu berikutnya"
                    onClick={() => moveCard(1)}
                    className={`${italiana.className} grid h-14 w-14 shrink-0 place-items-center bg-white text-5xl text-[#7300ff] rounded-full transition active:scale-95 hover:bg-gray-100 sm:h-[90px] sm:w-[90px] sm:text-8xl shadow-lg cursor-pointer`}>
                    &rsaquo;
                  </button>
                </div>

                <div className="flex flex-wrap justify-center gap-3">
                  {profiles.map((profile, index) => (
                    <button
                      key={profile.id}
                      type="button"
                      aria-label={`Buka kartu ${profile.name}`}
                      onClick={() =>
                        changeCard(index, index > activeIndex ? "next" : "prev")
                      }
                      className={`h-3 transition-all rounded-full cursor-pointer ${
                        index === activeIndex
                          ? "w-14 bg-white"
                          : "w-3 bg-white/50 hover:bg-white"
                      }`}
                    />
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-4 mt-4">
                  <button
                    onClick={() =>
                      downloadCardImage(activeProfile.name, galleryCardRef)
                    }
                    disabled={isDownloading}
                    className="flex items-center justify-center gap-2 px-8 py-3.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-white font-semibold rounded-xl shadow-lg transition active:scale-95 cursor-pointer">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    {isDownloading ? "Mengunduh..." : "Download Gambar Kartu"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowList(false)}
                    className={`${italiana.className} h-[52px] px-8 bg-white/10 hover:bg-white/20 text-2xl leading-none text-white rounded-xl border border-white/20 transition active:scale-95 cursor-pointer`}>
                    Buat Kartu Baru
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-10">
                <p className="text-2xl text-white/70 mb-4">
                  Belum ada kartu maba yang dibuat
                </p>
                <button
                  type="button"
                  onClick={() => setShowList(false)}
                  className={`${italiana.className} h-[60px] px-8 bg-white text-2xl leading-none text-[#7300ff] rounded-xl hover:bg-gray-100 transition cursor-pointer`}>
                  Mulai Membuat
                </button>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
