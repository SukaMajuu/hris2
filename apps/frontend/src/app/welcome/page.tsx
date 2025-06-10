"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Crown, Users, Calendar, BarChart3 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useActivateTrial } from "@/api/mutations/subscription.mutation";
import { useAuthStore } from "@/stores/auth.store";
import { useQueryClient } from "@tanstack/react-query";

export default function WelcomePage() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const activateTrialMutation = useActivateTrial();
	const setIsNewUser = useAuthStore((state) => state.setIsNewUser);

	const handleStartTrial = async () => {
		try {
			console.log("Starting trial activation...");
			await activateTrialMutation.mutateAsync();
			console.log("Trial activation successful!");

			// Invalidate all subscription-related queries to refresh status
			await queryClient.invalidateQueries({
				queryKey: ["userSubscription"],
			});
			await queryClient.invalidateQueries({
				queryKey: ["subscriptionStatus"],
			});
			await queryClient.invalidateQueries({ queryKey: ["subscription"] });

			// Refetch subscription data immediately
			await queryClient.refetchQueries({
				queryKey: ["userSubscription"],
			});
			console.log("Subscription queries refreshed");

			setIsNewUser(false);
			console.log("isNewUser set to false");

			toast.success("Trial Anda telah aktif! Selamat datang di HRIS.");

			// Use longer delay to ensure subscription status is fully updated
			setTimeout(() => {
				console.log("Attempting redirect to dashboard...");
				try {
					window.location.href = "/dashboard";
				} catch (error) {
					console.warn(
						"window.location.href failed, trying router.replace",
						error
					);
					router.replace("/dashboard");
				}
			}, 2000);
		} catch (error) {
			console.error("Error activating trial:", error);
			toast.error(
				"Terjadi kesalahan saat mengaktifkan trial. Silakan coba lagi."
			);
		}
	};

	return (
		<div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-4">
			<Card className="w-full max-w-2xl shadow-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
				<CardContent className="p-8 text-center">
					{/* Welcome Header */}
					<div className="mb-8">
						<div className="flex justify-center mb-4">
							<div className="w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center">
								<Crown className="w-8 h-8 text-primary" />
							</div>
						</div>
						<h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
							Selamat Datang di Sistem HRIS Kami!
						</h1>
						<p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
							Mari kita siapkan dasbord Anda. Mulai dengan uji
							coba gratis 14 hari{" "}
							<span className="font-semibold text-primary">
								Paket Premium
							</span>{" "}
							kami untuk merasakan semua fitur terbaik tanpa
							batasan.
						</p>
					</div>

					{/* Premium Features Preview */}
					<div className="grid grid-cols-2 gap-4 mb-8">
						<div className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
							<CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
							<span className="text-sm font-medium text-slate-700 dark:text-slate-200">
								Manajemen Karyawan Unlimited
							</span>
						</div>
						<div className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
							<Users className="w-5 h-5 text-green-600 dark:text-green-400" />
							<span className="text-sm font-medium text-slate-700 dark:text-slate-200">
								Struktur Organisasi
							</span>
						</div>
						<div className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
							<Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
							<span className="text-sm font-medium text-slate-700 dark:text-slate-200">
								Sistem Absensi Canggih
							</span>
						</div>
						<div className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
							<BarChart3 className="w-5 h-5 text-green-600 dark:text-green-400" />
							<span className="text-sm font-medium text-slate-700 dark:text-slate-200">
								Laporan & Analytics
							</span>
						</div>
					</div>

					{/* Main CTA Button */}
					<Button
						onClick={handleStartTrial}
						disabled={activateTrialMutation.isPending}
						className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/80 text-white mb-4"
					>
						{activateTrialMutation.isPending
							? "Mengaktifkan Trial..."
							: "Mulai Trial Gratis Saya Sekarang!"}
					</Button>

					{/* Secondary Text */}
					<div className="text-center">
						<p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
							Tanpa perlu kartu kredit.{" "}
							<Link
								href="/subscription"
								className="text-primary hover:text-primary/80 font-medium underline"
							>
								Lihat semua paket langganan
							</Link>
						</p>
						<p className="text-xs text-slate-500 dark:text-slate-400">
							Trial berakhir otomatis setelah 14 hari. Tidak ada
							tagihan tersembunyi.
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
