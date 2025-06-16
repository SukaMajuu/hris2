"use client";

const FullPageLoader = () => (
		<div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
			<div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent" />
		</div>
	);

export default FullPageLoader;
