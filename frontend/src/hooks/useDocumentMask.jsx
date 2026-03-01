import { useMemo } from "react";

export const useDocumentMask = (value, setValue) => {

    const formatDocument = (input) => {
        const digits = input.replace(/\D/g, '');

        if (digits.length <= 11) {
            return digits
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        }

        return digits
            .slice(0, 14)
            .replace(/(\d{2})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1/$2')
            .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
    };

    const handleChange = (e) => {
        setValue(formatDocument(e.target.value));
    };

    const digits = value.replace(/\D/g, '');
    const isCNPJ = digits.length > 11;

    return useMemo(() => ({
        handleChange,
        label: "CPF/CNPJ",
        placeholder: isCNPJ
            ? "00.000.000/0000-00"
            : "000.000.000-00",
        maxLength: 18
    }), [isCNPJ]);
};