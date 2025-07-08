import { fetchNui } from "@/utils/fetchNui";
import { setClipboard } from "@/utils/misc";
import { isRouteErrorResponse, useRouteError } from "react-router-dom";

export function ErrorBoundary() {
    const error = useRouteError();

    let title = "Something went wrong ";
    let message = "An unexpected error occurred.";
    let stack: string | undefined;

    if (isRouteErrorResponse(error)) {
        if (error.status === 404) {
            title = "404 - Page Not Found";
            message = "The page you're looking for doesn't exist.";
        } else {
            title = `Error ${error.status}`;
            message = error.statusText || message;
        }
    } else if (error instanceof Error) {
        message = error.message || message;
        stack = error.stack;
    } else if (typeof error === "string") {
        message = error;
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-slate-900/90 px-4">
            <div className="bg-slate-700/80 shadow-xl rounded-xl p-6 max-w-xl w-full border border-slate-600/80">
                <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>

                <p className="text-slate-200/80 mb-4 whitespace-pre-line">{message}</p>

                {stack && (
                    <details className="mb-4">
                        <summary className="cursor-pointer text-sm text-slate-200">
                            Technical details
                        </summary>
                        <pre className="bg-slate-700 p-4 rounded text-sm text-white overflow-auto max-h-60 whitespace-pre-wrap font-mono mt-2">
                            <code>{stack}</code>
                        </pre>
                    </details>
                )}
                <div className="flex gap-2 items-center w-full justify-end">
                    <button
                        onClick={() => setClipboard(`${title}\n\n${message}\n\n${stack || ""}`)}
                        className="mt-6 px-4 py-2 bg-blue-800 text-white rounded hover:bg-slate-700 transition"
                    >
                        Copy Error Details
                    </button>
                    <button
                        onClick={() => {
                            fetchNui('close')
                            window.location.reload();
                        }}
                        className="mt-6 px-4 py-2 bg-green-800 text-white rounded hover:bg-slate-700 transition"
                    >
                        Close UI
                    </button>
                </div>

            </div>
        </main>
    );
}
