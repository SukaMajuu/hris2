import { Inter, Roboto } from "next/font/google";
import "./globals.css";
import AppQueryProvider from "./_components/AppQueryProvider";
import { Metadata } from "next";

const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
	display: "swap",
});

const roboto = Roboto({
	weight: ["400", "500", "700"],
	subsets: ["latin"],
	display: "swap",
	variable: "--font-roboto",
});

export const metadata: Metadata = {
	title: "HRIS",
	description: "A Human Resource Information System",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body
				className={`antialiased ${inter.variable} ${roboto.variable}`}
			>
				<AppQueryProvider>{children}</AppQueryProvider>
			</body>
		</html>
	);
}
