import { useState } from "react";
import { useRouter } from "next/navigation";

export const useEditCheckClock = () => {
    const router = useRouter();
    const [form, setForm] = useState({
        name: "Sarah Connor",
        position: "CEO",
        type: "WFO",
        checkIn: "07:00",
        checkOut: "17:00",
        branch: "HQ Malang",
        radius: "50",
    });

    const handleCancel = () => {
        router.back();
    };

    const handleSave = () => {
        // Handle save logic here
        router.back();
    };

    // Handler untuk update form jika nanti ingin dibuat editable
    const updateForm = (field: string, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    return {
        form,
        handleCancel,
        handleSave,
        updateForm,
    };
};
