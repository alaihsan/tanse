import { useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Printer, ArrowLeft } from 'lucide-react';

interface Classroom {
    id: number;
    name: string;
}

interface Student {
    id: number;
    name: string;
    nis: string | null;
    classroom: Classroom;
}

interface Pasal {
    id: number;
    name: string;
    ayat: string | null;
    sub_ayat: string | null;
    deskripsi_ayat: string | null;
    description: string | null;
    keterangan: string | null;
    level: 'ringan' | 'sedang' | 'berat';
    sanction: string;
}

interface Teacher {
    id: number;
    name: string;
}

interface Violation {
    id: number;
    student_id: number;
    pasal_id: number;
    notes: string | null;
    violation_date: string;
    student: Student;
    pasal: Pasal;
    user: Teacher;
}

interface Props {
    violation: Violation;
}

export default function ViolationPrint({ violation }: Props) {
    useEffect(() => {
        // Auto trigger print after rendering
        const timer = setTimeout(() => {
            window.print();
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    const handlePrint = () => {
        window.print();
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const getTodayDate = () => {
        return new Date().toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    return (
        <div className="min-h-screen bg-neutral-100 p-0 sm:p-6 print:bg-white print:p-0">
            <Head title={`Cetak SP - ${violation.student.name}`} />

            {/* Print control bar (hidden on print) */}
            <div className="max-w-3xl mx-auto mb-4 p-4 bg-white shadow-md rounded-xl flex items-center justify-between print:hidden">
                <Button variant="ghost" onClick={() => window.close()} className="flex items-center gap-1.5">
                    <ArrowLeft className="size-4" />
                    Tutup Halaman
                </Button>
                <Button onClick={handlePrint} className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700">
                    <Printer className="size-4" />
                    Cetak Surat
                </Button>
            </div>

            {/* Warning Letter Sheet */}
            <div className="max-w-3xl mx-auto bg-white p-10 shadow-lg border print:shadow-none print:border-none print:p-0 min-h-[297mm]">
                
                {/* Letterhead (Kop Surat) */}
                <div className="w-full text-center pb-2">
                    <img 
                        src="/kop_al_azhar.jpg" 
                        alt="Kop Surat Al Azhar" 
                        className="w-full h-auto max-h-[120px] object-contain mx-auto"
                    />
                </div>

                {/* Letter Title */}
                <div className="mt-8 text-center space-y-1">
                    <h2 className="text-lg font-bold uppercase tracking-wide underline decoration-neutral-900 decoration-2">
                        SURAT PERINGATAN PELANGGARAN DISIPLIN SISWA
                    </h2>
                    <p className="text-xs text-neutral-600 font-mono">
                        Nomor: SP/{violation.id}/SMP-IA22/{new Date().getFullYear()}
                    </p>
                </div>

                {/* Letter Body */}
                <div className="mt-8 space-y-6 text-sm text-neutral-900 leading-relaxed">
                    <p>Assalamu'alaikum Warahmatullahi Wabarakatuh,</p>
                    
                    <p>
                        Dengan ini, pihak Sekolah Menengah Pertama Islam Al Azhar 22 menerangkan bahwa siswa yang tercantum di bawah ini:
                    </p>

                    {/* Student details */}
                    <div className="grid grid-cols-12 gap-x-2 gap-y-1.5 px-6 font-medium">
                        <span className="col-span-3 text-neutral-500">Nama Siswa</span>
                        <span className="col-span-1 text-center">:</span>
                        <span className="col-span-8 font-bold text-neutral-900">{violation.student.name}</span>

                        <span className="col-span-3 text-neutral-500">NIS</span>
                        <span className="col-span-1 text-center">:</span>
                        <span className="col-span-8 font-mono">{violation.student.nis || '-'}</span>

                        <span className="col-span-3 text-neutral-500">Kelas</span>
                        <span className="col-span-1 text-center">:</span>
                        <span className="col-span-8">{violation.student.classroom.name}</span>

                        <span className="col-span-3 text-neutral-500">Tanggal Kejadian</span>
                        <span className="col-span-1 text-center">:</span>
                        <span className="col-span-8">{formatDate(violation.violation_date)}</span>
                    </div>

                    <p>
                        Telah melakukan tindakan pelanggaran terhadap peraturan tata tertib sekolah, dengan rincian sebagai berikut:
                    </p>

                    {/* Infraction Details */}
                    <div className="border border-neutral-300 rounded-lg p-4 bg-neutral-50/50 space-y-2.5">
                        <div className="grid grid-cols-12 gap-x-2">
                            <span className="col-span-3 font-semibold text-neutral-600">Aturan/Pasal</span>
                            <span className="col-span-1 text-center">:</span>
                            <span className="col-span-8 font-bold text-neutral-800">{violation.pasal.name} {violation.pasal.ayat && `(${violation.pasal.ayat}${violation.pasal.sub_ayat ? ` - ${violation.pasal.sub_ayat}` : ''})`}</span>
                        </div>
                        {violation.pasal.description && (
                            <div className="grid grid-cols-12 gap-x-2">
                                <span className="col-span-3 font-semibold text-neutral-600">Isi Pasal</span>
                                <span className="col-span-1 text-center">:</span>
                                <span className="col-span-8 text-neutral-800">{violation.pasal.description}</span>
                            </div>
                        )}
                        {violation.pasal.deskripsi_ayat && (
                            <div className="grid grid-cols-12 gap-x-2">
                                <span className="col-span-3 font-semibold text-neutral-600">Deskripsi Ayat</span>
                                <span className="col-span-1 text-center">:</span>
                                <span className="col-span-8 text-neutral-800">{violation.pasal.deskripsi_ayat}</span>
                            </div>
                        )}
                        {violation.pasal.keterangan && (
                            <div className="grid grid-cols-12 gap-x-2">
                                <span className="col-span-3 font-semibold text-neutral-600">Keterangan</span>
                                <span className="col-span-1 text-center">:</span>
                                <span className="col-span-8 text-neutral-800">{violation.pasal.keterangan}</span>
                            </div>
                        )}
                        <div className="grid grid-cols-12 gap-x-2">
                            <span className="col-span-3 font-semibold text-neutral-600">Tingkat</span>
                            <span className="col-span-1 text-center">:</span>
                            <span className="col-span-8 capitalize font-semibold text-neutral-800">{violation.pasal.level}</span>
                        </div>
                        <div className="grid grid-cols-12 gap-x-2">
                            <span className="col-span-3 font-semibold text-neutral-600">Sanksi Disiplin</span>
                            <span className="col-span-1 text-center">:</span>
                            <span className="col-span-8 text-neutral-850">{violation.pasal.sanction}</span>
                        </div>
                        {violation.notes && (
                            <div className="grid grid-cols-12 gap-x-2 border-t pt-2 mt-2">
                                <span className="col-span-3 font-semibold text-neutral-600">Catatan Guru</span>
                                <span className="col-span-1 text-center">:</span>
                                <span className="col-span-8 italic text-neutral-700">"{violation.notes}"</span>
                            </div>
                        )}
                    </div>

                    <p>
                        Surat peringatan ini diterbitkan sebagai wujud pembinaan karakter dan disiplin siswa secara objektif. Kami mengharapkan kerja sama yang baik antara pihak sekolah, wali kelas, serta orang tua/wali murid agar dapat mendampingi, memantau, dan membimbing siswa tersebut demi kebaikan proses pendidikannya di masa mendatang.
                    </p>

                    <p>Wassalamu'alaikum Warahmatullahi Wabarakatuh,</p>
                </div>

                {/* Date & Signature Blocks */}
                <div className="mt-12 space-y-12">
                    <div className="text-right text-sm">
                        Jakarta, {formatDate(violation.violation_date)}
                    </div>

                    <div className="grid grid-cols-3 text-center text-xs font-semibold gap-4 leading-normal">
                        <div className="flex flex-col justify-between h-32">
                            <p className="uppercase tracking-wider">Orang Tua / Wali Murid</p>
                            <div>
                                <p className="border-t border-dashed border-neutral-400 pt-1.5 mx-4">(..................................)</p>
                            </div>
                        </div>
                        <div className="flex flex-col justify-between h-32">
                            <p className="uppercase tracking-wider">Wali Kelas</p>
                            <div>
                                <p className="border-t border-dashed border-neutral-400 pt-1.5 mx-4">(..................................)</p>
                            </div>
                        </div>
                        <div className="flex flex-col justify-between h-32">
                            <p className="uppercase tracking-wider">Ketua Tanse / BK</p>
                            <div>
                                <p className="border-t border-dashed border-neutral-400 pt-1.5 mx-4 font-bold">({violation.user.name})</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
