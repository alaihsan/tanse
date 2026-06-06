import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ShieldCheck, EyeOff, Users, HelpCircle, MessageSquareQuote, HeartHandshake } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Penanganan Masalah',
        href: '/penanganan-masalah',
    },
];

export default function ProblemHandlingIndex() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Penanganan Masalah" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
                        <HeartHandshake className="size-6 text-indigo-500" />
                        <span>Penanganan Masalah Disiplin Murid</span>
                    </h1>
                    <p className="text-neutral-550 dark:text-neutral-400 max-w-3xl">
                        Panduan dan prinsip praktis bimbingan konseling untuk guru dalam menyelesaikan pelanggaran murid secara edukatif, berkeadilan restoratif (Restorative Justice), dan menjaga martabat siswa.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Card 1: Mengulik Informasi Agar Murid Jujur */}
                    <Card className="border border-indigo-100 hover:shadow-md transition-all dark:border-neutral-800">
                        <CardHeader className="flex flex-row items-center gap-3.5 pb-2">
                            <div className="rounded-lg bg-indigo-50 p-2.5 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400">
                                <HelpCircle className="size-5" />
                            </div>
                            <div>
                                <CardTitle className="text-base font-bold">Mengulik Informasi Secara Persuasif</CardTitle>
                                <CardDescription className="text-xs">Strategi menggali kebenaran tanpa intimidasi</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="text-sm text-neutral-600 dark:text-neutral-350 space-y-2.5">
                            <p>
                                Menginterogasi murid dengan nada keras atau tuduhan langsung sering kali memicu mekanisme pertahanan diri berupa kebohongan atau sikap defensif. Gunakan teknik berikut:
                            </p>
                            <ul className="list-disc pl-5 space-y-1 text-xs">
                                <li><strong>Pendekatan Empati:</strong> Mulailah dengan menanyakan keadaan murid, membangun rapport, dan menunjukkan bahwa Anda di sini untuk membantu mereka bertumbuh, bukan sekadar menghukum.</li>
                                <li><strong>Pertanyaan Terbuka:</strong> Hindari pertanyaan Ya/Tidak. Ajukan pertanyaan reflektif seperti <em>"Bisa ceritakan apa yang sebenarnya terjadi dari sudut pandangmu?"</em></li>
                                <li><strong>Klarifikasi Konsekuensi Logis:</strong> Tekankan bahwa kejujuran akan sangat membantu meringankan solusi dan proses pembinaan selanjutnya.</li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Card 2: Menjaga Kerahasiaan Pelapor */}
                    <Card className="border border-indigo-100 hover:shadow-md transition-all dark:border-neutral-800">
                        <CardHeader className="flex flex-row items-center gap-3.5 pb-2">
                            <div className="rounded-lg bg-indigo-50 p-2.5 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400">
                                <EyeOff className="size-5" />
                            </div>
                            <div>
                                <CardTitle className="text-base font-bold">Menjaga Kerahasiaan Pelapor</CardTitle>
                                <CardDescription className="text-xs">Melindungi iklim disiplin yang aman di sekolah</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="text-sm text-neutral-600 dark:text-neutral-350 space-y-2.5">
                            <p>
                                Untuk mempertahankan keberanian komunitas sekolah dalam melaporkan pelanggaran, kerahasiaan identitas informan adalah harga mati.
                            </p>
                            <ul className="list-disc pl-5 space-y-1 text-xs">
                                <li><strong>Fokus pada Fakta Kejadian:</strong> Saat berbicara dengan siswa yang melanggar, rujuklah pada bukti fisik atau temuan langsung guru, bukan pernyataan saksi atau nama pelapor.</li>
                                <li><strong>Hindari Konfrontasi Saksi:</strong> Jangan sekali-kali mempertemukan pelapor dengan pelanggar dalam forum klasifikasi karena hal ini berisiko memicu intimidasi atau perundungan susulan.</li>
                                <li><strong>Penyimpanan Berkas Digital:</strong> Pastikan lampiran bukti laporan yang diunggah tidak mengekspos wajah atau tulisan tangan yang bisa mengidentifikasi pelapor.</li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Card 3: Penanganan Terpisah (Murid vs Orang Tua) */}
                    <Card className="border border-indigo-100 hover:shadow-md transition-all dark:border-neutral-800">
                        <CardHeader className="flex flex-row items-center gap-3.5 pb-2">
                            <div className="rounded-lg bg-indigo-50 p-2.5 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400">
                                <Users className="size-5" />
                            </div>
                            <div>
                                <CardTitle className="text-base font-bold">Hindari Pertemuan Langsung (Tensi Tinggi)</CardTitle>
                                <CardDescription className="text-xs">Mengelola komunikasi terpisah dengan orang tua</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="text-sm text-neutral-600 dark:text-neutral-350 space-y-2.5">
                            <p>
                                Mempertemukan langsung murid dengan orang tua di ruang BK saat emosi masih memuncak sering kali berakhir dengan kemarahan destruktif atau pembelaan buta.
                            </p>
                            <ul className="list-disc pl-5 space-y-1 text-xs">
                                <li><strong>Bicara Terpisah:</strong> Lakukan sesi wawancara terpisah terlebih dahulu. Dengar suara murid sendirian, lalu dengar ekspektasi dan kekhawatiran orang tua secara terpisah.</li>
                                <li><strong>Penyamaan Persepsi:</strong> Gunakan guru BK sebagai mediator objektif untuk menyampaikan temuan secara tenang tanpa menyudutkan salah satu pihak.</li>
                                <li><strong>Pertemuan Rekonsiliasi:</strong> Pertemuan bersama hanya dilakukan saat tensi sudah mereda, berfokus murni pada penandatanganan kesepakatan pembinaan dan solusi bersama.</li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Card 4: Dialog Bermakna (Menerima Sanksi dengan Sadar) */}
                    <Card className="border border-indigo-100 hover:shadow-md transition-all dark:border-neutral-800">
                        <CardHeader className="flex flex-row items-center gap-3.5 pb-2">
                            <div className="rounded-lg bg-indigo-50 p-2.5 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400">
                                <MessageSquareQuote className="size-5" />
                            </div>
                            <div>
                                <CardTitle className="text-base font-bold">Dialog Bermakna & Pemulihan Martabat</CardTitle>
                                <CardDescription className="text-xs">Menerima sanksi dengan sadar tanpa merasa dipermalukan</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="text-sm text-neutral-600 dark:text-neutral-350 space-y-2.5">
                            <p>
                                Tujuan utama penegakan aturan sekolah bukanlah menghukum (retributif), melainkan memulihkan hubungan dan tanggung jawab sosial murid (restoratif).
                            </p>
                            <ul className="list-disc pl-5 space-y-1 text-xs">
                                <li><strong>Koneksi Sebelum Koreksi:</strong> Jelaskan secara logis dampak pelanggaran mereka terhadap diri sendiri dan orang lain agar muncul penyesalan tulus.</li>
                                <li><strong>Sanksi yang Relevan:</strong> Buat sanksi yang berorientasi pada perbaikan dampak pelanggaran (misal: jika terlambat, mengganti waktu belajar; jika merusak fasilitas, membantu merapikannya).</li>
                                <li><strong>Jaga Kerahasiaan Sesi:</strong> Hindari memarahi atau menjatuhkan sanksi di depan umum (lapangan sekolah/kelas). Pembicaraan disiplin harus selalu bersifat privat di ruang BK atau ruang guru.</li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                {/* Restorative Quote */}
                <div className="mt-4 p-5 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-100 dark:border-neutral-800/80 flex items-start gap-4">
                    <ShieldCheck className="size-6 text-indigo-650 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-sm text-indigo-900 dark:text-indigo-300">Prinsip Utama Restorative Justice</h4>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 italic leading-relaxed">
                            "Disiplin positif bukan tentang membuat murid patuh karena takut akan hukuman, melainkan menumbuhkan kesadaran diri agar mereka memahami tanggung jawab sosial atas tindakan mereka, memperbaiki kesalahan yang terjadi, dan kembali ke komunitas sekolah dengan harga diri yang terjaga."
                        </p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
