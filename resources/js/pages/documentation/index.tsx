import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BookOpen, GraduationCap, Scale, ShieldAlert, HeartHandshake, BarChart3, LayoutGrid, ClipboardList } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Dokumentasi',
        href: '/dokumentasi',
    },
];

export default function DocumentationIndex() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dokumentasi Aplikasi" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
                        <BookOpen className="size-6 text-indigo-500" />
                        <span>Dokumentasi & Panduan Pengguna</span>
                    </h1>
                    <p className="text-neutral-550 dark:text-neutral-400 max-w-3xl">
                        Selamat datang di Panduan Resmi **Tanse Alsen 22**. Pelajari cara menggunakan seluruh menu dan fitur aplikasi untuk mencatat, melacak, dan membina kedisiplinan murid dengan benar.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* 1. Dashboard */}
                    <Card className="border hover:shadow-md transition-all">
                        <CardHeader className="flex flex-row items-center gap-3 pb-2">
                            <div className="rounded-lg bg-neutral-100 p-2 text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400">
                                <LayoutGrid className="size-5" />
                            </div>
                            <div>
                                <CardTitle className="text-base font-bold">1. Dashboard Utama</CardTitle>
                                <CardDescription className="text-xs">Pusat informasi ringkas</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="text-xs text-neutral-600 dark:text-neutral-450 space-y-2 leading-relaxed">
                            <p>
                                Halaman pertama setelah login. Didesain untuk memberikan pandangan cepat mengenai status ketertiban sekolah tanpa menyajikan data yang terlalu rumit.
                            </p>
                            <ul className="list-disc pl-4 space-y-1">
                               <li>Halaman ini menampilkan ringkasan performa kedisiplinan sekolah.</li>
                               <li>Menampilkan jalan pintas cepat untuk mencatat pelanggaran atau memantau daftar kelas.</li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* 2. Kelola Kelas */}
                    <Card className="border hover:shadow-md transition-all">
                        <CardHeader className="flex flex-row items-center gap-3 pb-2">
                            <div className="rounded-lg bg-neutral-100 p-2 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400">
                                <GraduationCap className="size-5" />
                            </div>
                            <div>
                                <CardTitle className="text-base font-bold">2. Kelola Kelas & Murid</CardTitle>
                                <CardDescription className="text-xs">Manajemen data kelas & siswa</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="text-xs text-neutral-600 dark:text-neutral-450 space-y-2 leading-relaxed">
                            <p>
                                Menu untuk mendaftarkan kelas dan menginput daftar siswa. Mendukung metode import mutakhir dari spreadsheet.
                            </p>
                            <ul className="list-disc pl-4 space-y-1">
                                <li><strong>Tambah Kelas:</strong> Buat nama kelas baru (misal: X IPA 1).</li>
                                <li><strong>Import Excel:</strong> Salin (Ctrl+C) kolom NIS dan Nama siswa dari file Microsoft Excel Anda, lalu paste di kotak teks yang disediakan untuk mengimport secara bulk.</li>
                                <li><strong>Mutasi Kelas:</strong> Pindahkan murid yang pindah kelas dengan mengklik tombol ikon transfer. Seluruh riwayat pelanggarannya akan tetap melekat pada murid tersebut.</li>
                                <li><strong>Riwayat Siswa:</strong> Klik nama siswa untuk melihat rekam jejak pelanggaran lengkap dengan nama guru pelapor.</li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* 3. Kelola Pasal */}
                    <Card className="border hover:shadow-md transition-all">
                        <CardHeader className="flex flex-row items-center gap-3 pb-2">
                            <div className="rounded-lg bg-neutral-100 p-2 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400">
                                <Scale className="size-5" />
                            </div>
                            <div>
                                <CardTitle className="text-base font-bold">3. Kelola Pasal & Aturan</CardTitle>
                                <CardDescription className="text-xs">Konfigurasi poin pelanggaran</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="text-xs text-neutral-600 dark:text-neutral-450 space-y-2 leading-relaxed">
                            <p>
                                Menu untuk menyusun peraturan tata tertib sekolah beserta konsekuensi hukumannya.
                            </p>
                            <ul className="list-disc pl-4 space-y-1">
                                <li><strong>Nama Pasal & Ayat:</strong> Klasifikasikan pelanggaran berdasarkan klausul yang sah.</li>
                                <li><strong>Level Pelanggaran:</strong> Pilih tingkat keseriusan: <em>Ringan</em>, <em>Sedang</em>, atau <em>Berat</em>.</li>
                                <li><strong>Deskripsi & Sanksi:</strong> Tulis deskripsi lengkap aturan beserta sanksi edukatif yang akan dijatuhkan jika melanggar.</li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* 4. Input Pelanggaran */}
                    <Card className="border hover:shadow-md transition-all">
                        <CardHeader className="flex flex-row items-center gap-3 pb-2">
                            <div className="rounded-lg bg-neutral-100 p-2 text-red-655 dark:bg-red-950/30 dark:text-red-400">
                                <ShieldAlert className="size-5" />
                            </div>
                            <div>
                                <CardTitle className="text-base font-bold">4. Input Pelanggaran</CardTitle>
                                <CardDescription className="text-xs">Pencatatan pelanggaran aktif</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="text-xs text-neutral-600 dark:text-neutral-450 space-y-2 leading-relaxed">
                            <p>
                                Formulir pencatatan kejadian pelanggaran murid secara real-time.
                            </p>
                            <ul className="list-disc pl-4 space-y-1">
                                <li><strong>Pilih Murid & Pasal:</strong> Filter kelas terlebih dahulu untuk mencari nama siswa, lalu tentukan pasal pelanggarannya.</li>
                                <li><strong>Unggah Multi Berkas:</strong> Anda dapat mengunggah satu atau lebih file bukti pendukung (PDF, JPG, PNG) berukuran maksimal 2MB per berkas.</li>
                                <li><strong>Attribution:</strong> Sistem secara otomatis mencatat nama guru yang menginput log sebagai bentuk transparansi dan tanggung jawab.</li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* 5. Remisi Pelanggaran */}
                    <Card className="border hover:shadow-md transition-all">
                        <CardHeader className="flex flex-row items-center gap-3 pb-2">
                            <div className="rounded-lg bg-neutral-100 p-2 text-green-600 dark:bg-green-950/30 dark:text-green-400">
                                <HeartHandshake className="size-5" />
                            </div>
                            <div>
                                <CardTitle className="text-base font-bold">5. Remisi Pelanggaran</CardTitle>
                                <CardDescription className="text-xs">Pemulihan status disiplin siswa</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="text-xs text-neutral-600 dark:text-neutral-450 space-y-2 leading-relaxed">
                            <p>
                                Digunakan setelah murid menjalani pembinaan atau hukuman edukatif untuk memulihkan statusnya menjadi bersih kembali.
                            </p>
                            <ul className="list-disc pl-4 space-y-1">
                                <li><strong>Beri Remisi:</strong> Klik tombol remisi pada pelanggaran aktif siswa.</li>
                                <li><strong>Catatan Pembinaan:</strong> Isi alasan remisi (misal: "Siswa telah mengikuti pembinaan akhlak dan berjanji tidak mengulangi").</li>
                                <li><strong>Unggah Bukti Remisi:</strong> Lampirkan foto kegiatan perbaikan atau dokumen PDF surat pernyataan komitmen siswa.</li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* 6. Statistik Pelanggaran */}
                    <Card className="border hover:shadow-md transition-all">
                        <CardHeader className="flex flex-row items-center gap-3 pb-2">
                            <div className="rounded-lg bg-neutral-100 p-2 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400">
                                <BarChart3 className="size-5" />
                            </div>
                            <div>
                                <CardTitle className="text-base font-bold">6. Statistik & Analisis</CardTitle>
                                <CardDescription className="text-xs">Laporan tren & grafik visual</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="text-xs text-neutral-600 dark:text-neutral-450 space-y-2 leading-relaxed">
                            <p>
                                Menyajikan visualisasi data untuk membantu konselor menganalisis perkembangan ketertiban sekolah secara makro.
                            </p>
                            <ul className="list-disc pl-4 space-y-1">
                                <li><strong>Tren Bulanan:</strong> Grafik bar interaktif perkembangan kasus pelanggaran per bulan.</li>
                                <li><strong>Rasio Remisi:</strong> Persentase keberhasilan pembinaan disiplin sekolah.</li>
                                <li><strong>Daftar Ranking:</strong> Informasi kelas dan siswa yang paling sering melanggar untuk mempermudah pemetaan prioritas bimbingan.</li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
