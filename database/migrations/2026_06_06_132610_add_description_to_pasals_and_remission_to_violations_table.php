<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('pasals', function (Blueprint $table) {
            $table->text('description')->nullable()->after('ayat');
        });

        Schema::table('violations', function (Blueprint $table) {
            $table->string('status')->default('aktif')->after('notes');
            $table->date('remission_date')->nullable()->after('status');
            $table->text('remission_notes')->nullable()->after('remission_date');
            $table->foreignId('remission_user_id')->nullable()->constrained('users')->onDelete('cascade')->after('remission_notes');
            $table->string('remission_attachment')->nullable()->after('remission_user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pasals', function (Blueprint $table) {
            $table->dropColumn('description');
        });

        Schema::table('violations', function (Blueprint $table) {
            $table->dropForeign(['remission_user_id']);
            $table->dropColumn(['status', 'remission_date', 'remission_notes', 'remission_user_id', 'remission_attachment']);
        });
    }
};
