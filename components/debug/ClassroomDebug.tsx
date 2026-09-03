// components/debug/ClassroomDebug.tsx - Temporary debug component
"use client";

import { useClassrooms } from "@/lib/hooks/api-hooks";

export default function ClassroomDebug() {
    const {
        data: classroomsResponse,
        isLoading: classroomsLoading,
        error: classroomsError,
        isError,
    } = useClassrooms();

    if (process.env.NODE_ENV !== "development") {
        return null; // Only show in development
    }

    return (
        <div className="fixed right-4 bottom-4 z-50 max-w-md rounded-lg bg-gray-900 p-4 text-white shadow-lg">
            <h3 className="mb-2 text-lg font-bold">🔍 Classrooms Debug</h3>

            <div className="space-y-2 text-sm">
                <div>
                    <strong>Loading:</strong> {classroomsLoading ? "Yes" : "No"}
                </div>

                <div>
                    <strong>Error:</strong> {isError ? "Yes" : "No"}
                </div>

                {classroomsError && (
                    <div>
                        <strong>Error Details:</strong>
                        <pre className="mt-1 max-h-20 overflow-auto rounded bg-red-900 p-2 text-xs">
                            {JSON.stringify(classroomsError, null, 2)}
                        </pre>
                    </div>
                )}

                <div>
                    <strong>Response Type:</strong> {typeof classroomsResponse}
                </div>

                <div>
                    <strong>Has Data:</strong>{" "}
                    {classroomsResponse?.data ? "Yes" : "No"}
                </div>

                <div>
                    <strong>Data Length:</strong>{" "}
                    {classroomsResponse?.data?.length || 0}
                </div>

                {classroomsResponse && (
                    <div>
                        <strong>Full Response:</strong>
                        <pre className="mt-1 max-h-32 overflow-auto rounded bg-gray-800 p-2 text-xs">
                            {JSON.stringify(classroomsResponse, null, 2)}
                        </pre>
                    </div>
                )}

                {classroomsResponse?.data &&
                    classroomsResponse.data.length > 0 && (
                        <div>
                            <strong>First Classroom:</strong>
                            <pre className="mt-1 max-h-20 overflow-auto rounded bg-blue-900 p-2 text-xs">
                                {JSON.stringify(
                                    classroomsResponse.data[0],
                                    null,
                                    2
                                )}
                            </pre>
                        </div>
                    )}
            </div>
        </div>
    );
}
