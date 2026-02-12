import React, { useMemo, useState } from "react";
import type { Jenjang, Sport } from "../lib/constants";
import { BANK_INFO } from "../lib/constants";
import { calcFees } from "../lib/fees";
import { Step1Sport } from "./wizard/Step1Sport";
import { Step2Numbers } from "./wizard/Step2Numbers";
import { Step3Entry } from "./wizard/Step3Entry";
import { WizardStepsHeader } from "./wizard/WizardStepsHeader";

export type Step1Data = {
  sport: Sport | "";
  jenjang: Jenjang | "";
  divisiPanahan: string | "";
  jumlahAtlet: number;
  jumlahOfficial: number;
};

export type NumberEntry = {
  eventId: string;
  nomor: string;
  kind: "INDIVIDU" | "ESTAFET" | "BEREGU";
  jumlahAtlet: number;
  jumlahOfficial: number;
};

export type KontingenProfile = {
  namaPendaftar: string;
  sekolahInstansi: string;
  alamat: string;
  noWa: string;
  email: string;
};

export type PersonEntry = {
  role: "ATLET" | "OFFICIAL";
  roleIndex: number;
  nama: string;
  jenisKelamin: "" | "L" | "P";
  tempatLahir: string;
  tanggalLahir: string;
  nik: string;
  sekolah_instansi: string;
  noWa: string;
  email: string;
};

export type Step3Tab = "KONTINGEN" | "ATLET" | "OFFICIAL";
export type Step3View = "FORM" | "REVIEW";
export type Step3UiState = { tab: Step3Tab; view: Step3View; athleteIndex: number; officialIndex: number };

type PersonDocs = {
  ktp_kia: File | null;
  kartu_pelajar_mahasiswa: File | null;
  raport_khs: File | null;
  bpjs: File | null;
  pas_foto: File | null;
};

function makePeople(step1: Step1Data): PersonEntry[] {
  const people: PersonEntry[] = [];
  for (let i = 0; i < step1.jumlahAtlet; i++) {
    people.push({
      role: "ATLET",
      roleIndex: i,
      nama: "",
      jenisKelamin: "",
      tempatLahir: "",
      tanggalLahir: "",
      nik: "",
      sekolah_instansi: "",
      noWa: "",
      email: "",
    });
  }
  for (let i = 0; i < step1.jumlahOfficial; i++) {
    people.push({
      role: "OFFICIAL",
      roleIndex: i,
      nama: "",
      jenisKelamin: "",
      tempatLahir: "",
      tanggalLahir: "",
      nik: "",
      sekolah_instansi: "",
      noWa: "",
      email: "",
    });
  }
  return people;
}

function emptyDocs(): PersonDocs {
  return { ktp_kia: null, kartu_pelajar_mahasiswa: null, raport_khs: null, bpjs: null, pas_foto: null };
}

export function RegistrationWizard() {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [step1, setStep1] = useState<Step1Data>({
    sport: "",
    jenjang: "",
    divisiPanahan: "",
    jumlahAtlet: 1,
    jumlahOfficial: 1,
  });

  const [numbers, setNumbers] = useState<NumberEntry[]>([]);

  const fees = useMemo(() => {
    if (!step1.sport) return null;
    return calcFees(step1.sport, step1.jumlahAtlet, step1.jumlahOfficial);
  }, [step1.sport, step1.jumlahAtlet, step1.jumlahOfficial]);

  const [kontingen, setKontingen] = useState<KontingenProfile>({
    namaPendaftar: "",
    sekolahInstansi: "",
    alamat: "",
    noWa: "",
    email: "",
  });

  const [kontingenFiles, setKontingenFiles] = useState<{ bukti_dapodik_pd_dikti: File | null; bukti_pembayaran: File | null }>({
    bukti_dapodik_pd_dikti: null,
    bukti_pembayaran: null,
  });

  const [people, setPeople] = useState<PersonEntry[]>(makePeople(step1));

  const [athleteDocs, setAthleteDocs] = useState<PersonDocs[]>(Array.from({ length: step1.jumlahAtlet }).map(() => emptyDocs()));
  const [officialDocs, setOfficialDocs] = useState<PersonDocs[]>(Array.from({ length: step1.jumlahOfficial }).map(() => emptyDocs()));

  const [step3Ui, setStep3Ui] = useState<Step3UiState>({ tab: "KONTINGEN", view: "FORM", athleteIndex: 0, officialIndex: 0 });

  const step1Complete = Boolean(step1.sport && step1.jenjang && step1.jumlahAtlet >= 0 && step1.jumlahOfficial >= 0);
  const step2Complete = numbers.length > 0 && numbers.reduce((a, b) => a + b.jumlahAtlet, 0) <= step1.jumlahAtlet;

  const step3Complete = useMemo(() => {
    const kontingenOk =
      kontingen.namaPendaftar.trim() &&
      kontingen.sekolahInstansi.trim() &&
      kontingen.alamat.trim() &&
      kontingen.noWa.trim() &&
      kontingen.email.trim() &&
      kontingenFiles.bukti_dapodik_pd_dikti &&
      kontingenFiles.bukti_pembayaran;

    if (!kontingenOk) return false;

    for (let i = 0; i < step1.jumlahAtlet; i++) {
      const d = athleteDocs[i];
      const p = people.find((x) => x.role === "ATLET" && x.roleIndex === i);
      if (!p) return false;
      const dataOk = p.nama.trim() && p.tempatLahir.trim() && p.tanggalLahir.trim() && p.jenisKelamin && p.sekolah_instansi.trim() && p.noWa.trim() && p.email.trim();
      const docsOk = d?.ktp_kia && d?.kartu_pelajar_mahasiswa && d?.raport_khs && d?.bpjs && d?.pas_foto;
      if (!dataOk || !docsOk) return false;
    }

    for (let i = 0; i < step1.jumlahOfficial; i++) {
      const d = officialDocs[i];
      const p = people.find((x) => x.role === "OFFICIAL" && x.roleIndex === i);
      if (!p) return false;
      const dataOk = p.nama.trim() && p.tempatLahir.trim() && p.tanggalLahir.trim() && p.jenisKelamin && p.sekolah_instansi.trim() && p.noWa.trim() && p.email.trim();
      const docsOk = d?.ktp_kia && d?.kartu_pelajar_mahasiswa && d?.bpjs && d?.pas_foto;
      if (!dataOk || !docsOk) return false;
    }

    return true;
  }, [kontingen, kontingenFiles, athleteDocs, officialDocs, people, step1.jumlahAtlet, step1.jumlahOfficial]);

  const resetStep3Arrays = (next: Step1Data) => {
    setPeople(makePeople(next));
    setAthleteDocs(Array.from({ length: next.jumlahAtlet }).map(() => emptyDocs()));
    setOfficialDocs(Array.from({ length: next.jumlahOfficial }).map(() => emptyDocs()));
    setStep3Ui({ tab: "KONTINGEN", view: "FORM", athleteIndex: 0, officialIndex: 0 });
  };

  const updatePersonByRoleIndex = (role: "ATLET" | "OFFICIAL", roleIndex: number, patch: Partial<PersonEntry>) => {
    setPeople((prev) =>
      prev.map((p) => {
        if (p.role !== role || p.roleIndex !== roleIndex) return p;
        return { ...p, ...patch };
      })
    );
  };

  const onSubmit = () => {
    alert("Submit frontend preview OK. Nanti diganti FormData ke Laravel.");
  };

  return (
    <div className="max-w-6xl mx-auto px-4">
      <WizardStepsHeader step={step} step1Ok={step1Complete} step2Ok={step2Complete} step3Ok={step3Complete} />

      {step === 1 ? (
        <Step1Sport
          value={step1}
          onChange={(v) => {
            setStep1(v);
            resetStep3Arrays(v);
            setNumbers([]);
          }}
          onNext={() => setStep(2)}
          canNext={step1Complete}
        />
      ) : null}

      {step === 2 ? (
        <Step2Numbers
          step1={step1}
          value={numbers}
          onChange={setNumbers}
          onBack={() => setStep(1)}
          onNext={() => setStep(3)}
        />
      ) : null}

      {step === 3 ? (
        <Step3Entry
          step1={step1}
          numbers={numbers}
          step2Complete={step2Complete}
          step3Complete={step3Complete}
          fees={fees}
          bankInfo={BANK_INFO}
          kontingen={kontingen}
          setKontingen={setKontingen}
          kontingenFiles={kontingenFiles}
          setKontingenFiles={setKontingenFiles}
          people={people}
          updatePersonByRoleIndex={updatePersonByRoleIndex}
          athleteDocs={athleteDocs}
          setAthleteDocs={setAthleteDocs}
          officialDocs={officialDocs}
          setOfficialDocs={setOfficialDocs}
          step3Ui={step3Ui}
          setStep3Ui={setStep3Ui}
          onBack={() => setStep(2)}
          onSubmit={onSubmit}
        />
      ) : null}
    </div>
  );
}
