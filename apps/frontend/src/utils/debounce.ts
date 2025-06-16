/**
 * Creates a debounced function that delays invoking func until after delay milliseconds
 * have elapsed since the last time the debounced function was invoked.
 *
 * @param func - The function to debounce
 * @param delay - The number of milliseconds to delay
 * @returns The debounced function
 */
const debounce = <T extends (...args: Parameters<T>) => ReturnType<T>>(
	func: T,
	delay: number
): T => {
	let timeoutId: NodeJS.Timeout;
	return ((...args: Parameters<T>) => {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => func(...args), delay);
	}) as T;
};

export { debounce };
