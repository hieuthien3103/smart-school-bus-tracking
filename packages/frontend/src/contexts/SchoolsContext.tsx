import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export type School = {
    id: string;
    name: string;
    address?: string;
    city?: string;
    phone?: string;
    [key: string]: any;
};

type CreateSchoolPayload = Omit<School, "id">;
type UpdateSchoolPayload = Partial<Omit<School, "id">> & { id: string };

type SchoolsContextValue = {
    schools: School[];
    selectedSchool?: School | null;
    loading: boolean;
    error?: string | null;
    loadSchools: () => Promise<void>;
    selectSchool: (id: string | null) => void;
    addSchool: (payload: CreateSchoolPayload) => Promise<School | null>;
    updateSchool: (payload: UpdateSchoolPayload) => Promise<School | null>;
    deleteSchool: (id: string) => Promise<boolean>;
    clearError: () => void;
};

const SchoolsContext = createContext<SchoolsContextValue | undefined>(undefined);

export const SchoolsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [schools, setSchools] = useState<School[]>([]);
    const [selectedSchool, setSelectedSchool] = useState<School | null | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const apiBase = "/api/schools"; // sửa nếu cần

    const handleError = (err: unknown) => {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
        setLoading(false);
        return message;
    };

    const loadSchools = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(apiBase);
            if (!res.ok) throw new Error(`Failed to load schools (${res.status})`);
            const data: School[] = await res.json();
            setSchools(data);
            setLoading(false);
        } catch (err) {
            handleError(err);
        }
    }, [apiBase]);

    const selectSchool = useCallback(
        (id: string | null) => {
            if (!id) {
                setSelectedSchool(null);
                return;
            }
            const found = schools.find((s) => s.id === id) || null;
            setSelectedSchool(found);
        },
        [schools]
    );

    const addSchool = useCallback(
        async (payload: CreateSchoolPayload) => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(apiBase, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                if (!res.ok) throw new Error(`Failed to add school (${res.status})`);
                const created: School = await res.json();
                setSchools((prev) => [created, ...prev]);
                setLoading(false);
                return created;
            } catch (err) {
                handleError(err);
                return null;
            }
        },
        [apiBase]
    );

    const updateSchool = useCallback(
        async (payload: UpdateSchoolPayload) => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`${apiBase}/${encodeURIComponent(payload.id)}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                if (!res.ok) throw new Error(`Failed to update school (${res.status})`);
                const updated: School = await res.json();
                setSchools((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
                setSelectedSchool((cur) => (cur && cur.id === updated.id ? updated : cur));
                setLoading(false);
                return updated;
            } catch (err) {
                handleError(err);
                return null;
            }
        },
        [apiBase]
    );

    const deleteSchool = useCallback(
        async (id: string) => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`${apiBase}/${encodeURIComponent(id)}`, {
                    method: "DELETE",
                });
                if (!res.ok) throw new Error(`Failed to delete school (${res.status})`);
                setSchools((prev) => prev.filter((s) => s.id !== id));
                setSelectedSchool((cur) => (cur && cur.id === id ? null : cur));
                setLoading(false);
                return true;
            } catch (err) {
                handleError(err);
                return false;
            }
        },
        [apiBase]
    );

    const clearError = useCallback(() => setError(null), []);

    useEffect(() => {
        // tự động load khi mount
        loadSchools().catch(() => {});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const value: SchoolsContextValue = {
        schools,
        selectedSchool,
        loading,
        error,
        loadSchools,
        selectSchool,
        addSchool,
        updateSchool,
        deleteSchool,
        clearError,
    };

    return <SchoolsContext.Provider value={value}>{children}</SchoolsContext.Provider>;
};

export const useSchools = (): SchoolsContextValue => {
    const ctx = useContext(SchoolsContext);
    if (!ctx) throw new Error("useSchools must be used within a SchoolsProvider");
    return ctx;
};