"use client";

/* eslint-disable @next/next/no-img-element */
import { ChangeEvent, useRef, useState, useTransition } from "react";
import { Italiana, Jacquarda_Bastarda_9 } from "next/font/google";
import { uploadImageAction } from "@/app/actions";

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
      className={`profile-card w-full max-w-[720px] rounded-2xl bg-[#d9d9d9] p-5 shadow-[0_28px_80px_rgba(0,0,0,0.22)] sm:p-8 ${animationClass}`}
    >
      <h2
        className={`${italiana.className} mb-5 text-center text-6xl leading-none text-[#e25700] sm:text-8xl`}
      >
        Kartu Maba
      </h2>

      <div className="grid gap-5 sm:grid-cols-[162px_1fr]">
        <div className="h-56 w-full overflow-hidden bg-white sm:w-[162px]">
          <img
            src={profile.photo}
            alt={`Foto ${profile.name}`}
            className="h-full w-full object-cover"
          />
        </div>

        <dl className={`${italiana.className} grid content-start gap-4 text-[#e25700]`}>
          <div className="bg-white px-5 h-[63px] flex flex-col justify-center text-center">
            <dt className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider mb-0.5">Nama Lengkap</dt>
            <dd className="truncate text-3xl sm:text-4xl leading-none">{profile.name}</dd>
          </div>
          <div className="bg-white px-5 h-[63px] flex flex-col justify-center text-center">
            <dt className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider mb-0.5">NRP</dt>
            <dd className="truncate text-3xl sm:text-4xl leading-none">{profile.nrp}</dd>
          </div>
          <div className="bg-white px-5 h-[63px] flex flex-col justify-center text-center">
            <dt className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider mb-0.5">Nama Gugus</dt>
            <dd className="truncate text-3xl sm:text-4xl leading-none">{profile.gugus}</dd>
          </div>
        </dl>
      </div>
    </article>
  );
}

export default function ClientHome() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profiles, setProfiles] = useState<MabaProfile[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [errorMsg, setErrorMsg] = useState("");
  const [showList, setShowList] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [isExiting, setIsExiting] = useState(false);
  const [isPending, startTransition] = useTransition();

  const updateField = (field: keyof typeof emptyForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrorMsg("");
  };

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      updateField("photo", reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const createCard = () => {
    // Validations
    if (!form.name.trim() || !form.nrp.trim() || !form.gugus.trim() || !form.photo) {
      setErrorMsg("Semua kolom (termasuk foto) harus diisi terlebih dahulu.");
      return;
    }

    if (!/^\d{10}$/.test(form.nrp.trim())) {
      setErrorMsg("NRP harus berupa angka dan berjumlah tepat 10 digit.");
      return;
    }

    setErrorMsg("");

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append('photo', form.photo);
        
        const photoUrl = await uploadImageAction(formData);
        
        const nextProfile: MabaProfile = {
          id: Date.now(),
          name: form.name.trim(),
          nrp: form.nrp.trim(),
          gugus: form.gugus.trim(),
          photo: photoUrl
        };

        setProfiles((current) => {
          const next = [...current, nextProfile];
          setActiveIndex(next.length - 1);
          return next;
        });
        
        setDirection("next");
        setForm(emptyForm);
        setShowList(true);
      } catch (err) {
        setErrorMsg("Gagal membuat kartu, silakan coba lagi.");
      }
    });
  };

  const deleteActiveCard = () => {
    setProfiles((current) => {
      const next = current.filter((_, idx) => idx !== activeIndex);
      if (next.length === 0) {
        setShowList(false);
        setActiveIndex(0);
      } else if (activeIndex >= next.length) {
        setActiveIndex(next.length - 1);
      }
      return next;
    });
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
          className={`${displayFont.className} text-center text-[76px] leading-none sm:text-[118px] lg:text-[160px]`}
        >
          KartU Maba
        </h1>

        {!showList ? (
          <>
            <div className="mt-10 w-full max-w-[720px] rounded-2xl bg-[#d9d9d9] p-5 shadow-[0_28px_80px_rgba(0,0,0,0.22)] sm:p-8">
              <h2
                className={`${italiana.className} mb-5 text-center text-6xl leading-none text-[#e25700] sm:text-8xl`}
              >
                Kartu Maba
              </h2>

              <div className="grid gap-5 sm:grid-cols-[162px_1fr]">
                <button
                  type="button"
                  aria-label="Pilih foto maba"
                  onClick={() => fileInputRef.current?.click()}
                  className="relative grid h-56 w-full place-items-center overflow-hidden bg-white text-[#111] sm:w-[162px]"
                >
                  {form.photo ? (
                    <img
                      src={form.photo}
                      alt="Preview foto maba"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="relative h-[69px] w-[69px] before:absolute before:left-1/2 before:top-0 before:h-full before:w-3 before:-translate-x-1/2 before:bg-black after:absolute after:left-0 after:top-1/2 after:h-3 after:w-full after:-translate-y-1/2 after:bg-black" />
                  )}
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="sr-only"
                />

                <div className="grid content-start gap-4">
                  <input
                    value={form.name}
                    onChange={(event) => updateField("name", event.target.value)}
                    placeholder="Nama Lengkap"
                    className={`${italiana.className} h-[63px] w-full bg-white px-5 text-center text-4xl text-black outline-none placeholder:text-black sm:text-5xl`}
                  />
                  <input
                    value={form.nrp}
                    onChange={(event) => updateField("nrp", event.target.value)}
                    placeholder="NRP"
                    className={`${italiana.className} h-[63px] w-full bg-white px-5 text-center text-4xl text-black outline-none placeholder:text-black sm:text-5xl`}
                  />
                  <input
                    value={form.gugus}
                    onChange={(event) =>
                      updateField("gugus", event.target.value)
                    }
                    placeholder="Nama Gugus"
                    className={`${italiana.className} h-[63px] w-full bg-white px-5 text-center text-4xl text-black outline-none placeholder:text-black sm:text-5xl`}
                  />
                </div>
              </div>
              {errorMsg && (
                <p className="mt-4 text-center text-red-500 font-bold bg-white p-2 rounded">{errorMsg}</p>
              )}
            </div>

            <div className="mt-16 grid w-full max-w-[720px] gap-4">
              <button
                type="button"
                onClick={createCard}
                disabled={isPending}
                className={`${italiana.className} h-[90px] bg-[#fffdfd] text-6xl leading-none text-[#e25700] transition hover:translate-y-[-2px] hover:bg-white sm:text-8xl disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isPending ? 'Membuat...' : 'Buat Kartu'}
              </button>

              {profiles.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowList(true)}
                  className={`${italiana.className} h-[70px] bg-[#fffdfd] text-4xl leading-none text-[#e25700] transition hover:translate-y-[-2px] hover:bg-white sm:text-6xl`}
                >
                  Lihat List Kartu
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="mt-10 flex w-full flex-col items-center gap-8">
            {profiles.length > 0 && activeProfile ? (
              <>
                <div className="flex w-full items-center justify-center gap-3 sm:gap-8">
                  <button
                    type="button"
                    aria-label="Kartu sebelumnya"
                    onClick={() => moveCard(-1)}
                    className={`${italiana.className} grid h-14 w-14 shrink-0 place-items-center bg-[#fffdfd] text-5xl text-[#e25700] transition hover:-translate-x-1 sm:h-[90px] sm:w-[90px] sm:text-8xl`}
                  >
                    &lsaquo;
                  </button>

                  <div className="relative w-full max-w-[720px]">
                    <ProfileCard
                      key={activeProfile.id}
                      profile={activeProfile}
                      animationClass={animationClass}
                    />
                    <button
                      onClick={deleteActiveCard}
                      className="absolute -top-4 -right-4 bg-red-600 hover:bg-red-700 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold shadow-lg z-10 transition-transform hover:scale-110"
                      title="Hapus Kartu"
                    >
                      X
                    </button>
                  </div>

                  <button
                    type="button"
                    aria-label="Kartu berikutnya"
                    onClick={() => moveCard(1)}
                    className={`${italiana.className} grid h-14 w-14 shrink-0 place-items-center bg-[#fffdfd] text-5xl text-[#e25700] transition hover:translate-x-1 sm:h-[90px] sm:w-[90px] sm:text-8xl`}
                  >
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
                      className={`h-3 transition-all ${
                        index === activeIndex
                          ? "w-14 bg-white"
                          : "w-3 bg-white/50 hover:bg-white"
                      }`}
                    />
                  ))}
                </div>
              </>
            ) : (
              <p className="text-2xl text-white">Belum ada kartu</p>
            )}

            <button
              type="button"
              onClick={() => setShowList(false)}
              className={`${italiana.className} h-[70px] w-full max-w-[420px] bg-[#fffdfd] text-4xl leading-none text-[#e25700] transition hover:translate-y-[-2px] hover:bg-white sm:text-6xl`}
            >
              Buat Lagi
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
