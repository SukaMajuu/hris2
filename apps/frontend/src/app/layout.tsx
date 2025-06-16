import { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

import "./globals.css";
import AppQueryProvider from "./_components/AppQueryProvider";
import { AuthProvider } from "./_components/AuthProvider";

const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "HRIS",
	description: "A Human Resource Information System",
};

const RootLayout = ({ children }: { children: React.ReactNode }) => (
	<html lang="en">
		<body className={inter.variable} suppressHydrationWarning>
			<ErrorBoundary>
				<AppQueryProvider>
					<AuthProvider>
						<AuthGuard>{children}</AuthGuard>
						<Toaster />
					</AuthProvider>
				</AppQueryProvider>
			</ErrorBoundary>
		</body>
	</html>
);

export default RootLayout;
