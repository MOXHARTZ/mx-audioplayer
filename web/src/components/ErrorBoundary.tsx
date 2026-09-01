import { useRouteError } from 'react-router-dom';

const ErrorBoundary = () => {
    const error = useRouteError() as Error | undefined;
    return (
        <div className="w-full h-full flex items-center justify-center p-6">
            <div className="bezel max-w-md p-6 text-center">
                <p className="red-subtitle mb-3">Something went wrong</p>
                <p className="text-xs text-bone-4 break-all">{error?.message ?? 'Unknown error'}</p>
            </div>
        </div>
    );
};

export default ErrorBoundary;
