"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "./button";

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
}

interface State {
	hasError: boolean;
	error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			hasError: false,
			error: null,
		};
	}

	public static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error("Uncaught error:", error, errorInfo);
	}

	public render() {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback;
			}

			return (
				<div className="flex flex-col items-center justify-center min-h-[400px] p-4 text-center">
					<h2 className="text-2xl font-bold mb-4">
						Something went wrong
					</h2>
					<p className="text-gray-600 mb-6">
						{this.state.error?.message ||
							"An unexpected error occurred"}
					</p>
					<Button
						onClick={() => {
							this.setState({ hasError: false, error: null });
							window.location.reload();
						}}
					>
						Try again
					</Button>
				</div>
			);
		}

		return this.props.children;
	}
}
